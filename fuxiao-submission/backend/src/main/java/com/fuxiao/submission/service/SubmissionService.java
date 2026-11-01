package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.ContentStatus;
import com.fuxiao.submission.common.MarkdownParser;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.common.PageResult;
import com.fuxiao.submission.dto.ContentDtos;
import com.fuxiao.submission.entity.Article;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.entity.Submission;
import com.fuxiao.submission.repository.ArticleRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import com.fuxiao.submission.repository.SubmissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final ArticleService articleService;
    private final LogService logService;

    public SubmissionService(SubmissionRepository submissionRepository, CategoryRepository categoryRepository,
                             ArticleRepository articleRepository, ArticleService articleService,
                             LogService logService) {
        this.submissionRepository = submissionRepository;
        this.categoryRepository = categoryRepository;
        this.articleRepository = articleRepository;
        this.articleService = articleService;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public PageResult<Submission> page(String status, String keyword, int page, int size) {
        Page<Submission> result = submissionRepository.search(
                blank(status), blank(keyword),
                PageRequest.of(Math.max(0, page - 1), Math.min(Math.max(size, 1), 100)));
        fillCategoryNames(result.getContent());
        return PageResult.of(result);
    }

    @Transactional(readOnly = true)
    public Submission get(Long id) {
        Submission submission = find(id);
        fillCategoryName(submission);
        return submission;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> counts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("pending", submissionRepository.countByStatus(ContentStatus.SUBMISSION_PENDING));
        counts.put("accepted", submissionRepository.countByStatus(ContentStatus.SUBMISSION_ACCEPTED));
        counts.put("rejected", submissionRepository.countByStatus(ContentStatus.SUBMISSION_REJECTED));
        counts.put("all", submissionRepository.count());
        return counts;
    }

    /** 采纳投稿：生成一篇文章草稿（或直接发布），并回填关联。 */
    public Map<String, Object> approve(Long id, ContentDtos.ApproveRequest request) {
        Submission submission = find(id);
        if (submission.getArticleId() != null) {
            throw new BusinessException("这条投稿已经生成过文章，不用再采纳一次");
        }
        Long categoryId = request != null && request.categoryId() != null
                ? request.categoryId() : submission.getCategoryId();
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> BusinessException.notFound("分类"));
        }

        Article article = new Article();
        article.setTitle(submission.getTitle());
        article.setExcerpt(submission.getExcerpt());
        article.setDeck(submission.getExcerpt());
        article.setCover(submission.getCover());
        article.setCategoryId(categoryId);
        article.setStatusKey(category == null ? "life" : category.getStatusKey());
        article.setStatus(Boolean.TRUE.equals(request == null ? null : request.publish())
                ? ContentStatus.PUBLISHED : ContentStatus.DRAFT);
        article.setPublishedAt(LocalDate.now());
        article.setAuthor(submission.getAuthorName());
        article.setLocation("读者投稿");
        article.setTags(category == null ? List.of("投稿") : List.of(category.getName(), "投稿"));
        article.setBlocks(MarkdownParser.parse(submission.getContent()));
        Article created = articleService.create(article);

        submission.setStatus(ContentStatus.SUBMISSION_ACCEPTED);
        submission.setArticleId(created.getId());
        submission.setReviewedBy(logService.currentUsername());
        submission.setReviewedAt(LocalDateTime.now());
        submission.setReviewNote(request == null || request.note() == null ? "已采纳，生成文章草稿" : request.note());
        submissionRepository.save(submission);
        logService.record("submission", "采纳投稿", submission.getTitle(),
                "生成文章 #" + created.getId() + "（" + created.getStatus() + "）");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("submission", get(id));
        result.put("articleId", created.getId());
        result.put("slug", created.getSlug());
        result.put("articleStatus", created.getStatus());
        return result;
    }

    public Submission reject(Long id, ContentDtos.RejectRequest request) {
        Submission submission = find(id);
        if (submission.getArticleId() != null) {
            throw new BusinessException("这条投稿已经生成文章，不能再退回");
        }
        submission.setStatus(ContentStatus.SUBMISSION_REJECTED);
        submission.setReviewNote(request == null ? null : request.note());
        submission.setReviewedBy(logService.currentUsername());
        submission.setReviewedAt(LocalDateTime.now());
        Submission saved = submissionRepository.save(submission);
        logService.record("submission", "退回投稿", submission.getTitle(),
                request == null ? null : request.note());
        return saved;
    }

    public void delete(Long id) {
        Submission submission = find(id);
        if (submission.getArticleId() != null) {
            articleRepository.findById(submission.getArticleId())
                    .ifPresent(article -> articleRepository.delete(article));
        }
        submissionRepository.delete(submission);
        logService.record("submission", "删除投稿", submission.getTitle(), submission.getAuthorName());
    }

    /** 公开投稿入口，无需登录。 */
    public Submission submitPublic(ContentDtos.PublicSubmissionRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            throw new BusinessException("提交失败");
        }
        if (request.authorEmail() != null && !request.authorEmail().isBlank()
                && !request.authorEmail().contains("@")) {
            throw new BusinessException("邮箱格式不对");
        }
        Long categoryId = request.categoryId();
        if (categoryId != null && categoryRepository.findById(categoryId).isEmpty()) {
            categoryId = null;
        }
        Submission submission = new Submission();
        submission.setTitle(request.title().trim());
        submission.setAuthorName(request.authorName().trim());
        submission.setAuthorEmail(blank(request.authorEmail()));
        submission.setAuthorSite(blank(request.authorSite()));
        submission.setCategoryId(categoryId);
        submission.setCover(MediaPaths.normalize(request.cover()));
        submission.setExcerpt(blank(request.excerpt()));
        submission.setContent(request.content());
        submission.setStatus(ContentStatus.SUBMISSION_PENDING);
        submission.setSubmittedAt(LocalDateTime.now());
        Submission saved = submissionRepository.save(submission);
        logService.record("system", "submission", "收到投稿", saved.getTitle(), "来自 " + saved.getAuthorName());
        return saved;
    }

    private void fillCategoryNames(List<Submission> submissions) {
        Map<Long, String> names = new LinkedHashMap<>();
        categoryRepository.findAll().forEach(category -> names.put(category.getId(), category.getName()));
        submissions.forEach(submission -> submission.setCategoryName(names.get(submission.getCategoryId())));
    }

    private void fillCategoryName(Submission submission) {
        if (submission.getCategoryId() == null) {
            return;
        }
        categoryRepository.findById(submission.getCategoryId())
                .ifPresent(category -> submission.setCategoryName(category.getName()));
    }

    private Submission find(Long id) {
        return submissionRepository.findById(id).orElseThrow(() -> BusinessException.notFound("投稿"));
    }

    private String blank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
