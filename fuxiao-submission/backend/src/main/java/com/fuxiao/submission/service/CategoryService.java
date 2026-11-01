package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.repository.ArticleRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final LogService logService;

    public CategoryService(CategoryRepository categoryRepository, ArticleRepository articleRepository,
                           LogService logService) {
        this.categoryRepository = categoryRepository;
        this.articleRepository = articleRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<Category> list() {
        List<Category> list = categoryRepository.findAllByOrderBySortOrderAscIdAsc();
        list.forEach(category -> category.setArticleCount(articleRepository.countByCategoryId(category.getId())));
        return list;
    }

    @Transactional(readOnly = true)
    public List<Category> visibleList() {
        return list().stream().filter(category -> Boolean.TRUE.equals(category.getVisible())).toList();
    }

    @Transactional
    public Category create(Category payload) {
        String name = requireName(payload.getName());
        if (categoryRepository.existsByName(name)) {
            throw new BusinessException("分类名已存在");
        }
        Category category = new Category();
        category.setName(name);
        category.setSlug(slugOf(payload.getSlug(), payload.getStatusKey(), name));
        category.setStatusKey(blankTo(payload.getStatusKey(), "write"));
        category.setSortOrder(payload.getSortOrder() == null ? nextSort() : payload.getSortOrder());
        category.setVisible(payload.getVisible() == null || payload.getVisible());
        category.setCreatedAt(LocalDateTime.now());
        Category saved = categoryRepository.save(category);
        logService.record("category", "新建分类", name, "标识 " + saved.getStatusKey());
        return saved;
    }

    @Transactional
    public Category update(Long id, Category payload) {
        Category category = find(id);
        String name = requireName(payload.getName());
        if (categoryRepository.existsByNameAndIdNot(name, id)) {
            throw new BusinessException("分类名已存在");
        }
        category.setName(name);
        category.setSlug(slugOf(payload.getSlug(), payload.getStatusKey(), name));
        category.setStatusKey(blankTo(payload.getStatusKey(), category.getStatusKey()));
        if (payload.getSortOrder() != null) {
            category.setSortOrder(payload.getSortOrder());
        }
        if (payload.getVisible() != null) {
            category.setVisible(payload.getVisible());
        }
        Category saved = categoryRepository.save(category);
        logService.record("category", "修改分类", name, null);
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Category category = find(id);
        if (articleRepository.existsByCategoryId(id)) {
            throw new BusinessException("这个分类下还有文章，先把文章换到别的分类");
        }
        categoryRepository.delete(category);
        logService.record("category", "删除分类", category.getName(), null);
    }

    private Category find(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> BusinessException.notFound("分类"));
    }

    private String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException("请填写分类名");
        }
        return name.trim();
    }

    private String slugOf(String slug, String statusKey, String fallback) {
        String value = slug != null && !slug.isBlank() ? slug : statusKey;
        if (value == null || value.isBlank()) {
            value = fallback;
        }
        return value.trim().toLowerCase().replaceAll("[^a-z0-9-]+", "-").replaceAll("^-+|-+$", "");
    }

    private int nextSort() {
        return categoryRepository.findAll().stream()
                .map(Category::getSortOrder)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    private String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
