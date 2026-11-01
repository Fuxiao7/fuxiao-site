package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.common.PageResult;
import com.fuxiao.submission.dto.ContentDtos;
import com.fuxiao.submission.entity.Submission;
import com.fuxiao.submission.service.SubmissionService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping
    public ApiResponse<PageResult<Submission>> page(@RequestParam(required = false) String status,
                                                    @RequestParam(required = false) String keyword,
                                                    @RequestParam(defaultValue = "1") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(submissionService.page(status, keyword, page, size));
    }

    @GetMapping("/counts")
    public ApiResponse<Map<String, Long>> counts() {
        return ApiResponse.ok(submissionService.counts());
    }

    @GetMapping("/{id}")
    public ApiResponse<Submission> get(@PathVariable Long id) {
        return ApiResponse.ok(submissionService.get(id));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<Map<String, Object>> approve(@PathVariable Long id,
                                                    @RequestBody(required = false) ContentDtos.ApproveRequest request) {
        return ApiResponse.ok(submissionService.approve(id, request));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<Submission> reject(@PathVariable Long id,
                                          @RequestBody(required = false) ContentDtos.RejectRequest request) {
        return ApiResponse.ok(submissionService.reject(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        submissionService.delete(id);
        return ApiResponse.ok();
    }
}
