package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.ArchiveEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArchiveEntryRepository extends JpaRepository<ArchiveEntry, Long> {

    List<ArchiveEntry> findAllByOrderByEntryDateDescIdDesc();

    Optional<ArchiveEntry> findByArticleId(Long articleId);

    List<ArchiveEntry> findAllByArticleIdIsNotNull();
}
