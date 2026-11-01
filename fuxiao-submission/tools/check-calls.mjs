/**
 * 后端调用自检：检查 controller/service 里对自定义 Service / Repository 的方法调用是否存在，
 * 参数个数是否与声明一致。没有 JDK 时的替代品。
 *   node tools/check-calls.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../backend/src/main/java/com/fuxiao/submission");

const files = [];
for (const dir of ["service", "repository", "controller", "security"]) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) {
    if (name.endsWith(".java")) files.push(path.join(full, name));
  }
}

const JPA_METHODS = {
  save: 1,
  saveAll: 1,
  saveAllAndFlush: 1,
  findAll: 0,
  findAllById: 1,
  findById: 1,
  getReferenceById: 1,
  existsById: 1,
  count: 0,
  delete: 1,
  deleteById: 1,
  deleteAll: 0,
  deleteAllById: 1,
  deleteAllInBatch: 0,
  flush: 0,
};

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function paramCount(raw) {
  const value = raw.trim();
  if (!value) return 0;
  let depth = 0;
  let count = 1;
  for (const ch of value) {
    if ("<([".includes(ch)) depth += 1;
    if (">)]".includes(ch)) depth -= 1;
    if (ch === "," && depth === 0) count += 1;
  }
  return count;
}

const classes = new Map();

for (const file of files) {
  const source = stripComments(fs.readFileSync(file, "utf8"));
  const classMatch = /public\s+(?:final\s+)?(?:class|interface)\s+(\w+)/.exec(source);
  if (!classMatch) continue;
  const className = classMatch[1];
  const methods = new Map();
  const addMethod = (name, count) => {
    if (name === className) return;
    const list = methods.get(name) || [];
    if (!list.includes(count)) list.push(count);
    methods.set(name, list);
  };
  const declRe = /public\s+(?:static\s+)?(?:final\s+)?(?:synchronized\s+)?(?:<[^>]+>\s+)?[\w<>\[\],.?\s]+\s+(\w+)\s*\(([^)]*)\)/g;
  for (const match of source.matchAll(declRe)) {
    addMethod(match[1], paramCount(match[2]));
  }
  // 接口方法没有 public 关键字，且参数里可能嵌套 @Param(...)；用括号配对扫描
  if (source.includes("public interface")) {
    for (const match of source.matchAll(/\b(\w+)\s*\(/g)) {
      const name = match[1];
      if (["if", "for", "while", "switch", "catch", "return", "new"].includes(name)) continue;
      const before = source.slice(Math.max(0, match.index - 24), match.index);
      if (/@[\w.]*$/.test(before)) continue;
      if (source[match.index - 1] === ".") continue;
      const open = match.index + match[0].length - 1;
      const close = findCallEnd(source, open);
      if (close < 0) continue;
      let cursor = close + 1;
      while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
      if (source[cursor] !== ";") continue;
      addMethod(name, splitArgs(source.slice(open + 1, close)).length);
    }
  }
  classes.set(className, { file, methods, fields: new Map() });

  const fieldRe = /private\s+final\s+([\w.]+)\s+(\w+)\s*;/g;
  for (const match of source.matchAll(fieldRe)) {
    classes.get(className).fields.set(match[2], match[1]);
  }
}

for (const type of ["JpaRepository", "CrudRepository"]) {
  // JPA 继承来的方法对每个 Repository 都可用
}

function findCallEnd(text, openIndex) {
  let depth = 1;
  let quote = null;
  for (let i = openIndex + 1; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") { i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitArgs(text) {
  const args = [];
  let current = "";
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === "\\") { current += text[i + 1] || ""; i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
    if ("([{<".includes(ch)) depth += 1;
    if (")]}>".includes(ch)) depth -= 1;
    if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  return args.filter((arg) => arg.length > 0);
}

const problems = [];
let checked = 0;

for (const [className, info] of classes) {
  const source = stripComments(fs.readFileSync(info.file, "utf8"));
  const fieldTypes = info.fields;
  const callRe = /\b(\w+)\.(\w+)\s*\(/g;
  for (const match of source.matchAll(callRe)) {
    const receiver = match[1];
    const method = match[2];
    const type = fieldTypes.get(receiver);
    if (!type) continue;
    const target = classes.get(type);
    if (!target) continue;

    const declared = target.methods.get(method);
    const known = declared ? null : JPA_METHODS[method];
    if (!declared && known === undefined) {
      problems.push(`${className}.${receiver}.${method}()：${type} 里没有这个方法`);
      continue;
    }

    const open = source.indexOf("(", match.index);
    const close = findCallEnd(source, open);
    if (close < 0) continue;
    const args = splitArgs(source.slice(open + 1, close));
    if (declared && !declared.includes(args.length)) {
      problems.push(
        `${className}.${receiver}.${method}()：声明 ${declared.join("/")} 个参数，调用给了 ${args.length} 个`
      );
    }
    if (!declared && known !== args.length) {
      problems.push(
        `${className}.${receiver}.${method}()：声明 ${known} 个参数，调用给了 ${args.length} 个`
      );
    }
    checked += 1;
  }
}

console.log(`checked ${classes.size} classes, ${checked} typed calls`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("OK：对 Service / Repository 的调用都能找到声明，参数个数一致");
