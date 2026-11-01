package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.entity.ArchiveEntry;
import com.fuxiao.submission.entity.Article;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.repository.ArchiveEntryRepository;
import com.fuxiao.submission.repository.ArticleRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ArchiveService {

    private final ArchiveEntryRepository archiveRepository;
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final LogService logService;

    public ArchiveService(ArchiveEntryRepository archiveRepository, ArticleRepository articleRepository,
                          CategoryRepository categoryRepository, LogService logService) {
        this.archiveRepository = archiveRepository;
        this.articleRepository = articleRepository;
        this.categoryRepository = categoryRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<ArchiveEntry> list() {
        return archiveRepository.findAllByOrderByEntryDateDescIdDesc();
    }

    public ArchiveEntry create(ArchiveEntry payload) {
        ArchiveEntry entry = new ArchiveEntry();
        apply(entry, payload);
        entry.setCreatedAt(LocalDateTime.now());
        ArchiveEntry saved = archiveRepository.save(entry);
        logService.record("archive", "新增归档", saved.getTitle(), saved.getEntryDate().toString());
        return saved;
    }

    public ArchiveEntry update(Long id, ArchiveEntry payload) {
        ArchiveEntry entry = find(id);
        apply(entry, payload);
        ArchiveEntry saved = archiveRepository.save(entry);
        logService.record("archive", "修改归档", saved.getTitle(), saved.getEntryDate().toString());
        return saved;
    }

    public void delete(Long id) {
        ArchiveEntry entry = find(id);
        archiveRepository.delete(entry);
        logService.record("archive", "删除归档", entry.getTitle(), entry.getEntryDate().toString());
    }

    /**
     * 把已发布文章同步进归档：新增缺失条目、更新已关联条目、移除指向未发布文章的条目。
     */
    public Map<String, Object> sync() {
        List<Article> published = articleRepository.findAllByStatusOrderByPublishedAtDesc("published");
        Map<Long, String> categoryNames = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
        Set<Long> publishedIds = published.stream().map(Article::getId).collect(Collectors.toSet());

        int created = 0;
        int updated = 0;
        for (Article article : published) {
            ArchiveEntry entry = archiveRepository.findByArticleId(article.getId()).orElse(null);
            boolean isNew = entry == null;
            if (isNew) {
                entry = new ArchiveEntry();
                entry.setCreatedAt(LocalDateTime.now());
            }
            entry.setArticleId(article.getId());
            entry.setTitle(article.getTitle());
            entry.setEntryDate(article.getPublishedAt() == null ? LocalDate.now() : article.getPublishedAt());
            entry.setCategoryName(categoryNames.get(article.getCategoryId()));
            archiveRepository.save(entry);
            if (isNew) {
                created += 1;
            } else {
                updated += 1;
            }
        }

        int removed = 0;
        for (ArchiveEntry entry : archiveRepository.findAllByArticleIdIsNotNull()) {
            if (!publishedIds.contains(entry.getArticleId())) {
                archiveRepository.delete(entry);
                removed += 1;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("created", created);
        result.put("updated", updated);
        result.put("removed", removed);
        result.put("total", archiveRepository.count());
        logService.record("archive", "同步归档", "已发布文章 " + published.size() + " 篇",
                "新增 " + created + "，更新 " + updated + "，移除 " + removed);
        return result;
    }

    private void apply(ArchiveEntry entry, ArchiveEntry payload) {
        if (payload == null) {
            throw new BusinessException("没有收到归档内容");
        }
        if (payload.getTitle() == null || payload.getTitle().isBlank()) {
            throw new BusinessException("请填写标题");
        }
        if (payload.getEntryDate() == null) {
            throw new BusinessException("请选择日期");
        }
        entry.setTitle(payload.getTitle().trim());
        entry.setEntryDate(payload.getEntryDate());
        entry.setCategoryName(payload.getCategoryName());
        if (payload.getArticleId() != null) {
            Article article = articleRepository.findById(payload.getArticleId())
                    .orElseThrow(() -> BusinessException.notFound("关联文章"));
            entry.setArticleId(article.getId());
        } else {
            entry.setArticleId(null);
        }
    }

    private ArchiveEntry find(Long id) {
        return archiveRepository.findById(id).orElseThrow(() -> BusinessException.notFound("归档条目"));
    }
}
