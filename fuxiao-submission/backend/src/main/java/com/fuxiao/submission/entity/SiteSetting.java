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
@Table(name = "site_setting")
@Getter
@Setter
@NoArgsConstructor
public class SiteSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, length = 80)
    private String settingKey;

    @Column(nullable = false, length = 32)
    private String groupKey = "site";

    @Column(nullable = false, length = 128)
    private String label;

    @Column(name = "setting_value", columnDefinition = "LONGTEXT")
    private String value;

    @Column(nullable = false, length = 16)
    private String inputType = "text";

    @Column(nullable = false)
    private Integer sortOrder = 0;

    private LocalDateTime updatedAt;
}
