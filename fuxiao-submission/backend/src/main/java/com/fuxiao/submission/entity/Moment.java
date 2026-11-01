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
@Table(name = "moment")
@Getter
@Setter
@NoArgsConstructor
public class Moment {

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @Column(nullable = false, length = 32)
    private String tagKey = "life";

    @Column(nullable = false, length = 32)
    private String tagLabel = "生活";

    @Column(name = "body", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String bodyJson;

    @Column(name = "images", columnDefinition = "LONGTEXT")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String imagesJson;

    @Column(nullable = false)
    private Boolean published = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @JsonIgnore
    public String getBodyJson() {
        return bodyJson;
    }

    @JsonIgnore
    public void setBodyJson(String bodyJson) {
        this.bodyJson = bodyJson;
    }

    @JsonProperty("body")
    public List<String> getBody() {
        return Json.readList(bodyJson, STRING_LIST);
    }

    @JsonProperty("body")
    public void setBody(List<String> body) {
        this.bodyJson = Json.write(body == null ? new ArrayList<>() : body);
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
}
