package com.fuxiao.submission.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class UserDtos {

    private UserDtos() {
    }

    public record CreateUserRequest(
            @NotBlank(message = "请输入账号")
            @Size(min = 3, max = 32, message = "账号长度 3–32 位") String username,
            @NotBlank(message = "请输入密码")
            @Size(min = 6, max = 64, message = "密码至少 6 位") String password,
            String nickname,
            @Email(message = "邮箱格式不正确") String email,
            String role) {
    }

    public record UpdateUserRequest(
            String nickname,
            @Email(message = "邮箱格式不正确") String email,
            String role) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "请输入新密码")
            @Size(min = 6, max = 64, message = "密码至少 6 位") String password) {
    }

    public record EnabledRequest(Boolean enabled) {
    }
}
