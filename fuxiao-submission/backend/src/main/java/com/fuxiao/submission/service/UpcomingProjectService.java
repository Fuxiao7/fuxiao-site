package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.entity.UpcomingProject;
import com.fuxiao.submission.repository.UpcomingProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class UpcomingProjectService {

    private final UpcomingProjectRepository repository;
    private final LogService logService;

    public UpcomingProjectService(UpcomingProjectRepository repository, LogService logService) {
        this.repository = repository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<UpcomingProject> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc();
    }

    public UpcomingProject create(UpcomingProject payload) {
        UpcomingProject item = new UpcomingProject();
        apply(item, payload);
        item.setCreatedAt(LocalDateTime.now());
        UpcomingProject saved = repository.save(item);
        logService.record("project", "新建待办项目", saved.getTitle(), null);
        return saved;
    }

    public UpcomingProject update(Long id, UpcomingProject payload) {
        UpcomingProject item = find(id);
        apply(item, payload);
        UpcomingProject saved = repository.save(item);
        logService.record("project", "修改待办项目", saved.getTitle(), null);
        return saved;
    }

    public void delete(Long id) {
        UpcomingProject item = find(id);
        repository.delete(item);
        logService.record("project", "删除待办项目", item.getTitle(), null);
    }

    private void apply(UpcomingProject item, UpcomingProject payload) {
        if (payload == null || payload.getTitle() == null || payload.getTitle().isBlank()) {
            throw new BusinessException("请填写项目名称");
        }
        item.setTitle(payload.getTitle().trim());
        item.setNote(payload.getNote());
        if (payload.getSortOrder() != null) {
            item.setSortOrder(payload.getSortOrder());
        }
        item.setVisible(payload.getVisible() == null || payload.getVisible());
    }

    private UpcomingProject find(Long id) {
        return repository.findById(id).orElseThrow(() -> BusinessException.notFound("待办项目"));
    }
}
