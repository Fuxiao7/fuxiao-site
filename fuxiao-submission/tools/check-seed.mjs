/**
 * 演示数据自检：不依赖 MySQL，检查 data.sql 的字段数、引号闭合与 JSON 列可解析性。
 *   node tools/check-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(__dirname, "../db/data.sql");
const sql = fs.readFileSync(file, "utf8");
const lines = sql.split(/\r?\n/);

const JSON_COLS = {
  article: new Set(["tags", "blocks"]),
  album: new Set(["meta", "specs", "why", "quote", "story", "story_quote", "process", "run1", "run2"]),
  moment: new Set(["body", "images"]),
  project: new Set(["spec", "images", "tags"]),
  about_profile: new Set(["bio", "cols", "credits"]),
};

function splitValues(input) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === "'" && input[i + 1] === "'") { cur += "''"; i += 1; continue; }
      if (ch === "'") { quoted = false; cur += ch; continue; }
      cur += ch;
    } else if (ch === "'") {
      quoted = true;
      cur += ch;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (quoted) throw new Error("unterminated quote");
  out.push(cur.trim());
  return out;
}

function decode(token) {
  if (token === "NULL") return null;
  if (!token.startsWith("'") || !token.endsWith("'")) return token;
  return token.slice(1, -1).replace(/''/g, "'").replace(/\\\\/g, "\\");
}

const errors = [];
let inserts = 0;
lines.forEach((line, idx) => {
  const m = /^INSERT INTO (\w+) \(([^)]+)\) VALUES \((.*)\);$/.exec(line.trim());
  if (!m) return;
  const [, table, colsRaw, valsRaw] = m;
  const cols = colsRaw.split(",").map((c) => c.trim());
  let vals;
  try {
    vals = splitValues(valsRaw);
  } catch (e) {
    errors.push(`${table} line ${idx + 1}: ${e.message}`);
    return;
  }
  if (cols.length !== vals.length) {
    errors.push(`${table} line ${idx + 1}: ${cols.length} columns vs ${vals.length} values`);
    return;
  }
  cols.forEach((col, i) => {
    if (!JSON_COLS[table]?.has(col)) return;
    const raw = decode(vals[i]);
    if (raw === null) return;
    try {
      JSON.parse(raw);
    } catch (e) {
      errors.push(`${table}.${col} line ${idx + 1}: invalid JSON (${e.message})`);
    }
  });
  inserts += 1;
});

/* 额外检查：所有中文 JSON 里被 SQL 转义的双反斜杠能还原 */
const sample = lines.find((l) => l.startsWith("INSERT INTO article"));
if (sample && !sample.includes("\\\\n")) {
  errors.push("code block newlines look wrong (expected escaped \\\\n in SQL)");
}

console.log(`checked ${inserts} INSERT statements`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("OK：字段数、引号与 JSON 列全部通过");
