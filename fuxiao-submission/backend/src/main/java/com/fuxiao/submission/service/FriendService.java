package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.Friend;
import com.fuxiao.submission.repository.FriendRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FriendService {

    private final FriendRepository friendRepository;
    private final LogService logService;

    public FriendService(FriendRepository friendRepository, LogService logService) {
        this.friendRepository = friendRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<Friend> list() {
        return friendRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    public Friend create(Friend payload) {
        Friend friend = new Friend();
        apply(friend, payload);
        friend.setCreatedAt(LocalDateTime.now());
        Friend saved = friendRepository.save(friend);
        logService.record("friend", "新增友链", saved.getName(), saved.getSite());
        return saved;
    }

    public Friend update(Long id, Friend payload) {
        Friend friend = find(id);
        apply(friend, payload);
        Friend saved = friendRepository.save(friend);
        logService.record("friend", "修改友链", saved.getName(), saved.getSite());
        return saved;
    }

    public void delete(Long id) {
        Friend friend = find(id);
        friendRepository.delete(friend);
        logService.record("friend", "删除友链", friend.getName(), friend.getSite());
    }

    private void apply(Friend friend, Friend payload) {
        if (payload == null || payload.getName() == null || payload.getName().isBlank()) {
            throw new BusinessException("请填写站名");
        }
        friend.setName(payload.getName().trim());
        friend.setSite(payload.getSite());
        friend.setUrl(payload.getUrl());
        friend.setDescription(payload.getDescription());
        friend.setAvatar(MediaPaths.normalize(payload.getAvatar()));
        if (payload.getSortOrder() != null) {
            friend.setSortOrder(payload.getSortOrder());
        }
        friend.setVisible(payload.getVisible() == null || payload.getVisible());
    }

    private Friend find(Long id) {
        return friendRepository.findById(id).orElseThrow(() -> BusinessException.notFound("友链"));
    }
}
