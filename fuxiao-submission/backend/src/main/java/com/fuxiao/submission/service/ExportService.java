package com.fuxiao.submission.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuxiao.submission.common.ContentStatus;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.AboutProfile;
import com.fuxiao.submission.entity.Album;
import com.fuxiao.submission.entity.ArchiveEntry;
import com.fuxiao.submission.entity.Article;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.entity.Friend;
import com.fuxiao.submission.entity.MediaAsset;
import com.fuxiao.submission.entity.Moment;
import com.fuxiao.submission.entity.Photo;
import com.fuxiao.submission.entity.Project;
import com.fuxiao.submission.model.AboutColumn;
import com.fuxiao.submission.model.ArticleBlock;
import com.fuxiao.submission.model.Shot;
import com.fuxiao.submission.model.SpecItem;
import com.fuxiao.submission.repository.AboutProfileRepository;
import com.fuxiao.submission.repository.AlbumRepository;
import com.fuxiao.submission.repository.ArchiveEntryRepository;
import com.fuxiao.submission.repository.ArticleRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import com.fuxiao.submission.repository.FriendRepository;
import com.fuxiao.submission.repository.MediaAssetRepository;
import com.fuxiao.submission.repository.MomentRepository;
import com.fuxiao.submission.repository.NowItemRepository;
import com.fuxiao.submission.repository.PhotoRepository;
import com.fuxiao.submission.repository.ProjectRepository;
import com.fuxiao.submission.repository.SiteSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * 把后台内容导出成博客可以直接读取的 content.json / article-bodies.json / bodies.js。
 */
@Service
@Transactional(readOnly = true)
public class ExportService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy.MM.dd");
    private static final DateTimeFormatter MONTH_DAY = DateTimeFormatter.ofPattern("MM.dd");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");

    private static final String BODIES_JS = """
            import raw from "./article-bodies.json";
            import { posts } from "./content";

            /* 由「拂晓的投稿系统」导出：正文按 slug 存在 article-bodies.json 里。
               覆盖 lib/bodies.js 即可，接口与原来一致。 */
            export function articleFor(slug) {
              const post = posts.find((p) => p.slug === slug) || posts[0];
              const extra = raw[post.slug];
              return {
                ...post,
                deck: extra?.deck || post.excerpt,
                blocks: extra?.blocks || [{ t: "p", text: post.excerpt }],
              };
            }

            export const postIndex = (slug) => posts.findIndex((p) => p.slug === slug);
            """;

    private final ArticleRepository articleRepository;
    private final AlbumRepository albumRepository;
    private final MomentRepository momentRepository;
    private final ProjectRepository projectRepository;
    private final PhotoRepository photoRepository;
    private final FriendRepository friendRepository;
    private final ArchiveEntryRepository archiveRepository;
    private final AboutProfileRepository aboutRepository;
    private final MediaAssetRepository mediaRepository;
    private final CategoryRepository categoryRepository;
    private final SiteSettingRepository settingRepository;
    private final NowItemRepository nowItemRepository;
    private final ObjectMapper objectMapper;

    public ExportService(ArticleRepository articleRepository, AlbumRepository albumRepository,
                         MomentRepository momentRepository, ProjectRepository projectRepository,
                         PhotoRepository photoRepository, FriendRepository friendRepository,
                         ArchiveEntryRepository archiveRepository, AboutProfileRepository aboutRepository,
                         MediaAssetRepository mediaRepository, CategoryRepository categoryRepository,
                         SiteSettingRepository settingRepository, NowItemRepository nowItemRepository,
                         ObjectMapper objectMapper) {
        this.articleRepository = articleRepository;
        this.albumRepository = albumRepository;
        this.momentRepository = momentRepository;
        this.projectRepository = projectRepository;
        this.photoRepository = photoRepository;
        this.friendRepository = friendRepository;
        this.archiveRepository = archiveRepository;
        this.aboutRepository = aboutRepository;
        this.mediaRepository = mediaRepository;
        this.categoryRepository = categoryRepository;
        this.settingRepository = settingRepository;
        this.nowItemRepository = nowItemRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> buildContent() {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("posts", posts());
        content.put("categories", categories());
        content.put("site", siteCopy());
        content.put("archive", archiveFlat());
        content.put("archiveYears", archiveYears());
        content.put("moments", moments());
        content.put("projects", projects());
        content.put("friends", friends());
        content.put("bio", bio());
        content.put("aboutCols", aboutCols());
        content.put("albums", albums());
        content.put("photos", photos(Photo.WALL));
        content.put("scatter", photos(Photo.SCATTER));
        content.put("archiveGroups", archiveGroups());
        return content;
    }

    public Map<String, Object> buildArticleBodies() {
        Map<String, Object> bodies = new LinkedHashMap<>();
        for (Article article : publishedArticles()) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("title", article.getTitle());
            body.put("deck", article.getDeck() == null ? article.getExcerpt() : article.getDeck());
            body.put("blocks", exportBlocks(article.getBlocks()));
            bodies.put(article.getSlug(), body);
        }
        return bodies;
    }

    /** 正文插图要还原成博客 media() 认识的文件名（/media、/uploads 前缀都要去掉）。 */
    private List<ArticleBlock> exportBlocks(List<ArticleBlock> blocks) {
        List<ArticleBlock> exported = new ArrayList<>();
        if (blocks == null) {
            return exported;
        }
        for (ArticleBlock block : blocks) {
            if (ArticleBlock.IMAGE.equals(block.t())) {
                exported.add(new ArticleBlock(block.t(), null, MediaPaths.fileName(block.src()),
                        block.alt(), block.cap()));
            } else {
                exported.add(block);
            }
        }
        return exported;
    }

    public String contentJson() {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(buildContent());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("导出 content.json 失败", e);
        }
    }

    public String articleBodiesJson() {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(buildArticleBodies());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("导出 article-bodies.json 失败", e);
        }
    }

    public String bodiesJs() {
        return BODIES_JS;
    }

    public byte[] contentBytes() {
        return contentJson().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] packageZip() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(out, StandardCharsets.UTF_8)) {
            put(zip, "content.json", contentJson());
            put(zip, "article-bodies.json", articleBodiesJson());
            put(zip, "bodies.js", bodiesJs());
            put(zip, "media-manifest.json", objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(mediaManifest()));
            put(zip, "README.md", readme());
            zip.finish();
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("打包导出文件失败", e);
        }
    }

    private void put(ZipOutputStream zip, String name, String text) throws IOException {
        ZipEntry entry = new ZipEntry(name);
        zip.putNextEntry(entry);
        zip.write(text.getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private List<Article> publishedArticles() {
        return articleRepository.findAll().stream()
                .filter(article -> ContentStatus.PUBLISHED.equals(article.getStatus()))
                .sorted((a, b) -> {
                    boolean featuredA = Boolean.TRUE.equals(a.getFeatured());
                    boolean featuredB = Boolean.TRUE.equals(b.getFeatured());
                    if (featuredA != featuredB) {
                        return featuredA ? -1 : 1;
                    }
                    LocalDate dateA = a.getPublishedAt();
                    LocalDate dateB = b.getPublishedAt();
                    if (dateA == null && dateB == null) {
                        return Long.compare(a.getId(), b.getId());
                    }
                    if (dateA == null) {
                        return 1;
                    }
                    if (dateB == null) {
                        return -1;
                    }
                    int byDate = dateB.compareTo(dateA);
                    return byDate != 0 ? byDate : Long.compare(a.getId(), b.getId());
                })
                .toList();
    }

    private List<Map<String, Object>> posts() {
        Map<Long, String> categoryNames = categoryNames();
        List<Map<String, Object>> posts = new ArrayList<>();
        for (Article article : publishedArticles()) {
            LocalDate date = article.getPublishedAt() != null
                    ? article.getPublishedAt()
                    : article.getCreatedAt().toLocalDate();
            Map<String, Object> post = new LinkedHashMap<>();
            post.put("slug", article.getSlug());
            post.put("title", article.getTitle());
            post.put("cover", MediaPaths.fileName(article.getCover()));
            post.put("alt", article.getCoverAlt());
            post.put("excerpt", article.getExcerpt());
            post.put("category", article.getCategoryId() == null
                    ? "" : categoryNames.getOrDefault(article.getCategoryId(), ""));
            post.put("date", date.format(DATE));
            post.put("status", article.getStatusKey());
            post.put("tags", article.getTags());
            posts.add(post);
        }
        return posts;
    }

    private List<Map<String, Object>> categories() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Category category : categoryRepository.findAllByOrderBySortOrderAscIdAsc()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", category.getName());
            item.put("slug", category.getSlug());
            item.put("statusKey", category.getStatusKey());
            item.put("sortOrder", category.getSortOrder());
            item.put("visible", category.getVisible());
            list.add(item);
        }
        return list;
    }

    private Map<String, Object> siteCopy() {
        Map<String, String> copy = new LinkedHashMap<>();
        settingRepository.findAllByOrderByGroupKeyAscSortOrderAscIdAsc()
                .forEach(setting -> copy.put(setting.getSettingKey(), setting.getValue()));

        List<Map<String, Object>> now = new ArrayList<>();
        nowItemRepository.findAllByOrderBySortOrderAscIdAsc().forEach(item -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("label", item.getLabel());
            entry.put("value", item.getValue());
            entry.put("note", item.getNote());
            now.add(entry);
        });

        Map<String, Object> site = new LinkedHashMap<>();
        site.put("copy", copy);
        site.put("now", now);
        site.put("about", aboutExtras());
        return site;
    }

    private Map<String, Object> aboutExtras() {
        AboutProfile profile = aboutRepository.findById(1L).orElse(null);
        Map<String, Object> about = new LinkedHashMap<>();
        if (profile == null) {
            return about;
        }
        about.put("displayName", profile.getDisplayName());
        about.put("subtitle", profile.getSubtitle());
        about.put("meta", profile.getMeta());
        about.put("portrait", MediaPaths.fileName(profile.getPortrait()));
        about.put("portraitAlt", profile.getPortraitAlt());
        about.put("portraitCaption", profile.getPortraitCaption());
        about.put("email", profile.getEmail());
        about.put("github", profile.getGithub());
        about.put("twitter", profile.getTwitter());
        return about;
    }

    private Map<Long, String> categoryNames() {
        Map<Long, String> names = new LinkedHashMap<>();
        categoryRepository.findAll().forEach(category -> names.put(category.getId(), category.getName()));
        return names;
    }

    private List<Map<String, Object>> archiveGroups() {
        Map<String, List<ArchiveEntry>> grouped = new LinkedHashMap<>();
        List<ArchiveEntry> entries = archiveRepository.findAllByOrderByEntryDateDescIdDesc();
        for (ArchiveEntry entry : entries) {
            String year = String.valueOf(entry.getEntryDate().getYear());
            grouped.computeIfAbsent(year, key -> new ArrayList<>()).add(entry);
        }
        List<Map<String, Object>> groups = new ArrayList<>();
        grouped.forEach((year, rows) -> {
            Map<String, Object> group = new LinkedHashMap<>();
            group.put("year", year);
            group.put("count", rows.size());
            List<Map<String, Object>> list = new ArrayList<>();
            for (ArchiveEntry row : rows) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("date", row.getEntryDate().format(MONTH_DAY));
                item.put("title", row.getTitle());
                item.put("cat", row.getCategoryName());
                list.add(item);
            }
            group.put("rows", list);
            groups.add(group);
        });
        return groups;
    }

    private List<Object> archiveFlat() {
        List<Object> flat = new ArrayList<>();
        for (Map<String, Object> group : archiveGroups()) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rows = (List<Map<String, Object>>) group.get("rows");
            for (Map<String, Object> row : rows) {
                List<Object> item = new ArrayList<>();
                item.add(row.get("date"));
                item.add(row.get("title"));
                item.add(row.get("cat"));
                flat.add(item);
            }
        }
        return flat;
    }

    private List<Object> archiveYears() {
        List<Object> years = new ArrayList<>();
        for (Map<String, Object> group : archiveGroups()) {
            List<Object> item = new ArrayList<>();
            item.add(group.get("year"));
            item.add(group.get("count") + " 篇");
            years.add(item);
        }
        return years;
    }

    private List<Map<String, Object>> moments() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Moment moment : momentRepository.findAllByOrderByOccurredAtDesc()) {
            if (!Boolean.TRUE.equals(moment.getPublished())) {
                continue;
            }
            LocalDateTime time = moment.getOccurredAt();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date", time.format(MONTH_DAY));
            item.put("time", time.format(TIME));
            item.put("tag", moment.getTagLabel());
            item.put("key", moment.getTagKey());
            item.put("body", moment.getBody());
            item.put("images", files(moment.getImages()));
            item.put("year", String.valueOf(time.getYear()));
            list.add(item);
        }
        return list;
    }

    private List<Map<String, Object>> projects() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Project project : projectRepository.findAllByOrderBySortOrderAscIdAsc()) {
            if (!Boolean.TRUE.equals(project.getPublished())) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("title", project.getTitle());
            item.put("status", project.getStatus());
            item.put("pct", (project.getProgress() == null ? 0 : project.getProgress()) + "%");
            item.put("say", project.getSummary());
            item.put("spec", project.getSpec());
            item.put("when", project.getPeriod());
            item.put("images", files(project.getImages()));
            item.put("tags", project.getTags());
            list.add(item);
        }
        return list;
    }

    private List<Map<String, Object>> friends() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Friend friend : friendRepository.findAllByOrderBySortOrderAscIdAsc()) {
            if (!Boolean.TRUE.equals(friend.getVisible())) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", friend.getName());
            item.put("site", friend.getSite());
            item.put("desc", friend.getDescription());
            item.put("url", friend.getUrl());
            list.add(item);
        }
        return list;
    }

    private List<String> bio() {
        AboutProfile profile = aboutRepository.findById(1L).orElse(null);
        return profile == null ? new ArrayList<>() : profile.getBio();
    }

    private List<Map<String, Object>> aboutCols() {
        AboutProfile profile = aboutRepository.findById(1L).orElse(null);
        List<Map<String, Object>> cols = new ArrayList<>();
        if (profile == null) {
            return cols;
        }
        for (AboutColumn column : profile.getCols()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("title", column.title());
            item.put("items", column.items());
            cols.add(item);
        }
        return cols;
    }

    private List<Map<String, Object>> albums() {
        List<Album> albums = albumRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .filter(album -> Boolean.TRUE.equals(album.getPublished()))
                .toList();
        List<Map<String, Object>> list = new ArrayList<>();
        for (int index = 0; index < albums.size(); index += 1) {
            Album album = albums.get(index);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("file", "album-" + album.getSlug() + ".html");
            item.put("title", album.getTitle());
            item.put("cover", MediaPaths.stem(album.getCover()));
            item.put("cover_alt", album.getCoverAlt());
            item.put("meta", album.getMeta());
            item.put("lead", album.getLead());
            item.put("specs", pairs(album.getSpecs()));
            item.put("why", album.getWhy());
            item.put("quote", album.getQuote());
            item.put("story", album.getStory());
            item.put("story_quote", album.getStoryQuote());
            item.put("process", pairs(album.getProcess()));
            item.put("run1", shots(album.getRun1()));
            item.put("run2", shots(album.getRun2()));
            if (!albums.isEmpty()) {
                Album next = albums.get((index + 1) % albums.size());
                List<Object> nextItem = new ArrayList<>();
                nextItem.add("album-" + next.getSlug() + ".html");
                nextItem.add(next.getTitle());
                String nextCover = MediaPaths.stem(next.getCover());
                nextItem.add(nextCover == null ? "" : nextCover);
                item.put("next", nextItem);
            } else {
                item.put("next", new ArrayList<>());
            }
            list.add(item);
        }
        return list;
    }

    private List<Object> pairs(List<SpecItem> specs) {
        List<Object> list = new ArrayList<>();
        if (specs == null) {
            return list;
        }
        for (SpecItem spec : specs) {
            list.add(List.of(spec.k() == null ? "" : spec.k(), spec.v() == null ? "" : spec.v()));
        }
        return list;
    }

    private List<Object> shots(List<Shot> shots) {
        List<Object> list = new ArrayList<>();
        if (shots == null) {
            return list;
        }
        for (Shot shot : shots) {
            list.add(List.of(MediaPaths.stem(shot.img()),
                    shot.alt() == null ? "" : shot.alt(),
                    shot.cap() == null ? "" : shot.cap()));
        }
        return list;
    }

    private List<Map<String, Object>> photos(String collection) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Photo photo : photoRepository.findByCollectionOrderBySortOrderAscIdAsc(collection)) {
            if (!Boolean.TRUE.equals(photo.getVisible())) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("title", photo.getTitle());
            item.put("exif", photo.getExif());
            item.put("img", MediaPaths.fileName(photo.getImage()));
            item.put("alt", photo.getAlt());
            list.add(item);
        }
        return list;
    }

    private List<String> files(List<String> paths) {
        List<String> files = new ArrayList<>();
        if (paths == null) {
            return files;
        }
        for (String path : paths) {
            String name = MediaPaths.fileName(path);
            if (name != null) {
                files.add(name);
            }
        }
        return files;
    }

    private Map<String, Object> mediaManifest() {
        Set<String> names = new TreeSet<>();
        for (MediaAsset asset : mediaRepository.findAll()) {
            if (MediaAsset.SOURCE_UPLOAD.equals(asset.getSource())) {
                names.add(MediaPaths.fileName(asset.getPath()));
            }
        }
        Map<String, Object> manifest = new LinkedHashMap<>();
        manifest.put("note", "把下列上传图片复制到博客 public/media/ 下，导出的 content.json 才能找到它们。");
        manifest.put("uploads", names);
        return manifest;
    }

    private String readme() {
        return """
                # 拂晓的投稿系统 · 导出包

                这个压缩包由后台「导出与发布」页面生成，用来把数据库里的内容写回博客。

                ## 文件

                - `content.json`：文章列表、分类、影集、说说、项目、友链、归档、照片、关于页简介，
                  以及 `site`（站点文案 + 首页「此刻」）。结构与原 `lib/content.json` 一致，多出的键可以忽略。
                - `article-bodies.json`：每篇文章的 `deck` 与 `blocks`（正文分块）。
                - `bodies.js`：可以直接覆盖博客的 `lib/bodies.js`，它会从 `article-bodies.json` 读取正文。
                - `media-manifest.json`：后台上传过的图片清单，需要复制到 `public/media/`。

                ## 步骤

                1. 把 `content.json` 覆盖到 `lib/content.json`。
                2. 把 `article-bodies.json` 放到 `lib/`，并把 `bodies.js` 覆盖到 `lib/bodies.js`。
                3. 打开 `media-manifest.json`，把里面列出的图片从后台上传目录复制到 `public/media/`。
                4. 在博客目录执行 `npm run build`（或 `npm run dev`）确认页面正常。

                ## 关于 site 与 categories

                `content.json` 里的 `site.copy`、`site.now`、`categories` 是后台维护的最新文案与分类。
                当前博客的页面文案仍写在 `screens/` 里，需要一次性改成从 `content.json` 读取这些键，
                文案才会自动生效；在此之前可以把它们当作对照表使用。

                > 板块、排版与样式由博客前端代码决定，不在本系统的修改范围内；
                > 本导出只更新「内容」，不会改动 `app/`、`components/`、`screens/` 里的布局与样式。
                """;
    }
}
