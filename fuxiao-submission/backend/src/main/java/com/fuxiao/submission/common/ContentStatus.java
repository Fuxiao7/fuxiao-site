package com.fuxiao.submission.common;

/** 内容与投稿的状态常量。 */
public final class ContentStatus {

    public static final String DRAFT = "draft";
    public static final String PUBLISHED = "published";
    public static final String OFFLINE = "offline";

    public static final String SUBMISSION_PENDING = "pending";
    public static final String SUBMISSION_ACCEPTED = "accepted";
    public static final String SUBMISSION_REJECTED = "rejected";

    private ContentStatus() {
    }

    public static boolean isValidArticleStatus(String value) {
        return DRAFT.equals(value) || PUBLISHED.equals(value) || OFFLINE.equals(value);
    }
}
