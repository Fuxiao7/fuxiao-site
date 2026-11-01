package com.fuxiao.submission.dto;

import com.fuxiao.submission.entity.AdminUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "请输入账号") String username,
            @NotBlank(message = "请输入密码") String password) {
    }

    public record LoginResponse(String token, AdminUser user) {
    }

    public record PasswordChangeRequest(
            @NotBlank(message = "请输入当前密码") String oldPassword,
            @NotBlank(message = "请输入新密码")
            @Size(min = 6, max = 64, message = "新密码至少 6 位") String newPassword) {
    }

    public record ProfileUpdateRequest(
            @Size(max = 64, message = "昵称最多 64 字") String nickname,
            @Email(message = "邮箱格式不正确") String email,
            String avatar) {
    }
}
