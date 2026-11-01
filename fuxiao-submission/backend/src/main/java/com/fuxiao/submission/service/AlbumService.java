package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.Album;
import com.fuxiao.submission.model.Shot;
import com.fuxiao.submission.model.SpecItem;
import com.fuxiao.submission.repository.AlbumRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final LogService logService;

    public AlbumService(AlbumRepository albumRepository, LogService logService) {
        this.albumRepository = albumRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<Album> list() {
        List<Album> albums = albumRepository.findAllByOrderBySortOrderAscIdAsc();
        decorate(albums);
        return albums;
    }

    @Transactional(readOnly = true)
    public Album get(Long id) {
        Album album = find(id);
        List<Album> albums = albumRepository.findAllByOrderBySortOrderAscIdAsc();
        decorate(albums);
        return albums.stream().filter(item -> item.getId().equals(id)).findFirst().orElse(album);
    }

    public Album create(Album payload) {
        Album album = new Album();
        apply(album, payload);
        album.setCreatedAt(LocalDateTime.now());
        album.setUpdatedAt(LocalDateTime.now());
        Album saved = albumRepository.save(album);
        logService.record("album", "新建影集", saved.getTitle(), "slug " + saved.getSlug());
        return get(saved.getId());
    }

    public Album update(Long id, Album payload) {
        Album album = find(id);
        apply(album, payload);
        album.setUpdatedAt(LocalDateTime.now());
        Album saved = albumRepository.save(album);
        logService.record("album", "修改影集", saved.getTitle(), "slug " + saved.getSlug());
        return get(saved.getId());
    }

    public void delete(Long id) {
        Album album = find(id);
        albumRepository.delete(album);
        logService.record("album", "删除影集", album.getTitle(), "slug " + album.getSlug());
    }

    private void decorate(List<Album> albums) {
        for (int i = 0; i < albums.size(); i += 1) {
            Album album = albums.get(i);
            album.setShots(safeShots(album.getRun1()).size() + safeShots(album.getRun2()).size());
            if (!albums.isEmpty()) {
                Album next = albums.get((i + 1) % albums.size());
                album.setNextAlbumId(next.getId());
                album.setNextAlbumTitle(next.getTitle());
            }
        }
    }

    private void apply(Album album, Album payload) {
        if (payload == null) {
            throw new BusinessException("没有收到影集内容");
        }
        String title = blank(payload.getTitle());
        if (title == null) {
            throw new BusinessException("请填写影集标题");
        }
        album.setTitle(title);
        String slug = normalizeSlug(payload.getSlug());
        if (slug == null) {
            slug = "album-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
        }
        album.setSlug(uniqueSlug(slug, album.getId()));
        album.setCover(MediaPaths.normalize(payload.getCover()));
        album.setCoverAlt(blank(payload.getCoverAlt()));
        album.setAlbumYear(payload.getAlbumYear());
        album.setLead(blank(payload.getLead()));
        album.setMeta(strings(payload.getMeta()));
        album.setSpecs(specs(payload.getSpecs()));
        album.setWhy(strings(payload.getWhy()));
        album.setQuote(strings(payload.getQuote()));
        album.setStory(strings(payload.getStory()));
        album.setStoryQuote(strings(payload.getStoryQuote()));
        album.setProcess(specs(payload.getProcess()));
        album.setRun1(shots(payload.getRun1()));
        album.setRun2(shots(payload.getRun2()));
        album.setSortOrder(payload.getSortOrder() == null
                ? (album.getSortOrder() == null ? 0 : album.getSortOrder())
                : payload.getSortOrder());
        album.setPublished(payload.getPublished() == null || payload.getPublished());
    }

    private List<String> strings(List<String> input) {
        List<String> list = new ArrayList<>();
        if (input == null) {
            return list;
        }
        for (String value : input) {
            if (value != null && !value.isBlank()) {
                list.add(value.trim());
            }
        }
        return list;
    }

    private List<SpecItem> specs(List<SpecItem> input) {
        List<SpecItem> list = new ArrayList<>();
        if (input == null) {
            return list;
        }
        for (SpecItem item : input) {
            if (item == null || (blank(item.k()) == null && blank(item.v()) == null)) {
                continue;
            }
            list.add(new SpecItem(blank(item.k()) == null ? "" : item.k().trim(),
                    blank(item.v()) == null ? "" : item.v().trim()));
        }
        return list;
    }

    private List<Shot> shots(List<Shot> input) {
        List<Shot> list = new ArrayList<>();
        if (input == null) {
            return list;
        }
        for (Shot shot : input) {
            if (shot == null) {
                continue;
            }
            String img = MediaPaths.normalize(shot.img());
            if (img == null) {
                continue;
            }
            list.add(new Shot(img, blank(shot.alt()), blank(shot.cap())));
        }
        return list;
    }

    private List<Shot> safeShots(List<Shot> shots) {
        return shots == null ? new ArrayList<>() : shots;
    }

    private String normalizeSlug(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String slug = raw.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? null : slug;
    }

    private String uniqueSlug(String base, Long currentId) {
        String candidate = base;
        int suffix = 2;
        while (currentId == null
                ? albumRepository.findBySlug(candidate).isPresent()
                : albumRepository.existsBySlugAndIdNot(candidate, currentId)) {
            candidate = base + "-" + suffix;
            suffix += 1;
            if (suffix > 99) {
                candidate = base + "-" + System.currentTimeMillis();
                break;
            }
        }
        return candidate;
    }

    private Album find(Long id) {
        return albumRepository.findById(id).orElseThrow(() -> BusinessException.notFound("影集"));
    }

    private String blank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
