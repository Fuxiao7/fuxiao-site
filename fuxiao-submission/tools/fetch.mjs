/**
 * 工作区内的下载器：绕开 curl/Schannel 的证书问题，使用 Node 的 HTTPS。
 * 用法：node tools/fetch.mjs <url> <输出文件>
 */
import fs from "node:fs";
import path from "node:path";

const [url, output] = process.argv.slice(2);
if (!url || !output) {
  console.error("usage: node tools/fetch.mjs <url> <output>");
  process.exit(2);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
const part = `${output}.part`;
let start = 0;
if (fs.existsSync(part)) {
  start = fs.statSync(part).size;
}
if (fs.existsSync(output)) {
  console.log(`exists: ${output}`);
  process.exit(0);
}

const headers = {};
if (start > 0) {
  headers.Range = `bytes=${start}-`;
}

console.log(`GET ${url}${start ? ` (resume at ${start})` : ""}`);
const response = await fetch(url, {
  headers,
  redirect: "follow",
  signal: AbortSignal.timeout(30 * 60 * 1000),
});

if (!response.ok || !response.body) {
  console.error(`download failed: HTTP ${response.status}`);
  process.exit(1);
}

const totalHeader = response.headers.get("content-length");
const total = totalHeader ? Number(totalHeader) + (response.status === 206 ? start : 0) : 0;
const append = response.status === 206 && start > 0;
const stream = fs.createWriteStream(part, { flags: append ? "a" : "w" });

let received = append ? start : 0;
let lastReport = 0;
const startedAt = Date.now();

for await (const chunk of response.body) {
  received += chunk.length;
  if (!stream.write(chunk)) {
    await new Promise((resolve) => stream.once("drain", resolve));
  }
  const now = Date.now();
  if (now - lastReport > 1500) {
    lastReport = now;
    const mb = (received / 1024 / 1024).toFixed(1);
    const speed = (received / 1024 / 1024 / ((now - startedAt) / 1000)).toFixed(2);
    if (total) {
      const pct = ((received / total) * 100).toFixed(1);
      process.stdout.write(`\r${mb} / ${(total / 1024 / 1024).toFixed(1)} MB (${pct}%) ${speed} MB/s`);
    } else {
      process.stdout.write(`\r${mb} MB ${speed} MB/s`);
    }
  }
}

await new Promise((resolve, reject) => {
  stream.end((error) => (error ? reject(error) : resolve()));
});

if (total && received !== total) {
  console.error(`\nincomplete: ${received} / ${total}`);
  process.exit(1);
}

fs.renameSync(part, output);
console.log(`\nsaved: ${output} (${(received / 1024 / 1024).toFixed(1)} MB)`);
