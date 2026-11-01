package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.Moment;
import com.fuxiao.submission.repository.MomentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class MomentService {

    private static final Map<String, String> TAG_LABELS = Map.of(
            "write", "写字",
            "tech", "技术",
            "life", "生活",
            "read", "读书",
            "photo", "摄影");

    private final MomentRepository momentRepository;
    private final LogService logService;

    public MomentService(MomentRepository momentRepository, LogService logService) {
        this.momentRepository = momentRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<Moment> list(String keyword, String tagKey, Integer year) {
        String key = blank(keyword) == null ? null : keyword.trim().toLowerCase();
        return momentRepository.findAllByOrderByOccurredAtDesc().stream()
                .filter(moment -> tagKey == null || tagKey.isBlank() || tagKey.equals(moment.getTagKey()))
                .filter(moment -> year == null || moment.getOccurredAt().getYear() == year)
                .filter(moment -> {
                    if (key == null) {
                        return true;
                    }
                    String text = String.join(" ", safe(moment.getBody())).toLowerCase();
                    return text.contains(key) || moment.getTagLabel().toLowerCase().contains(key);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Moment get(Long id) {
        return find(id);
    }

    public Moment create(Moment payload) {
        Moment moment = new Moment();
        apply(moment, payload);
        moment.setCreatedAt(LocalDateTime.now());
        moment.setUpdatedAt(LocalDateTime.now());
        Moment saved = momentRepository.save(moment);
        logService.record("moment", "新建说说", preview(saved.getBody()), null);
        return saved;
    }

    public Moment update(Long id, Moment payload) {
        Moment moment = find(id);
        apply(moment, payload);
        moment.setUpdatedAt(LocalDateTime.now());
        Moment saved = momentRepository.save(moment);
        logService.record("moment", "修改说说", preview(saved.getBody()), null);
        return saved;
    }

    public void delete(Long id) {
        Moment moment = find(id);
        momentRepository.delete(moment);
        logService.record("moment", "删除说说", preview(moment.getBody()), null);
    }

    private void apply(Moment moment, Moment payload) {
        if (payload == null) {
            throw new BusinessException("没有收到说说内容");
        }
        if (payload.getOccurredAt() == null) {
            throw new BusinessException("请选择发布时间");
        }
        moment.setOccurredAt(payload.getOccurredAt());
        String tagKey = blank(payload.getTagKey()) == null ? "life" : payload.getTagKey().trim();
        moment.setTagKey(tagKey);
        String label = blank(payload.getTagLabel());
        moment.setTagLabel(label == null ? TAG_LABELS.getOrDefault(tagKey, "生活") : label);
        List<String> body = new ArrayList<>();
        for (String paragraph : safe(payload.getBody())) {
            if (paragraph != null && !paragraph.isBlank()) {
                body.add(paragraph.trim());
            }
        }
        if (body.isEmpty()) {
            throw new BusinessException("说说正文不能为空");
        }
        moment.setBody(body);
        List<String> images = new ArrayList<>();
        for (String image : safe(payload.getImages())) {
            String path = MediaPaths.normalize(image);
            if (path != null) {
                images.add(path);
            }
        }
        moment.setImages(images);
        moment.setPublished(payload.getPublished() == null || payload.getPublished());
    }

    private String preview(List<String> body) {
        String text = String.join(" ", safe(body));
        return text.length() <= 40 ? text : text.substring(0, 40) + "…";
    }

    private Moment find(Long id) {
        return momentRepository.findById(id).orElseThrow(() -> BusinessException.notFound("说说"));
    }

    private List<String> safe(List<String> list) {
        return list == null ? new ArrayList<>() : list;
    }

    private String blank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
