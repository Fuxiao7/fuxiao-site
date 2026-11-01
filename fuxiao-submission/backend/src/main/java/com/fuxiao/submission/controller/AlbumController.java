package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.Album;
import com.fuxiao.submission.service.AlbumService;
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
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    @GetMapping
    public ApiResponse<List<Album>> list() {
        return ApiResponse.ok(albumService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<Album> get(@PathVariable Long id) {
        return ApiResponse.ok(albumService.get(id));
    }

    @PostMapping
    public ApiResponse<Album> create(@RequestBody Album payload) {
        return ApiResponse.ok(albumService.create(payload));
    }

    @PutMapping("/{id}")
    public ApiResponse<Album> update(@PathVariable Long id, @RequestBody Album payload) {
        return ApiResponse.ok(albumService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        albumService.delete(id);
        return ApiResponse.ok();
    }
}
