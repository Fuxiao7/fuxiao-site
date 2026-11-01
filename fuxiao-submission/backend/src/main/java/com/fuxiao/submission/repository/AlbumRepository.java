package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    List<Album> findAllByOrderBySortOrderAscIdAsc();

    Optional<Album> findBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
