package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.ContentStatus;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.common.PageResult;
import com.fuxiao.submission.entity.Article;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.model.ArticleBlock;
import com.fuxiao.submission.repository.ArticleRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class ArticleService {

    private static final Set<String> BLOCK_TYPES = Set.of(
            ArticleBlock.P, ArticleBlock.H2, ArticleBlock.QUOTE, ArticleBlock.CODE, ArticleBlock.IMAGE);

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final LogService logService;

    public ArticleService(ArticleRepository articleRepository, CategoryRepository categoryRepository,
                          LogService logService) {
        this.articleRepository = articleRepository;
        this.categoryRepository = categoryRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public PageResult<Article> page(String keyword, Long categoryId, String status, Boolean featured,
                                    int page, int size) {
        Page<Article> result = articleRepository.search(
                blank(keyword), categoryId, blank(status), featured,
                PageRequest.of(Math.max(0, page - 1), Math.min(Math.max(size, 1), 100)));
        fillCategoryNames(result.getContent());
        return PageResult.of(result);
    }

    @Transactional(readOnly = true)
    public Article get(Long id) {
        Article article = find(id);
        fillCategoryName(article);
        return article;
    }

    public Article create(Article payload) {
        Article article = new Article();
        apply(article, payload);
        LocalDateTime now = LocalDateTime.now();
        article.setCreatedAt(now);
        article.setUpdatedAt(now);
        article.setViews(0);
        Article saved = articleRepository.save(article);
        logService.record("article", "新建文章", saved.getTitle(), "状态 " + saved.getStatus());
        return get(saved.getId());
    }

    public Article update(Long id, Article payload) {
        Article article = find(id);
        apply(article, payload);
        article.setUpdatedAt(LocalDateTime.now());
        Article saved = articleRepository.save(article);
        logService.record("article", "修改文章", saved.getTitle(), "状态 " + saved.getStatus());
        return get(saved.getId());
    }

    public void delete(Long id) {
        Article article = find(id);
        articleRepository.delete(article);
        logService.record("article", "删除文章", article.getTitle(), "slug " + article.getSlug());
    }

    public Article setStatus(Long id, String status) {
        if (!ContentStatus.isValidArticleStatus(status)) {
            throw new BusinessException("不认识的文章状态：" + status);
        }
        Article article = find(id);
        article.setStatus(status);
        if (ContentStatus.PUBLISHED.equals(status) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDate.now());
        }
        article.setUpdatedAt(LocalDateTime.now());
        Article saved = articleRepository.save(article);
        logService.record("article", "变更状态", saved.getTitle(), "→ " + status);
        return get(saved.getId());
    }

    public Article setFeatured(Long id, boolean featured) {
        Article article = find(id);
        article.setFeatured(featured);
        article.setUpdatedAt(LocalDateTime.now());
        Article saved = articleRepository.save(article);
        logService.record("article", featured ? "设为精选" : "取消精选", saved.getTitle(), null);
        return get(saved.getId());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> tagStats() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Article article : articleRepository.findAll()) {
            for (String tag : safe(article.getTags())) {
                counts.merge(tag, 1L, Long::sum);
            }
        }
        return counts.entrySet().stream()
                .sorted((a, b) -> {
                    int byCount = Long.compare(b.getValue(), a.getValue());
                    return byCount != 0 ? byCount : a.getKey().compareTo(b.getKey());
                })
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .toList();
    }

    public int renameTag(String from, String to) {
        String source = blank(from);
        String target = blank(to);
        if (source == null || target == null) {
            throw new BusinessException("标签名不能为空");
        }
        int changed = 0;
        List<Article> touched = new ArrayList<>();
        for (Article article : articleRepository.findAll()) {
            List<String> tags = safe(article.getTags());
            if (!tags.contains(source)) {
                continue;
            }
            List<String> replaced = new ArrayList<>();
            for (String tag : tags) {
                String next = tag.equals(source) ? target : tag;
                if (!replaced.contains(next)) {
                    replaced.add(next);
                }
            }
            article.setTags(replaced);
            article.setUpdatedAt(LocalDateTime.now());
            touched.add(article);
            changed += 1;
        }
        if (!touched.isEmpty()) {
            articleRepository.saveAll(touched);
            logService.record("article", "重命名标签", source, "改为 " + target + "，影响 " + changed + " 篇");
        }
        return changed;
    }

    @Transactional(readOnly = true)
    public List<Option> options() {
        return articleRepository.findAllByOrderByPublishedAtDescIdDesc().stream()
                .map(article -> new Option(article.getId(), article.getTitle(), article.getSlug()))
                .toList();
    }

    private void apply(Article article, Article payload) {
        if (payload == null) {
            throw new BusinessException("没有收到文章内容");
        }
        String title = blank(payload.getTitle());
        if (title == null) {
            throw new BusinessException("请填写标题");
        }
        article.setTitle(title.length() > 255 ? title.substring(0, 255) : title);

        String slug = normalizeSlug(payload.getSlug());
        if (slug == null) {
            slug = "post-" + DateTimeFormatter.ofPattern("yyyyMMddHHmm").format(LocalDateTime.now());
        }
        article.setSlug(uniqueSlug(slug, article.getId()));

        String status = blank(payload.getStatus());
        if (status == null) {
            status = ContentStatus.DRAFT;
        }
        if (!ContentStatus.isValidArticleStatus(status)) {
            throw new BusinessException("不认识的文章状态：" + status);
        }
        article.setStatus(status);

        String excerpt = blank(payload.getExcerpt());
        article.setExcerpt(excerpt);
        article.setDeck(blank(payload.getDeck()) == null ? excerpt : payload.getDeck().trim());
        article.setCover(MediaPaths.normalize(payload.getCover()));
        article.setCoverAlt(blank(payload.getCoverAlt()));
        article.setAuthor(blank(payload.getAuthor()) == null ? "拂晓" : payload.getAuthor().trim());
        article.setLocation(blank(payload.getLocation()) == null ? "杭州" : payload.getLocation().trim());
        article.setFeatured(Boolean.TRUE.equals(payload.getFeatured()));

        Category category = null;
        if (payload.getCategoryId() != null) {
            category = categoryRepository.findById(payload.getCategoryId())
                    .orElseThrow(() -> BusinessException.notFound("分类"));
        }
        article.setCategoryId(payload.getCategoryId());
        article.setStatusKey(blank(payload.getStatusKey()) == null
                ? (category == null ? "write" : category.getStatusKey())
                : payload.getStatusKey().trim());

        if (payload.getPublishedAt() != null) {
            article.setPublishedAt(payload.getPublishedAt());
        }
        if (ContentStatus.PUBLISHED.equals(article.getStatus()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDate.now());
        }

        List<ArticleBlock> blocks = sanitizeBlocks(payload.getBlocks());
        article.setBlocks(blocks);
        article.setTags(sanitizeTags(payload.getTags()));

        int words = countWords(blocks);
        article.setWordCount(words);
        article.setReadingMinutes(Math.max(2, (int) Math.round(words / 400.0)));
    }

    private List<ArticleBlock> sanitizeBlocks(List<ArticleBlock> input) {
        List<ArticleBlock> cleaned = new ArrayList<>();
        if (input == null) {
            return cleaned;
        }
        for (ArticleBlock block : input) {
            if (block == null) {
                continue;
            }
            String type = block.t() == null
                    ? ArticleBlock.P
                    : (BLOCK_TYPES.contains(block.t()) ? block.t() : ArticleBlock.P);
            if (ArticleBlock.IMAGE.equals(type)) {
                String src = MediaPaths.normalize(block.src());
                if (src == null) {
                    continue;
                }
                cleaned.add(new ArticleBlock(type, null, src, blank(block.alt()), blank(block.cap())));
                continue;
            }
            String text = block.text();
            if (text == null || text.isBlank()) {
                continue;
            }
            cleaned.add(new ArticleBlock(type, ArticleBlock.CODE.equals(type) ? text : text.trim(),
                    null, null, null));
        }
        return cleaned;
    }

    private List<String> sanitizeTags(List<String> input) {
        if (input == null) {
            return new ArrayList<>();
        }
        Set<String> unique = new HashSet<>();
        List<String> tags = new ArrayList<>();
        for (String raw : input) {
            String tag = blank(raw);
            if (tag != null && unique.add(tag)) {
                tags.add(tag.length() > 40 ? tag.substring(0, 40) : tag);
            }
            if (tags.size() >= 12) {
                break;
            }
        }
        return tags;
    }

    private int countWords(List<ArticleBlock> blocks) {
        int words = 0;
        for (ArticleBlock block : blocks) {
            if (block.text() != null) {
                words += block.text().replaceAll("\\s+", "").length();
            }
        }
        return words;
    }

    private String normalizeSlug(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String slug = raw.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.length() > 100) {
            slug = slug.substring(0, 100);
        }
        return slug.isBlank() ? null : slug;
    }

    private String uniqueSlug(String base, Long currentId) {
        String candidate = base;
        int suffix = 2;
        while (currentId == null
                ? articleRepository.existsBySlug(candidate)
                : articleRepository.existsBySlugAndIdNot(candidate, currentId)) {
            candidate = base + "-" + suffix;
            suffix += 1;
            if (suffix > 99) {
                candidate = base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return candidate;
    }

    private void fillCategoryNames(List<Article> articles) {
        Map<Long, String> names = new LinkedHashMap<>();
        for (Category category : categoryRepository.findAll()) {
            names.put(category.getId(), category.getName());
        }
        for (Article article : articles) {
            article.setCategoryName(names.get(article.getCategoryId()));
        }
    }

    private void fillCategoryName(Article article) {
        if (article.getCategoryId() == null) {
            return;
        }
        categoryRepository.findById(article.getCategoryId())
                .ifPresent(category -> article.setCategoryName(category.getName()));
    }

    private Article find(Long id) {
        return articleRepository.findById(id).orElseThrow(() -> BusinessException.notFound("文章"));
    }

    private List<String> safe(List<String> list) {
        return list == null ? new ArrayList<>() : new ArrayList<>(list);
    }

    private String blank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record Option(Long id, String title, String slug) {
    }
}
