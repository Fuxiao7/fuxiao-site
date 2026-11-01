/**
 * 后端源码静态自检（没有 JDK 时的替代品）：
 * 1. 括号/花括号是否平衡（跳过字符串、字符与注释）
 * 2. 每个 import 是否在正文中被使用
 * 3. public 类型名是否与文件名一致
 *   node tools/check-java.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../backend/src/main/java");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".java")) out.push(full);
  }
  return out;
}

function strip(src) {
  let out = "";
  let state = "code";
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];
    if (state === "code") {
      if (ch === "/" && next === "/") { state = "line"; out += "  "; i += 1; continue; }
      if (ch === "/" && next === "*") { state = "block"; out += "  "; i += 1; continue; }
      if (ch === '"') { state = "string"; out += " "; continue; }
      if (ch === "'") { state = "char"; out += " "; continue; }
      out += ch;
    } else if (state === "line") {
      if (ch === "\n") { state = "code"; out += "\n"; } else out += " ";
    } else if (state === "block") {
      if (ch === "*" && next === "/") { state = "code"; out += "  "; i += 1; }
      else out += ch === "\n" ? "\n" : " ";
    } else if (state === "string" || state === "char") {
      const quote = state === "string" ? '"' : "'";
      if (ch === "\\") { out += "  "; i += 1; continue; }
      if (ch === quote) { state = "code"; out += " "; continue; }
      out += ch === "\n" ? "\n" : " ";
    }
  }
  return out;
}

const problems = [];
const files = walk(root);
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const clean = strip(raw);
  const rel = path.relative(root, file);

  const pairs = [
    ["{", "}"],
    ["(", ")"],
  ];
  for (const [open, close] of pairs) {
    let depth = 0;
    for (const ch of clean) {
      if (ch === open) depth += 1;
      if (ch === close) depth -= 1;
      if (depth < 0) break;
    }
    if (depth !== 0) problems.push(`${rel}: ${open}${close} 不平衡（depth=${depth}）`);
  }

  const importLines = [...raw.matchAll(/^import\s+([^;]+);/gm)].map((m) => m[1]);
  const body = raw.replace(/^import\s+[^;]+;/gm, "");
  for (const imp of importLines) {
    if (imp.endsWith("*")) continue;
    const simple = imp.split(".").pop();
    const used = new RegExp(`\\b${simple}\\b`).test(body);
    if (!used) problems.push(`${rel}: 未使用的 import ${imp}`);
  }

  const publicType = /public\s+(?:final\s+)?(?:class|record|interface|enum)\s+(\w+)/.exec(clean);
  if (publicType) {
    const expected = path.basename(file, ".java");
    if (publicType[1] !== expected) {
      problems.push(`${rel}: public 类型 ${publicType[1]} 与文件名不一致`);
    }
  }
}

console.log(`checked ${files.length} Java files`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("OK：括号平衡、import 使用、文件名一致");
