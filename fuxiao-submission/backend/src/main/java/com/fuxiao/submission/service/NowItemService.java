package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.entity.NowItem;
import com.fuxiao.submission.repository.NowItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class NowItemService {

    private final NowItemRepository nowItemRepository;
    private final LogService logService;

    public NowItemService(NowItemRepository nowItemRepository, LogService logService) {
        this.nowItemRepository = nowItemRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<NowItem> list() {
        return nowItemRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    public List<NowItem> replace(List<NowItem> items) {
        if (items == null) {
            throw new BusinessException("没有收到内容");
        }
        nowItemRepository.deleteAll();
        List<NowItem> saved = new ArrayList<>();
        int index = 0;
        for (NowItem item : items) {
            if (item == null || item.getLabel() == null || item.getLabel().isBlank()) {
                continue;
            }
            NowItem entity = new NowItem();
            entity.setLabel(item.getLabel().trim());
            entity.setValue(item.getValue() == null ? "" : item.getValue().trim());
            entity.setNote(item.getNote());
            entity.setSortOrder(index++);
            saved.add(nowItemRepository.save(entity));
        }
        logService.record("setting", "更新首页此刻", saved.size() + " 格", null);
        return saved;
    }
}
