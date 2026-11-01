package com.fuxiao.submission.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_asset")
@Getter
@Setter
@NoArgsConstructor
public class MediaAsset {

    public static final String SOURCE_BLOG = "BLOG";
    public static final String SOURCE_UPLOAD = "UPLOAD";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String path;

    @Column(nullable = false, length = 16)
    private String source = SOURCE_UPLOAD;

    @Column(length = 128)
    private String mime;

    @Column(name = "file_size")
    private Long size;

    private Integer width;

    private Integer height;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
