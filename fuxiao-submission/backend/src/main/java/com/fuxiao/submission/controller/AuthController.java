package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.dto.AuthDtos;
import com.fuxiao.submission.entity.AdminUser;
import com.fuxiao.submission.service.AuthService;
import com.fuxiao.submission.service.LogService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final LogService logService;

    public AuthController(AuthService authService, LogService logService) {
        this.authService = authService;
        this.logService = logService;
    }

    @PostMapping("/login")
    public ApiResponse<AuthDtos.LoginResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<AdminUser> me(Authentication authentication) {
        return ApiResponse.ok(authService.me(authentication.getName()));
    }

    @PutMapping("/profile")
    public ApiResponse<AdminUser> updateProfile(Authentication authentication,
                                                @Valid @RequestBody AuthDtos.ProfileUpdateRequest request) {
        return ApiResponse.ok(authService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(Authentication authentication,
                                            @Valid @RequestBody AuthDtos.PasswordChangeRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ApiResponse.ok();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(Authentication authentication) {
        logService.record("auth", "退出登录", authentication.getName(), null);
        return ApiResponse.ok();
    }
}
