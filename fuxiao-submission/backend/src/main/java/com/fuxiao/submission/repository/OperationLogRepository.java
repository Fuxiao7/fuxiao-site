package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.OperationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {

    @Query("""
            select l from OperationLog l
            where (:module is null or l.module = :module)
              and (:username is null or l.username = :username)
              and (:keyword is null
                   or lower(l.action) like lower(concat('%', :keyword, '%'))
                   or lower(l.target) like lower(concat('%', :keyword, '%')))
            order by l.createdAt desc, l.id desc
            """)
    Page<OperationLog> search(@Param("module") String module,
                              @Param("username") String username,
                              @Param("keyword") String keyword,
                              Pageable pageable);
}
