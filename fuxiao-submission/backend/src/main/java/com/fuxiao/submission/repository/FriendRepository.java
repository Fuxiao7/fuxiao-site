package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findAllByOrderBySortOrderAscIdAsc();
}
