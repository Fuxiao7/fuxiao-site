package com.fuxiao.submission.model;

/**
 * 文章正文的一个块。
 * t 取值：p 段落 / h2 小标题 / q 引用 / code 代码 / img 插图。
 */
public record ArticleBlock(String t, String text, String src, String alt, String cap) {

    public static final String P = "p";
    public static final String H2 = "h2";
    public static final String QUOTE = "q";
    public static final String CODE = "code";
    public static final String IMAGE = "img";
}
