package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.UpcomingProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UpcomingProjectRepository extends JpaRepository<UpcomingProject, Long> {

    List<UpcomingProject> findAllByOrderBySortOrderAscIdAsc();
}
