/**
 * 数据库 / 实体一致性自检：schema.sql 的列与 JPA 实体字段映射是否对得上。
 *   node tools/check-schema.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const schema = fs.readFileSync(path.join(root, "db/schema.sql"), "utf8");
const tables = new Map();

for (const match of schema.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\) ENGINE=/g)) {
  const name = match[1];
  const columns = new Set();
  for (const line of match[2].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^(PRIMARY|UNIQUE|KEY|CONSTRAINT|INDEX)\b/i.test(trimmed)) continue;
    const col = /^([a-z_][\w]*)\s+/i.exec(trimmed);
    if (col) columns.add(col[1]);
  }
  tables.set(name, columns);
}

function snake(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

const problems = [];
const entityDir = path.join(root, "backend/src/main/java/com/fuxiao/submission/entity");
const entities = [];

for (const file of fs.readdirSync(entityDir)) {
  if (!file.endsWith(".java")) continue;
  const source = fs.readFileSync(path.join(entityDir, file), "utf8");
  const table = /@Table\(name\s*=\s*"(\w+)"/.exec(source)?.[1];
  if (!table) continue;
  const fields = [];
  const fieldRe = /private\s+(?!final)([\w<>\[\],.?]+)\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
  for (const match of source.matchAll(fieldRe)) {
    const index = match.index;
    const before = source.slice(Math.max(0, index - 260), index);
    const lastFieldEnd = Math.max(before.lastIndexOf(";"), 0);
    const annotations = before.slice(lastFieldEnd);
    if (annotations.includes("@Transient")) continue;
    const column = /@Column\([^)]*name\s*=\s*"(\w+)"/.exec(annotations)?.[1] || snake(match[2]);
    fields.push({ field: match[2], column });
  }
  entities.push({ file, table, fields });
}

for (const entity of entities) {
  const columns = tables.get(entity.table);
  if (!columns) {
    problems.push(`${entity.file}: schema 里没有表 ${entity.table}`);
    continue;
  }
  for (const field of entity.fields) {
    if (!columns.has(field.column)) {
      problems.push(`${entity.file}: 字段 ${field.field} → 列 ${field.column} 在 ${entity.table} 里不存在`);
    }
  }
}

/* data.sql 里 INSERT 的列也必须在 schema 中存在 */
const data = fs.readFileSync(path.join(root, "db/data.sql"), "utf8");
for (const match of data.matchAll(/INSERT INTO (\w+) \(([^)]+)\) VALUES/g)) {
  const table = match[1];
  const columns = tables.get(table);
  if (!columns) {
    problems.push(`data.sql: schema 里没有表 ${table}`);
    continue;
  }
  for (const raw of match[2].split(",")) {
    const column = raw.trim();
    if (!columns.has(column)) {
      problems.push(`data.sql: ${table}.${column} 在 schema 里不存在`);
    }
  }
}

console.log(`checked ${entities.length} entities, ${tables.size} tables`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("OK：实体字段、schema 列、data.sql 列三方一致");
