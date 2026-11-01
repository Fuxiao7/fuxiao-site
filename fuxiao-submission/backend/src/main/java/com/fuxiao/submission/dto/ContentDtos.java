package com.fuxiao.submission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class ContentDtos {

    private ContentDtos() {
    }

    public record StatusRequest(@NotBlank(message = "请选择状态") String status) {
    }

    public record FeaturedRequest(Boolean featured) {
    }

    public record TagRenameRequest(
            @NotBlank(message = "原标签不能为空") String from,
            @NotBlank(message = "新标签不能为空") String to) {
    }

    public record SettingItem(
            @NotBlank(message = "配置键不能为空") String settingKey,
            String value) {
    }

    public record SettingUpdateRequest(
            @NotEmpty(message = "没有需要保存的配置") List<SettingItem> items) {
    }

    public record ApproveRequest(Long categoryId, String note, Boolean publish) {
    }

    public record RejectRequest(
            @Size(max = 1000, message = "审核意见最多 1000 字") String note) {
    }

    public record PublicSubmissionRequest(
            @NotBlank(message = "请填写标题")
            @Size(max = 200, message = "标题最多 200 字") String title,
            @NotBlank(message = "请填写署名")
            @Size(max = 60, message = "署名最多 60 字") String authorName,
            @Size(max = 190, message = "邮箱太长") String authorEmail,
            @Size(max = 190, message = "站点地址太长") String authorSite,
            Long categoryId,
            String cover,
            @Size(max = 500, message = "摘要最多 500 字") String excerpt,
            @NotBlank(message = "正文不能为空")
            @Size(max = 100000, message = "正文太长了") String content,
            String website) {
    }
}
