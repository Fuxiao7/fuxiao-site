package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.dto.UserDtos;
import com.fuxiao.submission.entity.AdminUser;
import com.fuxiao.submission.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<List<AdminUser>> list() {
        return ApiResponse.ok(userService.list());
    }

    @PostMapping
    public ApiResponse<AdminUser> create(@Valid @RequestBody UserDtos.CreateUserRequest request) {
        return ApiResponse.ok(userService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminUser> update(@PathVariable Long id,
                                         @Valid @RequestBody UserDtos.UpdateUserRequest request) {
        return ApiResponse.ok(userService.update(id, request));
    }

    @PatchMapping("/{id}/enabled")
    public ApiResponse<AdminUser> setEnabled(@PathVariable Long id,
                                             @RequestBody UserDtos.EnabledRequest request,
                                             Authentication authentication) {
        return ApiResponse.ok(userService.setEnabled(id, Boolean.TRUE.equals(request.enabled()),
                authentication.getName()));
    }

    @PutMapping("/{id}/password")
    public ApiResponse<Void> resetPassword(@PathVariable Long id,
                                           @Valid @RequestBody UserDtos.ResetPasswordRequest request) {
        userService.resetPassword(id, request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, Authentication authentication) {
        userService.delete(id, authentication.getName());
        return ApiResponse.ok();
    }
}
