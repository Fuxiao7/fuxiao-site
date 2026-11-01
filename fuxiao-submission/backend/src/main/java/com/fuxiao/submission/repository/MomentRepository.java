package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.Moment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MomentRepository extends JpaRepository<Moment, Long> {

    List<Moment> findAllByOrderByOccurredAtDesc();
}
