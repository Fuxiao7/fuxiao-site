package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.common.PageResult;
import com.fuxiao.submission.dto.ContentDtos;
import com.fuxiao.submission.entity.Article;
import com.fuxiao.submission.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ApiResponse<PageResult<Article>> page(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(articleService.page(keyword, categoryId, status, featured, page, size));
    }

    @GetMapping("/options")
    public ApiResponse<List<ArticleService.Option>> options() {
        return ApiResponse.ok(articleService.options());
    }

    @GetMapping("/tags")
    public ApiResponse<List<Map<String, Object>>> tags() {
        return ApiResponse.ok(articleService.tagStats());
    }

    @PutMapping("/tags/rename")
    public ApiResponse<Integer> renameTag(@Valid @RequestBody ContentDtos.TagRenameRequest request) {
        return ApiResponse.ok(articleService.renameTag(request.from(), request.to()));
    }

    @GetMapping("/{id}")
    public ApiResponse<Article> get(@PathVariable Long id) {
        return ApiResponse.ok(articleService.get(id));
    }

    @PostMapping
    public ApiResponse<Article> create(@RequestBody Article payload) {
        return ApiResponse.ok(articleService.create(payload));
    }

    @PutMapping("/{id}")
    public ApiResponse<Article> update(@PathVariable Long id, @RequestBody Article payload) {
        return ApiResponse.ok(articleService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return ApiResponse.ok();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Article> setStatus(@PathVariable Long id,
                                          @Valid @RequestBody ContentDtos.StatusRequest request) {
        return ApiResponse.ok(articleService.setStatus(id, request.status()));
    }

    @PatchMapping("/{id}/featured")
    public ApiResponse<Article> setFeatured(@PathVariable Long id,
                                            @RequestBody ContentDtos.FeaturedRequest request) {
        return ApiResponse.ok(articleService.setFeatured(id, Boolean.TRUE.equals(request.featured())));
    }
}
