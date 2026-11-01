package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.dto.ContentDtos;
import com.fuxiao.submission.entity.Submission;
import com.fuxiao.submission.service.CategoryService;
import com.fuxiao.submission.service.NowItemService;
import com.fuxiao.submission.service.SettingService;
import com.fuxiao.submission.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** 对博客前端公开的接口：投稿表单只需要这几个。 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final SettingService settingService;
    private final CategoryService categoryService;
    private final SubmissionService submissionService;
    private final NowItemService nowItemService;

    public PublicController(SettingService settingService, CategoryService categoryService,
                            SubmissionService submissionService, NowItemService nowItemService) {
        this.settingService = settingService;
        this.categoryService = categoryService;
        this.submissionService = submissionService;
        this.nowItemService = nowItemService;
    }

    @GetMapping("/site")
    public ApiResponse<Map<String, Object>> site() {
        Map<String, Object> site = new LinkedHashMap<>();
        site.put("copy", settingService.values());
        site.put("categories", categoryService.visibleList());
        site.put("now", nowItemService.list());
        return ApiResponse.ok(site);
    }

    @PostMapping("/submissions")
    public ApiResponse<Map<String, Object>> submit(@Valid @RequestBody ContentDtos.PublicSubmissionRequest request) {
        Submission submission = submissionService.submitPublic(request);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", submission.getId());
        result.put("status", submission.getStatus());
        result.put("message", "投稿已经收到，会在两周内回复。");
        return ApiResponse.ok(result);
    }
}
