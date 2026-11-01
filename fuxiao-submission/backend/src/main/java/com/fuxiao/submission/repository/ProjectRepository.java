package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByOrderBySortOrderAscIdAsc();
}
