package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.dto.ContentDtos;
import com.fuxiao.submission.entity.SiteSetting;
import com.fuxiao.submission.repository.SiteSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SettingService {

    private final SiteSettingRepository settingRepository;
    private final LogService logService;

    public SettingService(SiteSettingRepository settingRepository, LogService logService) {
        this.settingRepository = settingRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<SiteSetting> list() {
        return settingRepository.findAllByOrderByGroupKeyAscSortOrderAscIdAsc();
    }

    @Transactional(readOnly = true)
    public Map<String, String> values() {
        Map<String, String> map = new LinkedHashMap<>();
        for (SiteSetting setting : list()) {
            map.put(setting.getSettingKey(), setting.getValue());
        }
        return map;
    }

    public int update(ContentDtos.SettingUpdateRequest request) {
        int changed = 0;
        for (ContentDtos.SettingItem item : request.items()) {
            SiteSetting setting = settingRepository.findBySettingKey(item.settingKey())
                    .orElseThrow(() -> new BusinessException("未知的配置项：" + item.settingKey()));
            if (item.value() != null) {
                setting.setValue(item.value());
                setting.setUpdatedAt(LocalDateTime.now());
                settingRepository.save(setting);
                changed += 1;
            }
        }
        logService.record("setting", "更新站点文案", changed + " 项", null);
        return changed;
    }
}
