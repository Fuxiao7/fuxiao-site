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
@Table(name = "upcoming_project")
@Getter
@Setter
@NoArgsConstructor
public class UpcomingProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String note;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean visible = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
