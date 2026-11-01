package com.fuxiao.submission.service;

import com.fuxiao.submission.common.PageResult;
import com.fuxiao.submission.entity.OperationLog;
import com.fuxiao.submission.repository.OperationLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
public class LogService {

    private final OperationLogRepository logRepository;

    public LogService(OperationLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void record(String module, String action, String target, String detail) {
        record(currentUsername(), module, action, target, detail);
    }

    public void record(String username, String module, String action, String target, String detail) {
        OperationLog log = new OperationLog();
        log.setUsername(username == null || username.isBlank() ? "system" : username);
        log.setModule(module);
        log.setAction(action);
        log.setTarget(truncate(target, 255));
        log.setDetail(truncate(detail, 1000));
        log.setIp(clientIp());
        log.setCreatedAt(LocalDateTime.now());
        logRepository.save(log);
    }

    @Transactional(readOnly = true)
    public PageResult<OperationLog> page(String module, String username, String keyword, int page, int size) {
        Page<OperationLog> result = logRepository.search(
                blank(module), blank(username), blank(keyword),
                PageRequest.of(Math.max(0, page - 1), Math.min(Math.max(size, 1), 100)));
        return PageResult.of(result);
    }

    public String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "system";
        }
        return authentication.getName();
    }

    private String clientIp() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return null;
        }
        HttpServletRequest request = attributes.getRequest();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String blank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
