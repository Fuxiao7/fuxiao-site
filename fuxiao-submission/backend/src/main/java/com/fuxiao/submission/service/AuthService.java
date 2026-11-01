package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.dto.AuthDtos;
import com.fuxiao.submission.entity.AdminUser;
import com.fuxiao.submission.repository.AdminUserRepository;
import com.fuxiao.submission.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AdminUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LogService logService;

    public AuthService(AdminUserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, LogService logService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.logService = logService;
    }

    @Transactional
    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        AdminUser user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> BusinessException.unauthorized("账号或密码不对"));
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw BusinessException.unauthorized("这个账号已被停用");
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            logService.record(user.getUsername(), "auth", "登录失败", user.getUsername(), "密码不正确");
            throw BusinessException.unauthorized("账号或密码不对");
        }
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        logService.record(user.getUsername(), "auth", "登录", user.getUsername(), "登录了后台");
        return new AuthDtos.LoginResponse(jwtService.issue(user), user);
    }

    @Transactional(readOnly = true)
    public AdminUser me(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> BusinessException.unauthorized("账号不存在"));
    }

    @Transactional
    public AdminUser updateProfile(String username, AuthDtos.ProfileUpdateRequest request) {
        AdminUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> BusinessException.unauthorized("账号不存在"));
        user.setNickname(request.nickname());
        user.setEmail(request.email());
        if (request.avatar() != null) {
            user.setAvatar(request.avatar());
        }
        user.setUpdatedAt(LocalDateTime.now());
        AdminUser saved = userRepository.save(user);
        logService.record("auth", "更新个人资料", user.getUsername(), null);
        return saved;
    }

    @Transactional
    public void changePassword(String username, AuthDtos.PasswordChangeRequest request) {
        AdminUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> BusinessException.unauthorized("账号不存在"));
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BusinessException("当前密码不对");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logService.record("auth", "修改密码", user.getUsername(), "修改了自己的密码");
    }
}
