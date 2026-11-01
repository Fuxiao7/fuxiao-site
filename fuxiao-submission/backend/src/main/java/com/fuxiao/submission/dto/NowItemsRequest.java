package com.fuxiao.submission.dto;

import com.fuxiao.submission.entity.NowItem;

import java.util.List;

/** 站点设置的批量替换载荷（首页「此刻」四格）。 */
public record NowItemsRequest(List<NowItem> items) {
}
