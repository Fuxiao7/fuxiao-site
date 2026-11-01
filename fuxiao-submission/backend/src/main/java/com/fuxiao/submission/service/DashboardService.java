package com.fuxiao.submission.service;

import com.fuxiao.submission.common.ContentStatus;
import com.fuxiao.submission.entity.ArchiveEntry;
import com.fuxiao.submission.entity.Article;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.entity.Submission;
import com.fuxiao.submission.repository.AlbumRepository;
import com.fuxiao.submission.repository.ArchiveEntryRepository;
import com.fuxiao.submission.repository.ArticleRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import com.fuxiao.submission.repository.FriendRepository;
import com.fuxiao.submission.repository.MediaAssetRepository;
import com.fuxiao.submission.repository.MomentRepository;
import com.fuxiao.submission.repository.OperationLogRepository;
import com.fuxiao.submission.repository.PhotoRepository;
import com.fuxiao.submission.repository.ProjectRepository;
import com.fuxiao.submission.repository.SubmissionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final String[] COLORS = {"#a8611f", "#8ba3a6", "#d15b34", "#6f6a60", "#4f7a5a", "#7d6b8f"};

    private final ArticleRepository articleRepository;
    private final AlbumRepository albumRepository;
    private final MomentRepository momentRepository;
    private final ProjectRepository projectRepository;
    private final PhotoRepository photoRepository;
    private final FriendRepository friendRepository;
    private final SubmissionRepository submissionRepository;
    private final MediaAssetRepository mediaRepository;
    private final ArchiveEntryRepository archiveRepository;
    private final CategoryRepository categoryRepository;
    private final OperationLogRepository logRepository;
    private final SubmissionService submissionService;

    public DashboardService(ArticleRepository articleRepository, AlbumRepository albumRepository,
                            MomentRepository momentRepository, ProjectRepository projectRepository,
                            PhotoRepository photoRepository, FriendRepository friendRepository,
                            SubmissionRepository submissionRepository, MediaAssetRepository mediaRepository,
                            ArchiveEntryRepository archiveRepository, CategoryRepository categoryRepository,
                            OperationLogRepository logRepository, SubmissionService submissionService) {
        this.articleRepository = articleRepository;
        this.albumRepository = albumRepository;
        this.momentRepository = momentRepository;
        this.projectRepository = projectRepository;
        this.photoRepository = photoRepository;
        this.friendRepository = friendRepository;
        this.submissionRepository = submissionRepository;
        this.mediaRepository = mediaRepository;
        this.archiveRepository = archiveRepository;
        this.categoryRepository = categoryRepository;
        this.logRepository = logRepository;
        this.submissionService = submissionService;
    }

    public Map<String, Object> overview() {
        List<Article> articles = articleRepository.findAll();
        long views = articles.stream().mapToLong(item -> item.getViews() == null ? 0 : item.getViews()).sum();
        long words = articles.stream().mapToLong(item -> item.getWordCount() == null ? 0 : item.getWordCount()).sum();
        long published = articles.stream()
                .filter(item -> ContentStatus.PUBLISHED.equals(item.getStatus())).count();
        long drafts = articles.stream()
                .filter(item -> ContentStatus.DRAFT.equals(item.getStatus())).count();
        long offline = articles.stream()
                .filter(item -> ContentStatus.OFFLINE.equals(item.getStatus())).count();

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("articles", articles.size());
        counts.put("published", published);
        counts.put("drafts", drafts);
        counts.put("offline", offline);
        counts.put("albums", albumRepository.count());
        counts.put("photos", photoRepository.count());
        counts.put("moments", momentRepository.count());
        counts.put("projects", projectRepository.count());
        counts.put("friends", friendRepository.count());
        counts.put("archive", archiveRepository.count());
        counts.put("submissions", submissionRepository.count());
        counts.put("pendingSubmissions", submissionRepository.countByStatus(ContentStatus.SUBMISSION_PENDING));
        counts.put("media", mediaRepository.count());
        counts.put("views", views);
        counts.put("words", words);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("counts", counts);
        result.put("trend", trend());
        result.put("categories", categoryDistribution());
        result.put("recentSubmissions", recentSubmissions());
        result.put("recentLogs", logRepository.search(null, null, null, PageRequest.of(0, 6)).getContent());
        result.put("health", health());
        result.put("submissionCounts", submissionService.counts());
        return result;
    }

    private List<Map<String, Object>> trend() {
        List<LocalDate> dates = articleRepository.findPublishedDates();
        YearMonth current = YearMonth.now();
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i -= 1) {
            YearMonth month = current.minusMonths(i);
            long count = dates.stream().filter(date -> YearMonth.from(date).equals(month)).count();
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("month", month.toString());
            point.put("count", count);
            trend.add(point);
        }
        return trend;
    }

    private List<Map<String, Object>> categoryDistribution() {
        Map<Long, String> names = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
        List<Map<String, Object>> list = new ArrayList<>();
        int index = 0;
        for (Object[] row : articleRepository.countGroupByCategory()) {
            Long categoryId = row[0] == null ? null : ((Number) row[0]).longValue();
            long count = row[1] == null ? 0 : ((Number) row[1]).longValue();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", categoryId == null ? "未分类" : names.getOrDefault(categoryId, "未分类"));
            item.put("count", count);
            item.put("color", COLORS[index % COLORS.length]);
            list.add(item);
            index += 1;
        }
        list.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        return list;
    }

    private List<Submission> recentSubmissions() {
        List<Submission> submissions = submissionRepository
                .search(ContentStatus.SUBMISSION_PENDING, null, PageRequest.of(0, 5)).getContent();
        Map<Long, String> names = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
        submissions.forEach(item -> item.setCategoryName(names.get(item.getCategoryId())));
        return submissions;
    }

    private List<Map<String, Object>> health() {
        List<Map<String, Object>> items = new ArrayList<>();
        long noCover = articleRepository.countPublishedWithoutCover();
        long noContent = articleRepository.countPublishedWithoutContent();
        long pending = submissionRepository.countByStatus(ContentStatus.SUBMISSION_PENDING);
        long drafts = articleRepository.countByStatus(ContentStatus.DRAFT);

        Set<Long> linked = archiveRepository.findAllByArticleIdIsNotNull().stream()
                .map(ArchiveEntry::getArticleId).collect(Collectors.toSet());
        long unsynced = articleRepository.findPublishedIds().stream()
                .filter(id -> !linked.contains(id)).count();

        items.add(healthItem("cover", "已发布但缺封面", noCover, "去文章里补一张封面"));
        items.add(healthItem("content", "已发布但没有正文", noContent, "检查正文是否为空"));
        items.add(healthItem("archive", "尚未同步到归档", unsynced, "到归档页点一次「从文章同步」"));
        items.add(healthItem("pending", "投稿等待审阅", pending, "去投稿箱看看"));
        items.add(healthItem("drafts", "草稿箱里的文章", drafts, "草稿不会出现在站点上"));
        return items;
    }

    private Map<String, Object> healthItem(String key, String label, long count, String hint) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("key", key);
        item.put("label", label);
        item.put("count", count);
        item.put("level", count > 0 ? "warn" : "ok");
        item.put("hint", hint);
        return item;
    }
}
