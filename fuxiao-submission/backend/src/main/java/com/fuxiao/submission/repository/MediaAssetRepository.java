package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {

    List<MediaAsset> findAllByOrderByCreatedAtDescIdDesc();

    List<MediaAsset> findByNameContainingIgnoreCaseOrderByCreatedAtDescIdDesc(String name);

    List<MediaAsset> findBySourceOrderByCreatedAtDescIdDesc(String source);

    Optional<MediaAsset> findByPath(String path);
}
