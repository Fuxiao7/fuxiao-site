package com.fuxiao.submission.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fuxiao.submission.common.Json;
import com.fuxiao.submission.model.Shot;
import com.fuxiao.submission.model.SpecItem;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "album")
@Getter
@Setter
@NoArgsConstructor
public class Album {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };
    private static final TypeReference<List<SpecItem>> SPEC_LIST = new TypeReference<>() {
    };
    private static final TypeReference<List<Shot>> SHOT_LIST = new TypeReference<>() {
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

    private Integer albumYear;

    @Column(name = "album_lead", columnDefinition = "TEXT")
    private String lead;

    @Column(name = "meta", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String metaJson;

    @Column(name = "specs", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String specsJson;

    @Column(name = "why", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String whyJson;

    @Column(name = "quote", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String quoteJson;

    @Column(name = "story", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String storyJson;

    @Column(name = "story_quote", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String storyQuoteJson;

    @Column(name = "process", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String processJson;

    @Column(name = "run1", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String run1Json;

    @Column(name = "run2", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String run2Json;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean published = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Transient
    private int shots;

    @Transient
    private Long nextAlbumId;

    @Transient
    private String nextAlbumTitle;

    @JsonIgnore
    public String getMetaJson() {
        return metaJson;
    }

    @JsonIgnore
    public void setMetaJson(String metaJson) {
        this.metaJson = metaJson;
    }

    @JsonProperty("meta")
    public List<String> getMeta() {
        return Json.readList(metaJson, STRING_LIST);
    }

    @JsonProperty("meta")
    public void setMeta(List<String> meta) {
        this.metaJson = Json.write(meta == null ? new ArrayList<>() : meta);
    }

    @JsonIgnore
    public String getSpecsJson() {
        return specsJson;
    }

    @JsonIgnore
    public void setSpecsJson(String specsJson) {
        this.specsJson = specsJson;
    }

    @JsonProperty("specs")
    public List<SpecItem> getSpecs() {
        return Json.readList(specsJson, SPEC_LIST);
    }

    @JsonProperty("specs")
    public void setSpecs(List<SpecItem> specs) {
        this.specsJson = Json.write(specs == null ? new ArrayList<>() : specs);
    }

    @JsonIgnore
    public String getWhyJson() {
        return whyJson;
    }

    @JsonIgnore
    public void setWhyJson(String whyJson) {
        this.whyJson = whyJson;
    }

    @JsonProperty("why")
    public List<String> getWhy() {
        return Json.readList(whyJson, STRING_LIST);
    }

    @JsonProperty("why")
    public void setWhy(List<String> why) {
        this.whyJson = Json.write(why == null ? new ArrayList<>() : why);
    }

    @JsonIgnore
    public String getQuoteJson() {
        return quoteJson;
    }

    @JsonIgnore
    public void setQuoteJson(String quoteJson) {
        this.quoteJson = quoteJson;
    }

    @JsonProperty("quote")
    public List<String> getQuote() {
        return Json.readList(quoteJson, STRING_LIST);
    }

    @JsonProperty("quote")
    public void setQuote(List<String> quote) {
        this.quoteJson = Json.write(quote == null ? new ArrayList<>() : quote);
    }

    @JsonIgnore
    public String getStoryJson() {
        return storyJson;
    }

    @JsonIgnore
    public void setStoryJson(String storyJson) {
        this.storyJson = storyJson;
    }

    @JsonProperty("story")
    public List<String> getStory() {
        return Json.readList(storyJson, STRING_LIST);
    }

    @JsonProperty("story")
    public void setStory(List<String> story) {
        this.storyJson = Json.write(story == null ? new ArrayList<>() : story);
    }

    @JsonIgnore
    public String getStoryQuoteJson() {
        return storyQuoteJson;
    }

    @JsonIgnore
    public void setStoryQuoteJson(String storyQuoteJson) {
        this.storyQuoteJson = storyQuoteJson;
    }

    @JsonProperty("storyQuote")
    public List<String> getStoryQuote() {
        return Json.readList(storyQuoteJson, STRING_LIST);
    }

    @JsonProperty("storyQuote")
    public void setStoryQuote(List<String> storyQuote) {
        this.storyQuoteJson = Json.write(storyQuote == null ? new ArrayList<>() : storyQuote);
    }

    @JsonIgnore
    public String getProcessJson() {
        return processJson;
    }

    @JsonIgnore
    public void setProcessJson(String processJson) {
        this.processJson = processJson;
    }

    @JsonProperty("process")
    public List<SpecItem> getProcess() {
        return Json.readList(processJson, SPEC_LIST);
    }

    @JsonProperty("process")
    public void setProcess(List<SpecItem> process) {
        this.processJson = Json.write(process == null ? new ArrayList<>() : process);
    }

    @JsonIgnore
    public String getRun1Json() {
        return run1Json;
    }

    @JsonIgnore
    public void setRun1Json(String run1Json) {
        this.run1Json = run1Json;
    }

    @JsonProperty("run1")
    public List<Shot> getRun1() {
        return Json.readList(run1Json, SHOT_LIST);
    }

    @JsonProperty("run1")
    public void setRun1(List<Shot> run1) {
        this.run1Json = Json.write(run1 == null ? new ArrayList<>() : run1);
    }

    @JsonIgnore
    public String getRun2Json() {
        return run2Json;
    }

    @JsonIgnore
    public void setRun2Json(String run2Json) {
        this.run2Json = run2Json;
    }

    @JsonProperty("run2")
    public List<Shot> getRun2() {
        return Json.readList(run2Json, SHOT_LIST);
    }

    @JsonProperty("run2")
    public void setRun2(List<Shot> run2) {
        this.run2Json = Json.write(run2 == null ? new ArrayList<>() : run2);
    }
}
