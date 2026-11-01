package com.fuxiao.submission.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "admin_user")
@Getter
@Setter
@NoArgsConstructor
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String username;

    @JsonIgnore
    @Getter(onMethod_ = {@JsonIgnore})
    @Column(nullable = false, length = 120)
    private String password;

    @Column(length = 64)
    private String nickname;

    @Column(nullable = false, length = 32)
    private String role = "ADMIN";

    @Column(length = 128)
    private String email;

    @Column(length = 255)
    private String avatar;

    @Column(nullable = false)
    private Boolean enabled = true;

    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
