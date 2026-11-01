package com.fuxiao.submission.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fuxiao.submission.common.Json;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
public class Project {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 32)
    private String status = "进行中";

    @Column(nullable = false)
    private Integer progress = 0;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(length = 64)
    private String period;

    @Column(name = "spec", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String specJson;

    @Column(name = "images", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String imagesJson;

    @Column(name = "tags", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String tagsJson;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean published = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @JsonIgnore
    public String getSpecJson() {
        return specJson;
    }

    @JsonIgnore
    public void setSpecJson(String specJson) {
        this.specJson = specJson;
    }

    @JsonProperty("spec")
    public List<String> getSpec() {
        return Json.readList(specJson, STRING_LIST);
    }

    @JsonProperty("spec")
    public void setSpec(List<String> spec) {
        this.specJson = Json.write(spec == null ? new ArrayList<>() : spec);
    }

    @JsonIgnore
    public String getImagesJson() {
        return imagesJson;
    }

    @JsonIgnore
    public void setImagesJson(String imagesJson) {
        this.imagesJson = imagesJson;
    }

    @JsonProperty("images")
    public List<String> getImages() {
        return Json.readList(imagesJson, STRING_LIST);
    }

    @JsonProperty("images")
    public void setImages(List<String> images) {
        this.imagesJson = Json.write(images == null ? new ArrayList<>() : images);
    }

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
}
