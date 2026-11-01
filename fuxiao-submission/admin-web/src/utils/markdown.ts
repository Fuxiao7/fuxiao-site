import type { Block } from "@/types";

/**
 * 极简 Markdown → 正文块。支持 ## 小标题、> 引用、``` 代码、![alt](src) 插图，
 * 其余按空行分段。
 */
export function markdownToBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let index = 0;

  const flush = () => {
    if (!paragraph.length) return;
    const value = paragraph.join("\n").trim();
    paragraph = [];
    if (value) blocks.push({ t: "p", text: value });
  };

  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();

    if (line.startsWith("```")) {
      flush();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      if (code.length) blocks.push({ t: "code", text: code.join("\n") });
      continue;
    }

    if (!line || line === "---" || line === "***") {
      flush();
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      flush();
      blocks.push({ t: "h2", text: line.slice(3).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      flush();
      blocks.push({ t: "h2", text: line.slice(2).trim() });
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      flush();
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quote.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ t: "q", text: quote.join("\n") });
      continue;
    }

    const image = /^!\[(.*?)]\((.*?)\)$/.exec(line);
    if (image) {
      flush();
      blocks.push({ t: "img", src: image[2], alt: image[1], cap: "" });
      index += 1;
      continue;
    }

    paragraph.push(line);
    index += 1;
  }

  flush();
  return blocks;
}
