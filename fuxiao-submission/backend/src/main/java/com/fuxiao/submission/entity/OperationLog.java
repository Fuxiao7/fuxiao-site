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
@Table(name = "operation_log")
@Getter
@Setter
@NoArgsConstructor
public class OperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 64)
    private String username;

    @Column(length = 32)
    private String module;

    @Column(length = 64)
    private String action;

    @Column(length = 255)
    private String target;

    @Column(length = 1000)
    private String detail;

    @Column(length = 64)
    private String ip;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
