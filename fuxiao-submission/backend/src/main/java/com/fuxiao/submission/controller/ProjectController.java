package com.fuxiao.submission.controller;

import com.fuxiao.submission.common.ApiResponse;
import com.fuxiao.submission.entity.Project;
import com.fuxiao.submission.entity.UpcomingProject;
import com.fuxiao.submission.service.ProjectService;
import com.fuxiao.submission.service.UpcomingProjectService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;
    private final UpcomingProjectService upcomingService;

    public ProjectController(ProjectService projectService, UpcomingProjectService upcomingService) {
        this.projectService = projectService;
        this.upcomingService = upcomingService;
    }

    @GetMapping("/projects")
    public ApiResponse<List<Project>> list() {
        return ApiResponse.ok(projectService.list());
    }

    @PostMapping("/projects")
    public ApiResponse<Project> create(@RequestBody Project payload) {
        return ApiResponse.ok(projectService.create(payload));
    }

    @PutMapping("/projects/{id}")
    public ApiResponse<Project> update(@PathVariable Long id, @RequestBody Project payload) {
        return ApiResponse.ok(projectService.update(id, payload));
    }

    @DeleteMapping("/projects/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ApiResponse.ok();
    }

    @GetMapping("/upcoming")
    public ApiResponse<List<UpcomingProject>> listUpcoming() {
        return ApiResponse.ok(upcomingService.list());
    }

    @PostMapping("/upcoming")
    public ApiResponse<UpcomingProject> createUpcoming(@RequestBody UpcomingProject payload) {
        return ApiResponse.ok(upcomingService.create(payload));
    }

    @PutMapping("/upcoming/{id}")
    public ApiResponse<UpcomingProject> updateUpcoming(@PathVariable Long id,
                                                       @RequestBody UpcomingProject payload) {
        return ApiResponse.ok(upcomingService.update(id, payload));
    }

    @DeleteMapping("/upcoming/{id}")
    public ApiResponse<Void> deleteUpcoming(@PathVariable Long id) {
        upcomingService.delete(id);
        return ApiResponse.ok();
    }
}
