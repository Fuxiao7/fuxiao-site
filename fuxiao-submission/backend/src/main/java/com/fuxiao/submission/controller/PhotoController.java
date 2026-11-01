package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.Photo;
import com.fuxiao.submission.service.PhotoService;
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
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping
    public ApiResponse<List<Photo>> list(@RequestParam(required = false) String collection,
                                         @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(photoService.list(collection, keyword));
    }

    @PostMapping
    public ApiResponse<Photo> create(@RequestBody Photo payload) {
        return ApiResponse.ok(photoService.create(payload));
    }

    @PutMapping("/{id}")
    public ApiResponse<Photo> update(@PathVariable Long id, @RequestBody Photo payload) {
        return ApiResponse.ok(photoService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        photoService.delete(id);
        return ApiResponse.ok();
    }
}
