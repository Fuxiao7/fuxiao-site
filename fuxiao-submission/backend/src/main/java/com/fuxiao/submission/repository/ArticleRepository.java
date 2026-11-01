package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByCategoryId(Long categoryId);

    long countByCategoryId(Long categoryId);

    long countByStatus(String status);

    long countByFeaturedTrue();

    List<Article> findAllByStatusOrderByPublishedAtDesc(String status);

    List<Article> findAllByOrderByPublishedAtDescIdDesc();

    @Query("""
            select a from Article a
            where (:keyword is null
                   or lower(a.title) like lower(concat('%', :keyword, '%'))
                   or lower(a.slug) like lower(concat('%', :keyword, '%')))
              and (:categoryId is null or a.categoryId = :categoryId)
              and (:status is null or a.status = :status)
              and (:featured is null or a.featured = :featured)
            order by a.publishedAt desc, a.id desc
            """)
    Page<Article> search(@Param("keyword") String keyword,
                         @Param("categoryId") Long categoryId,
                         @Param("status") String status,
                         @Param("featured") Boolean featured,
                         Pageable pageable);

    @Query("select a.categoryId, count(a) from Article a group by a.categoryId")
    List<Object[]> countGroupByCategory();

    @Query("select a.publishedAt from Article a where a.status = 'published' and a.publishedAt is not null")
    List<LocalDate> findPublishedDates();

    @Query("select count(a) from Article a where a.status = 'published' and (a.cover is null or a.cover = '')")
    long countPublishedWithoutCover();

    @Query("select count(a) from Article a where a.status = 'published' and a.wordCount = 0")
    long countPublishedWithoutContent();

    @Query("select a.id from Article a where a.status = 'published'")
    List<Long> findPublishedIds();
}
