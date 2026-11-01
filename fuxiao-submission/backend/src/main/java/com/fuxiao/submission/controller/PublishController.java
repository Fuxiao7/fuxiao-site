package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.dto.PublishStatus;
import com.fuxiao.submission.service.PublishService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/publish")
@PreAuthorize("hasRole('ADMIN')")
public class PublishController {

    private final PublishService publishService;

    public PublishController(PublishService publishService) {
        this.publishService = publishService;
    }

    @GetMapping("/status")
    public ApiResponse<PublishStatus> status() {
        return ApiResponse.ok(publishService.status());
    }

    @PostMapping
    public ApiResponse<PublishStatus> publish(Authentication authentication) {
        return ApiResponse.ok(publishService.start(authentication.getName()));
    }
}
