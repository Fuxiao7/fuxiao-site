package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.dto.UserDtos;
import com.fuxiao.submission.entity.AdminUser;
import com.fuxiao.submission.repository.AdminUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final AdminUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogService logService;

    public UserService(AdminUserRepository userRepository, PasswordEncoder passwordEncoder, LogService logService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<AdminUser> list() {
        return userRepository.findAll();
    }

    @Transactional
    public AdminUser create(UserDtos.CreateUserRequest request) {
        String username = request.username().trim();
        if (userRepository.existsByUsername(username)) {
            throw new BusinessException("账号已存在");
        }
        AdminUser user = new AdminUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setNickname(blankTo(request.nickname(), username));
        user.setEmail(blankTo(request.email(), null));
        user.setRole(blankTo(request.role(), "EDITOR"));
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        AdminUser saved = userRepository.save(user);
        logService.record("user", "新建账号", username, "角色 " + saved.getRole());
        return saved;
    }

    @Transactional
    public AdminUser update(Long id, UserDtos.UpdateUserRequest request) {
        AdminUser user = find(id);
        user.setNickname(request.nickname());
        user.setEmail(request.email());
        if (request.role() != null && !request.role().isBlank()
                && !request.role().equals(user.getRole())) {
            if ("ADMIN".equals(user.getRole()) && Boolean.TRUE.equals(user.getEnabled())
                    && !"ADMIN".equals(request.role()) && enabledAdminCount() <= 1) {
                throw new BusinessException("至少要保留一个可用的管理员");
            }
            user.setRole(request.role());
        }
        user.setUpdatedAt(LocalDateTime.now());
        AdminUser saved = userRepository.save(user);
        logService.record("user", "修改账号", user.getUsername(), "昵称 " + user.getNickname());
        return saved;
    }

    @Transactional
    public AdminUser setEnabled(Long id, boolean enabled, String currentUsername) {
        AdminUser user = find(id);
        if (user.getUsername().equals(currentUsername) && !enabled) {
            throw new BusinessException("不能停用当前登录的账号");
        }
        if (Boolean.TRUE.equals(user.getEnabled()) && !enabled
                && "ADMIN".equals(user.getRole()) && enabledAdminCount() <= 1) {
            throw new BusinessException("至少要保留一个可用的管理员");
        }
        user.setEnabled(enabled);
        user.setUpdatedAt(LocalDateTime.now());
        AdminUser saved = userRepository.save(user);
        logService.record("user", enabled ? "启用账号" : "停用账号", user.getUsername(), null);
        return saved;
    }

    @Transactional
    public void resetPassword(Long id, UserDtos.ResetPasswordRequest request) {
        AdminUser user = find(id);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        logService.record("user", "重置密码", user.getUsername(), "管理员重置了密码");
    }

    @Transactional
    public void delete(Long id, String currentUsername) {
        AdminUser user = find(id);
        if (user.getUsername().equals(currentUsername)) {
            throw new BusinessException("不能删除当前登录的账号");
        }
        if (Boolean.TRUE.equals(user.getEnabled()) && "ADMIN".equals(user.getRole())
                && enabledAdminCount() <= 1) {
            throw new BusinessException("至少要保留一个可用的管理员");
        }
        userRepository.delete(user);
        logService.record("user", "删除账号", user.getUsername(), null);
    }

    private long enabledAdminCount() {
        return userRepository.findAll().stream()
                .filter(user -> Boolean.TRUE.equals(user.getEnabled()) && "ADMIN".equals(user.getRole()))
                .count();
    }

    private AdminUser find(Long id) {
        return userRepository.findById(id).orElseThrow(() -> BusinessException.notFound("账号"));
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
