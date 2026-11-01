package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.dto.ContentDtos;
import com.fuxiao.submission.dto.NowItemsRequest;
import com.fuxiao.submission.entity.NowItem;
import com.fuxiao.submission.entity.SiteSetting;
import com.fuxiao.submission.service.NowItemService;
import com.fuxiao.submission.service.SettingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SettingController {

    private final SettingService settingService;
    private final NowItemService nowItemService;

    public SettingController(SettingService settingService, NowItemService nowItemService) {
        this.settingService = settingService;
        this.nowItemService = nowItemService;
    }

    @GetMapping("/settings")
    public ApiResponse<List<SiteSetting>> list() {
        return ApiResponse.ok(settingService.list());
    }

    @PutMapping("/settings")
    public ApiResponse<Integer> update(@Valid @RequestBody ContentDtos.SettingUpdateRequest request) {
        return ApiResponse.ok(settingService.update(request));
    }

    @GetMapping("/now")
    public ApiResponse<List<NowItem>> listNow() {
        return ApiResponse.ok(nowItemService.list());
    }

    @PutMapping("/now")
    public ApiResponse<List<NowItem>> replaceNow(@RequestBody NowItemsRequest request) {
        return ApiResponse.ok(nowItemService.replace(request.items()));
    }
}
