package com.fuxiao.submission.common;

import com.fuxiao.submission.model.ArticleBlock;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 极简 Markdown → 正文块。只处理本站用得到的五种块：
 * 段落、## 小标题、> 引用、``` 代码、![alt](src) 图片。
 */
public final class MarkdownParser {

    private static final Pattern IMAGE = Pattern.compile("^!\\[(.*?)]\\((.*?)\\)$");

    private MarkdownParser() {
    }

    public static List<ArticleBlock> parse(String text) {
        List<ArticleBlock> blocks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return blocks;
        }
        String[] lines = text.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1);
        List<String> paragraph = new ArrayList<>();
        int index = 0;
        while (index < lines.length) {
            String raw = lines[index];
            String line = raw.trim();

            if (line.startsWith("```")) {
                flush(paragraph, blocks);
                StringBuilder code = new StringBuilder();
                index += 1;
                while (index < lines.length && !lines[index].trim().startsWith("```")) {
                    if (code.length() > 0) {
                        code.append('\n');
                    }
                    code.append(lines[index]);
                    index += 1;
                }
                index += 1;
                if (code.length() > 0) {
                    blocks.add(new ArticleBlock(ArticleBlock.CODE, code.toString(), null, null, null));
                }
                continue;
            }

            if (line.isEmpty() || line.equals("---") || line.equals("***")) {
                flush(paragraph, blocks);
                index += 1;
                continue;
            }

            if (line.startsWith("## ")) {
                flush(paragraph, blocks);
                blocks.add(new ArticleBlock(ArticleBlock.H2, line.substring(3).trim(), null, null, null));
                index += 1;
                continue;
            }

            if (line.startsWith("# ")) {
                flush(paragraph, blocks);
                blocks.add(new ArticleBlock(ArticleBlock.H2, line.substring(2).trim(), null, null, null));
                index += 1;
                continue;
            }

            if (line.startsWith("> ")) {
                flush(paragraph, blocks);
                StringBuilder quote = new StringBuilder();
                while (index < lines.length && lines[index].trim().startsWith("> ")) {
                    if (quote.length() > 0) {
                        quote.append('\n');
                    }
                    quote.append(lines[index].trim().substring(2));
                    index += 1;
                }
                blocks.add(new ArticleBlock(ArticleBlock.QUOTE, quote.toString(), null, null, null));
                continue;
            }

            Matcher image = IMAGE.matcher(line);
            if (image.matches()) {
                flush(paragraph, blocks);
                blocks.add(new ArticleBlock(ArticleBlock.IMAGE, null,
                        MediaPaths.normalize(image.group(2)), blankToNull(image.group(1)), null));
                index += 1;
                continue;
            }

            paragraph.add(line);
            index += 1;
        }
        flush(paragraph, blocks);
        return blocks;
    }

    private static void flush(List<String> paragraph, List<ArticleBlock> blocks) {
        if (paragraph.isEmpty()) {
            return;
        }
        String text = String.join("\n", paragraph).trim();
        paragraph.clear();
        if (!text.isEmpty()) {
            blocks.add(new ArticleBlock(ArticleBlock.P, text, null, null, null));
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
