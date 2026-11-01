package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.common.PageResult;
import com.fuxiao.submission.entity.OperationLog;
import com.fuxiao.submission.service.LogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
@PreAuthorize("hasRole('ADMIN')")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping
    public ApiResponse<PageResult<OperationLog>> page(@RequestParam(required = false) String module,
                                                      @RequestParam(required = false) String username,
                                                      @RequestParam(required = false) String keyword,
                                                      @RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(logService.page(module, username, keyword, page, size));
    }
}
