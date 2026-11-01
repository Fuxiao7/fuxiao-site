package com.fuxiao.submission.model;

import java.util.ArrayList;
import java.util.List;

/** 关于页的三栏：手上的东西 / 时间线 / 联系。 */
public record AboutColumn(String title, List<String> items) {

    public AboutColumn {
        items = items == null ? new ArrayList<>() : new ArrayList<>(items);
    }
}
