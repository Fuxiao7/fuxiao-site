package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.Moment;
import com.fuxiao.submission.service.MomentService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/moments")
public class MomentController {

    private final MomentService momentService;

    public MomentController(MomentService momentService) {
        this.momentService = momentService;
    }

    @GetMapping
    public ApiResponse<List<Moment>> list(@RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) String tagKey,
                                          @RequestParam(required = false) Integer year) {
        return ApiResponse.ok(momentService.list(keyword, tagKey, year));
    }

    @GetMapping("/{id}")
    public ApiResponse<Moment> get(@PathVariable Long id) {
        return ApiResponse.ok(momentService.get(id));
    }

    @PostMapping
    public ApiResponse<Moment> create(@RequestBody Moment payload) {
        return ApiResponse.ok(momentService.create(payload));
    }

    @PutMapping("/{id}")
    public ApiResponse<Moment> update(@PathVariable Long id, @RequestBody Moment payload) {
        return ApiResponse.ok(momentService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        momentService.delete(id);
        return ApiResponse.ok();
    }
}
