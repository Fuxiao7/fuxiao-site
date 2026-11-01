package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.Project;
import com.fuxiao.submission.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final LogService logService;

    public ProjectService(ProjectRepository projectRepository, LogService logService) {
        this.projectRepository = projectRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<Project> list() {
        return projectRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    public Project create(Project payload) {
        Project project = new Project();
        apply(project, payload);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);
        logService.record("project", "新建项目", saved.getTitle(), null);
        return saved;
    }

    public Project update(Long id, Project payload) {
        Project project = find(id);
        apply(project, payload);
        project.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);
        logService.record("project", "修改项目", saved.getTitle(), null);
        return saved;
    }

    public void delete(Long id) {
        Project project = find(id);
        projectRepository.delete(project);
        logService.record("project", "删除项目", project.getTitle(), null);
    }

    private void apply(Project project, Project payload) {
        if (payload == null) {
            throw new BusinessException("没有收到项目内容");
        }
        String title = blank(payload.getTitle());
        if (title == null) {
            throw new BusinessException("请填写项目名称");
        }
        project.setTitle(title);
        project.setStatus(blank(payload.getStatus()) == null ? "进行中" : payload.getStatus().trim());
        int progress = payload.getProgress() == null ? 0 : payload.getProgress();
        project.setProgress(Math.max(0, Math.min(100, progress)));
        project.setSummary(blank(payload.getSummary()));
        project.setPeriod(blank(payload.getPeriod()));
        project.setSpec(strings(payload.getSpec()));
        project.setTags(strings(payload.getTags()));
        List<String> images = new ArrayList<>();
        for (String image : strings(payload.getImages())) {
            String path = MediaPaths.normalize(image);
            if (path != null) {
                images.add(path);
            }
        }
        project.setImages(images);
        project.setSortOrder(payload.getSortOrder() == null
                ? (project.getSortOrder() == null ? 0 : project.getSortOrder())
                : payload.getSortOrder());
        project.setPublished(payload.getPublished() == null || payload.getPublished());
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

    private Project find(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> BusinessException.notFound("项目"));
    }

    private String blank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
