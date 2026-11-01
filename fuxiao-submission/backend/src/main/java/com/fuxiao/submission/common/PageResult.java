package com.fuxiao.submission.common;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public record PageResult<T>(List<T> list, long total, int page, int size) {

    public static <T> PageResult<T> of(Page<T> page) {
        return new PageResult<>(page.getContent(), page.getTotalElements(),
                page.getNumber() + 1, page.getSize());
    }

    public static <S, T> PageResult<T> of(Page<S> page, Function<S, T> mapper) {
        return new PageResult<>(page.getContent().stream().map(mapper).toList(),
                page.getTotalElements(), page.getNumber() + 1, page.getSize());
    }
}
