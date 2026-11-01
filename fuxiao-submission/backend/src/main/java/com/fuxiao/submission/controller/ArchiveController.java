package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.ArchiveEntry;
import com.fuxiao.submission.service.ArchiveService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/archive")
public class ArchiveController {

    private final ArchiveService archiveService;

    public ArchiveController(ArchiveService archiveService) {
        this.archiveService = archiveService;
    }

    @GetMapping
    public ApiResponse<List<ArchiveEntry>> list() {
        return ApiResponse.ok(archiveService.list());
    }

    @PostMapping
    public ApiResponse<ArchiveEntry> create(@RequestBody ArchiveEntry payload) {
        return ApiResponse.ok(archiveService.create(payload));
    }

    @PutMapping("/{id}")
    public ApiResponse<ArchiveEntry> update(@PathVariable Long id, @RequestBody ArchiveEntry payload) {
        return ApiResponse.ok(archiveService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        archiveService.delete(id);
        return ApiResponse.ok();
    }

    @PostMapping("/sync")
    public ApiResponse<Map<String, Object>> sync() {
        return ApiResponse.ok(archiveService.sync());
    }
}
