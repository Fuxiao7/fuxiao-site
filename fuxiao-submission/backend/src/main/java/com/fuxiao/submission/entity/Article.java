package com.fuxiao.submission.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fuxiao.submission.common.ContentStatus;
import com.fuxiao.submission.common.Json;
import com.fuxiao.submission.model.ArticleBlock;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "article")
@Getter
@Setter
@NoArgsConstructor
public class Article {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };
    private static final TypeReference<List<ArticleBlock>> BLOCK_LIST = new TypeReference<>() {
    };

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String slug;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String cover;

    @Column(length = 500)
    private String coverAlt;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "TEXT")
    private String deck;

    private Long categoryId;

    @Column(nullable = false, length = 32)
    private String statusKey = "write";

    private LocalDate publishedAt;

    @Column(length = 64)
    private String author = "拂晓";

    @Column(length = 64)
    private String location = "杭州";

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false, length = 20)
    private String status = ContentStatus.DRAFT;

    @Column(nullable = false)
    private Integer views = 0;

    @Column(nullable = false)
    private Integer wordCount = 0;

    @Column(nullable = false)
    private Integer readingMinutes = 0;

    @Column(name = "tags", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String tagsJson;

    @Column(name = "blocks", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String blocksJson;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Transient
    private String categoryName;

    @JsonIgnore
    public String getTagsJson() {
        return tagsJson;
    }

    @JsonIgnore
    public void setTagsJson(String tagsJson) {
        this.tagsJson = tagsJson;
    }

    @JsonProperty("tags")
    public List<String> getTags() {
        return Json.readList(tagsJson, STRING_LIST);
    }

    @JsonProperty("tags")
    public void setTags(List<String> tags) {
        this.tagsJson = Json.write(tags == null ? new ArrayList<>() : tags);
    }

    @JsonIgnore
    public String getBlocksJson() {
        return blocksJson;
    }

    @JsonIgnore
    public void setBlocksJson(String blocksJson) {
        this.blocksJson = blocksJson;
    }

    @JsonProperty("blocks")
    public List<ArticleBlock> getBlocks() {
        return Json.readList(blocksJson, BLOCK_LIST);
    }

    @JsonProperty("blocks")
    public void setBlocks(List<ArticleBlock> blocks) {
        this.blocksJson = Json.write(blocks == null ? new ArrayList<>() : blocks);
    }
}
