/**
 * 前端源码自检（在没有 node_modules 的环境里做静态检查）：
 * 1. .vue 模板标签是否闭合
 * 2. <script setup> 里的括号是否平衡
 * 3. 模板里是否残留 TypeScript 语法（as / 类型注解）
 * 4. import 的相对路径与 @ 别名是否存在，命名导入是否真的被导出
 *   node tools/check-web.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "../admin-web");
const srcRoot = path.join(webRoot, "src");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(vue|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(srcRoot);
function checkTemplateSyntax(rel, template) {
  const opens = (template.match(/\{\{/g) || []).length;
  const closes = (template.match(/\}\}/g) || []).length;
  if (opens !== closes) {
    problems.push(`${rel}: 模板插值 {{ }} 不平衡（${opens} / ${closes}）`);
  }

  let i = 0;
  while ((i = template.indexOf("<", i)) >= 0) {
    if (template.startsWith("<!--", i)) {
      const end = template.indexOf("-->", i);
      i = end < 0 ? template.length : end + 3;
      continue;
    }
    if (template[i + 1] === "/") {
      i = template.indexOf(">", i) + 1;
      continue;
    }
    let j = i + 1;
    let quote = null;
    for (; j < template.length; j += 1) {
      const ch = template[j];
      if (quote) {
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === ">") break;
    }
    const tag = template.slice(i, j + 1);
    const doubleQuotes = (tag.match(/"/g) || []).length;
    if (quote !== null) {
      problems.push(`${rel}: 标签属性引号未闭合 ${tag.slice(0, 90)}`);
    }
    if (doubleQuotes % 2 !== 0) {
      problems.push(`${rel}: 标签属性双引号数量为奇数 ${tag.slice(0, 90)}`);
    }
    i = j + 1;
  }
}

const problems = [];
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function checkTemplateTags(rel, template) {
  let i = 0;
  const stack = [];
  while (i < template.length) {
    if (template.startsWith("<!--", i)) {
      const end = template.indexOf("-->", i);
      i = end < 0 ? template.length : end + 3;
      continue;
    }
    if (template[i] === "<") {
      if (template[i + 1] === "/") {
        const end = template.indexOf(">", i);
        if (end < 0) {
          problems.push(`${rel}: 模板里有未结束的闭合标签`);
          return;
        }
        const name = template.slice(i + 2, end).trim().split(/\s+/)[0];
        const open = stack.pop();
        if (open !== name) {
          problems.push(`${rel}: 标签不匹配 </${name}>，期望 </${open}>`);
          return;
        }
        i = end + 1;
        continue;
      }
      const end = findTagEnd(template, i);
      if (end < 0) {
        problems.push(`${rel}: 模板里有未结束的标签`);
        return;
      }
      const tag = template.slice(i + 1, end);
      const selfClosing = tag.trim().endsWith("/");
      const name = tag.trim().split(/[\s/>]/)[0];
      if (!selfClosing && name && !VOID.has(name.toLowerCase())) {
        stack.push(name);
      }
      i = end + 1;
      continue;
    }
    i += 1;
  }
  if (stack.length) {
    problems.push(`${rel}: 模板有未闭合标签 ${stack.join(" > ")}`);
  }
}

function findTagEnd(text, start) {
  let quote = null;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ">") return i;
  }
  return -1;
}

function checkBraces(rel, script) {
  let depth = 0;
  let state = "code";
  for (let i = 0; i < script.length; i += 1) {
    const ch = script[i];
    const next = script[i + 1];
    if (state === "code") {
      if (ch === "/" && next === "/") { state = "line"; continue; }
      if (ch === "/" && next === "*") { state = "block"; continue; }
      if (ch === '"' || ch === "'" || ch === "`") { state = ch; continue; }
      if (ch === "{") depth += 1;
      if (ch === "}") depth -= 1;
      if (depth < 0) break;
    } else if (state === "line") {
      if (ch === "\n") state = "code";
    } else if (state === "block") {
      if (ch === "*" && next === "/") { state = "code"; i += 1; }
    } else {
      if (ch === "\\") { i += 1; continue; }
      if (ch === state) state = "code";
    }
  }
  if (depth !== 0) problems.push(`${rel}: script 花括号不平衡（${depth}）`);
}

function extractBlocks(source) {
  const templateStart = source.indexOf("<template>");
  const templateEnd = source.lastIndexOf("</template>");
  const scriptMatch = /<script setup lang="ts">([\s\S]*?)<\/script>/.exec(source);
  return {
    template:
      templateStart >= 0 && templateEnd > templateStart
        ? source.slice(templateStart + 10, templateEnd)
        : "",
    script: scriptMatch ? scriptMatch[1] : "",
  };
}

const EXPORT_PATTERNS = [
  /export\s+(?:async\s+)?function\s+(\w+)/g,
  /export\s+const\s+(\w+)/g,
  /export\s+let\s+(\w+)/g,
  /export\s+interface\s+(\w+)/g,
  /export\s+type\s+(\w+)/g,
  /export\s+class\s+(\w+)/g,
  /export\s+enum\s+(\w+)/g,
];

function exportsOf(file) {
  const source = fs.readFileSync(file, "utf8");
  const names = new Set();
  if (file.endsWith(".vue")) {
    names.add("default");
    return names;
  }
  for (const pattern of EXPORT_PATTERNS) {
    for (const match of source.matchAll(pattern)) names.add(match[1]);
  }
  for (const match of source.matchAll(/export\s*{([^}]+)}/g)) {
    match[1].split(",").forEach((item) => {
      const name = item.trim().split(/\s+as\s+/).pop();
      if (name) names.add(name.trim());
    });
  }
  if (source.includes("export default")) names.add("default");
  return names;
}

function resolveModule(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(srcRoot, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.vue`,
    `${base}.json`,
    path.join(base, "index.ts"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

for (const file of files) {
  const rel = path.relative(webRoot, file).replace(/\\/g, "/");
  const source = fs.readFileSync(file, "utf8");

  if (file.endsWith(".vue")) {
    const { template, script } = extractBlocks(source);
    checkTemplateTags(rel, template);
    checkTemplateSyntax(rel, template);
    checkBraces(rel, script);

    if (/@\w[\w:.-]*="[^"]*\bas\s+[A-Z"']/.test(template)) {
      problems.push(`${rel}: 模板里残留了 as 类型断言`);
    }
    if (/@\w[\w:.-]*="[^"]*\(\s*\w+\s*:\s*[A-Z]/.test(template)) {
      problems.push(`${rel}: 模板里残留了参数类型注解`);
    }
    if (/<script(?! setup lang="ts")/.test(source)) {
      problems.push(`${rel}: 存在非 setup/lang=ts 的 script 块`);
    }
  }

  for (const match of source.matchAll(/import\s+(?:type\s+)?(?:([\w$]+)\s*,?\s*)?(?:\{([^}]+)\})?\s+from\s+["']([^"']+)["']/g)) {
    const defaultName = match[1];
    const namedRaw = match[2];
    const spec = match[3];
    const resolved = resolveModule(file, spec);
    if (!resolved) continue;

    const exported = exportsOf(resolved);
    if (defaultName && !exported.has("default")) {
      problems.push(`${rel}: ${spec} 没有默认导出，却 import ${defaultName}`);
    }
    if (namedRaw) {
      for (const item of namedRaw.split(",")) {
        const name = item.trim().split(/\s+as\s+/)[0].trim();
        if (!name) continue;
        if (!exported.has(name)) {
          problems.push(`${rel}: ${spec} 没有导出 ${name}`);
        }
      }
    }
  }
}

console.log(`checked ${files.length} web files`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("OK：模板闭合、脚本括号、模板 TS 语法、import 路径与导出");
