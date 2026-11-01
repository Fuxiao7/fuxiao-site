package com.fuxiao.submission.repository;

import com.fuxiao.submission.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {

    List<SiteSetting> findAllByOrderByGroupKeyAscSortOrderAscIdAsc();

    Optional<SiteSetting> findBySettingKey(String settingKey);
}
