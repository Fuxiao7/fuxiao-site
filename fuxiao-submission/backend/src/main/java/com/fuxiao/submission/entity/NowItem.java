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

@Entity
@Table(name = "now_item")
@Getter
@Setter
@NoArgsConstructor
public class NowItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String label;

    @Column(name = "item_value", nullable = false, length = 190)
    private String value;

    @Column(length = 190)
    private String note;

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
