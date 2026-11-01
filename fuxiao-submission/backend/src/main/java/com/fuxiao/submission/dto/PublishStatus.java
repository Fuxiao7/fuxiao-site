package com.fuxiao.submission.dto;

public record PublishStatus(
        boolean enabled,
        String state,
        String message,
        String startedAt,
        String finishedAt,
        String log) {
}
