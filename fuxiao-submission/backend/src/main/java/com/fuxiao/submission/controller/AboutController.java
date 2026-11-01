package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.AboutProfile;
import com.fuxiao.submission.service.AboutService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/about")
public class AboutController {

    private final AboutService aboutService;

    public AboutController(AboutService aboutService) {
        this.aboutService = aboutService;
    }

    @GetMapping
    public ApiResponse<AboutProfile> get() {
        return ApiResponse.ok(aboutService.get());
    }

    @PutMapping
    public ApiResponse<AboutProfile> update(@RequestBody AboutProfile payload) {
        return ApiResponse.ok(aboutService.update(payload));
    }
}
