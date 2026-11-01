package com.fuxiao.submission.service;

import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.AboutProfile;
import com.fuxiao.submission.repository.AboutProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AboutService {

    private static final Long PROFILE_ID = 1L;

    private final AboutProfileRepository aboutRepository;
    private final LogService logService;

    public AboutService(AboutProfileRepository aboutRepository, LogService logService) {
        this.aboutRepository = aboutRepository;
        this.logService = logService;
    }

    public AboutProfile get() {
        return aboutRepository.findById(PROFILE_ID).orElseGet(this::createDefault);
    }

    public AboutProfile update(AboutProfile payload) {
        AboutProfile profile = aboutRepository.findById(PROFILE_ID).orElseGet(AboutProfile::new);
        profile.setId(PROFILE_ID);
        profile.setDisplayName(payload.getDisplayName());
        profile.setSubtitle(payload.getSubtitle());
        profile.setMeta(payload.getMeta());
        profile.setPortrait(MediaPaths.normalize(payload.getPortrait()));
        profile.setPortraitAlt(payload.getPortraitAlt());
        profile.setPortraitCaption(payload.getPortraitCaption());
        profile.setBio(payload.getBio() == null ? new ArrayList<>() : payload.getBio());
        profile.setCols(payload.getCols() == null ? new ArrayList<>() : payload.getCols());
        profile.setCredits(payload.getCredits() == null ? new ArrayList<>() : payload.getCredits());
        profile.setEmail(payload.getEmail());
        profile.setGithub(payload.getGithub());
        profile.setTwitter(payload.getTwitter());
        profile.setUpdatedAt(LocalDateTime.now());
        AboutProfile saved = aboutRepository.save(profile);
        logService.record("about", "更新关于页", "关于", "简介 " + saved.getBio().size() + " 段");
        return saved;
    }

    private AboutProfile createDefault() {
        AboutProfile profile = new AboutProfile();
        profile.setId(PROFILE_ID);
        profile.setDisplayName("拂晓");
        profile.setSubtitle("前端工程师 · 杭州");
        profile.setMeta("杭州 · 一个人 · 一周一篇");
        profile.setPortrait("/media/portrait-alt.jpg");
        profile.setPortraitAlt("雾天窗前的人影，站在钢架与天光之间");
        profile.setPortraitCaption("这张是朋友拍的，雾天，我家窗前。");
        profile.setBio(new ArrayList<>(List.of(
                "我叫拂晓。白天在写字楼里写前端，晚上回到这间屋子，写点不交付给任何人的东西。")));
        profile.setCols(new ArrayList<>());
        profile.setCredits(new ArrayList<>());
        profile.setEmail("470379769@qq.com");
        profile.setGithub("github.com/dengxia");
        profile.setTwitter("@dengxia_moe");
        profile.setUpdatedAt(LocalDateTime.now());
        return aboutRepository.save(profile);
    }
}
