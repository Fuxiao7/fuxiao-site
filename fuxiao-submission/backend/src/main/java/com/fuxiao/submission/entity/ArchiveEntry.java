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
@Table(name = "archive_entry")
@Getter
@Setter
@NoArgsConstructor
public class ArchiveEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 64)
    private String categoryName;

    private Long articleId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
