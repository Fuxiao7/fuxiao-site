package com.fuxiao.submission.entity;

import com.fuxiao.submission.common.ContentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "submission")
@Getter
@Setter
@NoArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 128)
    private String authorName;

    @Column(length = 190)
    private String authorEmail;

    @Column(length = 190)
    private String authorSite;

    private Long categoryId;

    @Column(length = 255)
    private String cover;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false, length = 20)
    private String status = ContentStatus.SUBMISSION_PENDING;

    @Column(length = 1000)
    private String reviewNote;

    @Column(length = 64)
    private String reviewedBy;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private Long articleId;

    @Transient
    private String categoryName;
}
