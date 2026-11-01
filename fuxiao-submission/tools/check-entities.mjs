/**
 * 实体访问器自检：service 中变量. getX()/setX() 是否真的存在于对应实体。
 *   node tools/check-entities.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../backend/src/main/java/com/fuxiao/submission");
const entityDir = path.join(root, "entity");
const serviceDir = path.join(root, "service");

const entities = new Map();

function lcFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

for (const file of fs.readdirSync(entityDir)) {
  if (!file.endsWith(".java")) continue;
  const source = fs.readFileSync(path.join(entityDir, file), "utf8");
  const name = path.basename(file, ".java");
  const fields = new Set();
  for (const match of source.matchAll(/(?:private|protected)\s+(?!final)[\w<>\[\],.?]+\s+(\w+)\s*(?:=[^;]+)?;/g)) {
    fields.add(lcFirst(match[1]));
  }
  const declared = new Set();
  for (const match of source.matchAll(/(?:public|protected)\s+[\w<>\[\],.?]+\s+(\w+)\s*\(/g)) {
    declared.add(match[1]);
  }
  entities.set(name, { fields, declared });
}

const problems = [];
let checked = 0;

for (const file of fs.readdirSync(serviceDir)) {
  if (!file.endsWith(".java")) continue;
  const source = fs.readFileSync(path.join(serviceDir, file), "utf8");
  const rel = `service/${file}`;
  const variables = new Map();

  for (const [entityName, info] of entities) {
    const typeRe = new RegExp(`\\b${entityName}\\s+(\\w+)`, "g");
    for (const match of source.matchAll(typeRe)) {
      variables.set(match[1], entityName);
    }
    // 泛型中的实体，例如 List<Article> articles
    const listRe = new RegExp(`List<${entityName}>\\s+(\\w+)`, "g");
    for (const match of source.matchAll(listRe)) {
      variables.set(match[1], entityName);
    }
  }

  for (const match of source.matchAll(/\b(\w+)\.(get|set)([A-Z]\w*)\s*\(/g)) {
    const receiver = match[1];
    const kind = match[2];
    const rawSuffix = match[3];
    const entityName = variables.get(receiver);
    if (!entityName) continue;
    const info = entities.get(entityName);
    const accessor = `${kind}${rawSuffix}`;
    const field = lcFirst(rawSuffix);
    if (info.declared.has(accessor)) {
      checked += 1;
      continue;
    }
    if (kind === "get" && info.fields.has(field)) {
      checked += 1;
      continue;
    }
    if (kind === "set" && info.fields.has(field)) {
      checked += 1;
      continue;
    }
    problems.push(`${rel}: ${entityName} ${receiver}.${accessor}() 对应的字段不存在`);
  }
}

console.log(`checked ${entities.size} entities, ${checked} accessor calls`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("OK：实体 getter/setter 调用都能找到字段");
