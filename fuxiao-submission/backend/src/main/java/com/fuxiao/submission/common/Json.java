package com.fuxiao.submission.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

/** 内容聚合字段（正文分块、图组、规格表等）的 JSON 文本互转。 */
public final class Json {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Json() {
    }

    public static String write(Object value) {
        if (value == null) {
            return "[]";
        }
        try {
            return MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("无法序列化内容字段", e);
        }
    }

    public static <T> List<T> readList(String raw, TypeReference<List<T>> type) {
        if (raw == null || raw.isBlank()) {
            return new ArrayList<>();
        }
        try {
            List<T> value = MAPPER.readValue(raw, type);
            return value == null ? new ArrayList<>() : new ArrayList<>(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("内容字段不是合法的 JSON", e);
        }
    }
}
