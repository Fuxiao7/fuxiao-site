package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.NowItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NowItemRepository extends JpaRepository<NowItem, Long> {

    List<NowItem> findAllByOrderBySortOrderAscIdAsc();
}
