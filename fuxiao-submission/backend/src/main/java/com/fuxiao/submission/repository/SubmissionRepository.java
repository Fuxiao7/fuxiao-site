package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    long countByStatus(String status);

    @Query("""
            select s from Submission s
            where (:status is null or s.status = :status)
              and (:keyword is null
                   or lower(s.title) like lower(concat('%', :keyword, '%'))
                   or lower(s.authorName) like lower(concat('%', :keyword, '%')))
            order by s.submittedAt desc, s.id desc
            """)
    Page<Submission> search(@Param("status") String status,
                            @Param("keyword") String keyword,
                            Pageable pageable);
}
