package com.fuxiao.submission.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fuxiao.submission.common.Json;
import com.fuxiao.submission.model.AboutColumn;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "about_profile")
@Getter
@Setter
@NoArgsConstructor
public class AboutProfile {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };
    private static final TypeReference<List<AboutColumn>> COLUMN_LIST = new TypeReference<>() {
    };

    @Id
    private Long id = 1L;

    @Column(length = 128)
    private String displayName;

    @Column(length = 190)
    private String subtitle;

    @Column(length = 255)
    private String meta;

    @Column(length = 255)
    private String portrait;

    @Column(length = 500)
    private String portraitAlt;

    @Column(length = 500)
    private String portraitCaption;

    @Column(name = "bio", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String bioJson;

    @Column(name = "cols", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String colsJson;

    @Column(name = "credits", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String creditsJson;

    @Column(length = 190)
    private String email;

    @Column(length = 190)
    private String github;

    @Column(length = 190)
    private String twitter;

    private LocalDateTime updatedAt;

    @JsonIgnore
    public String getBioJson() {
        return bioJson;
    }

    @JsonIgnore
    public void setBioJson(String bioJson) {
        this.bioJson = bioJson;
    }

    @JsonProperty("bio")
    public List<String> getBio() {
        return Json.readList(bioJson, STRING_LIST);
    }

    @JsonProperty("bio")
    public void setBio(List<String> bio) {
        this.bioJson = Json.write(bio == null ? new ArrayList<>() : bio);
    }

    @JsonIgnore
    public String getColsJson() {
        return colsJson;
    }

    @JsonIgnore
    public void setColsJson(String colsJson) {
        this.colsJson = colsJson;
    }

    @JsonProperty("cols")
    public List<AboutColumn> getCols() {
        return Json.readList(colsJson, COLUMN_LIST);
    }

    @JsonProperty("cols")
    public void setCols(List<AboutColumn> cols) {
        this.colsJson = Json.write(cols == null ? new ArrayList<>() : cols);
    }

    @JsonIgnore
    public String getCreditsJson() {
        return creditsJson;
    }

    @JsonIgnore
    public void setCreditsJson(String creditsJson) {
        this.creditsJson = creditsJson;
    }

    @JsonProperty("credits")
    public List<String> getCredits() {
        return Json.readList(creditsJson, STRING_LIST);
    }

    @JsonProperty("credits")
    public void setCredits(List<String> credits) {
        this.creditsJson = Json.write(credits == null ? new ArrayList<>() : credits);
    }
}
