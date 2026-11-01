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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "photo")
@Getter
@Setter
@NoArgsConstructor
public class Photo {

    public static final String WALL = "wall";
    public static final String SCATTER = "scatter";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String exif;

    @Column(nullable = false, length = 255)
    private String image;

    @Column(length = 500)
    private String alt;

    @Column(nullable = false, length = 16)
    private String collection = WALL;

    private LocalDate shotOn;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean visible = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
