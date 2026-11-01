package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.Friend;
import com.fuxiao.submission.service.FriendService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @GetMapping
    public ApiResponse<List<Friend>> list() {
        return ApiResponse.ok(friendService.list());
    }

    @PostMapping
    public ApiResponse<Friend> create(@RequestBody Friend payload) {
        return ApiResponse.ok(friendService.create(payload));
    }

    @PutMapping("/{id}")
    public ApiResponse<Friend> update(@PathVariable Long id, @RequestBody Friend payload) {
        return ApiResponse.ok(friendService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        friendService.delete(id);
        return ApiResponse.ok();
    }
}
