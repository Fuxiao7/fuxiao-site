package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/preview")
    public ApiResponse<Map<String, Object>> preview() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", exportService.buildContent());
        result.put("articleCount", exportService.buildArticleBodies().size());
        return ApiResponse.ok(result);
    }

    @GetMapping("/content")
    public ResponseEntity<byte[]> content() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"content.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(exportService.contentBytes());
    }

    @GetMapping("/package")
    public ResponseEntity<byte[]> packageZip() {
        String filename = "fuxiao-site-export-" + LocalDate.now() + ".zip";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(exportService.packageZip());
    }
}
