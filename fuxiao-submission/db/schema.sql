-- ============================================================================
--  拂晓的投稿系统 · MySQL 8.0 schema
--  内容型数据（正文分块、图组、规格表等）以 JSON 文本存入 LONGTEXT 字段，
--  由后端 JPA AttributeConverter 负责序列化，读写按「整篇聚合」处理。
-- ============================================================================

CREATE DATABASE IF NOT EXISTS fuxiao_admin
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fuxiao_admin;

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 后台账号
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_user (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  username      VARCHAR(64)  NOT NULL,
  password      VARCHAR(120) NOT NULL,
  nickname      VARCHAR(64)  DEFAULT NULL,
  role          VARCHAR(32)  NOT NULL DEFAULT 'ADMIN',
  email         VARCHAR(128) DEFAULT NULL,
  avatar        VARCHAR(255) DEFAULT NULL,
  enabled       TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at DATETIME     DEFAULT NULL,
  created_at    DATETIME     NOT NULL,
  updated_at    DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_admin_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 分类
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(64)  NOT NULL,
  slug       VARCHAR(64)  NOT NULL,
  status_key VARCHAR(32)  NOT NULL DEFAULT 'write',
  sort_order INT          NOT NULL DEFAULT 0,
  visible    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 文章
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  slug            VARCHAR(120) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  cover           VARCHAR(255) DEFAULT NULL,
  cover_alt       VARCHAR(500) DEFAULT NULL,
  excerpt         TEXT         DEFAULT NULL,
  deck            TEXT         DEFAULT NULL,
  category_id     BIGINT       DEFAULT NULL,
  status_key      VARCHAR(32)  NOT NULL DEFAULT 'write',
  published_at    DATE         DEFAULT NULL,
  author          VARCHAR(64)  DEFAULT '拂晓',
  location        VARCHAR(64)  DEFAULT '杭州',
  featured        TINYINT(1)   NOT NULL DEFAULT 0,
  status          VARCHAR(20)  NOT NULL DEFAULT 'draft',
  views           INT          NOT NULL DEFAULT 0,
  word_count      INT          NOT NULL DEFAULT 0,
  reading_minutes INT          NOT NULL DEFAULT 0,
  tags            LONGTEXT     DEFAULT NULL,
  blocks          LONGTEXT     DEFAULT NULL,
  created_at      DATETIME     NOT NULL,
  updated_at      DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_article_slug (slug),
  KEY idx_article_status_date (status, published_at),
  KEY idx_article_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 影集
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS album (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(120) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  cover         VARCHAR(255) DEFAULT NULL,
  cover_alt     VARCHAR(500) DEFAULT NULL,
  album_year    INT          DEFAULT NULL,
  album_lead    TEXT         DEFAULT NULL,
  meta          LONGTEXT     DEFAULT NULL,
  specs         LONGTEXT     DEFAULT NULL,
  why           LONGTEXT     DEFAULT NULL,
  quote         LONGTEXT     DEFAULT NULL,
  story         LONGTEXT     DEFAULT NULL,
  story_quote   LONGTEXT     DEFAULT NULL,
  process       LONGTEXT     DEFAULT NULL,
  run1          LONGTEXT     DEFAULT NULL,
  run2          LONGTEXT     DEFAULT NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  published     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL,
  updated_at    DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_album_slug (slug),
  KEY idx_album_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 说说
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moment (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  occurred_at DATETIME    NOT NULL,
  tag_key     VARCHAR(32) NOT NULL DEFAULT 'life',
  tag_label   VARCHAR(32) NOT NULL DEFAULT '生活',
  body        LONGTEXT    DEFAULT NULL,
  images      LONGTEXT    DEFAULT NULL,
  published   TINYINT(1)  NOT NULL DEFAULT 1,
  created_at  DATETIME    NOT NULL,
  updated_at  DATETIME    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_moment_date (occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 项目
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  title      VARCHAR(255) NOT NULL,
  status     VARCHAR(32)  NOT NULL DEFAULT '进行中',
  progress   INT          NOT NULL DEFAULT 0,
  summary    TEXT         DEFAULT NULL,
  period     VARCHAR(64)  DEFAULT NULL,
  spec       LONGTEXT     DEFAULT NULL,
  images     LONGTEXT     DEFAULT NULL,
  tags       LONGTEXT     DEFAULT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  published  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL,
  updated_at DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_project_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 还没开始的项目清单
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS upcoming_project (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  title      VARCHAR(255) NOT NULL,
  note       VARCHAR(255) DEFAULT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  visible    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 照片（全部作品 / 散图）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photo (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  title      VARCHAR(255) NOT NULL,
  exif       VARCHAR(255) DEFAULT NULL,
  image      VARCHAR(255) NOT NULL,
  alt        VARCHAR(500) DEFAULT NULL,
  collection VARCHAR(16)  NOT NULL DEFAULT 'wall',
  shot_on    DATE         DEFAULT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  visible    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_photo_collection (collection, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 友链
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friend (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(128) NOT NULL,
  site        VARCHAR(190) DEFAULT NULL,
  url         VARCHAR(255) DEFAULT NULL,
  description VARCHAR(500) DEFAULT NULL,
  avatar      VARCHAR(255) DEFAULT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  visible     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 归档条目（可关联文章，也可手动补录旧文）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS archive_entry (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  entry_date    DATE         NOT NULL,
  title         VARCHAR(255) NOT NULL,
  category_name VARCHAR(64)  DEFAULT NULL,
  article_id    BIGINT       DEFAULT NULL,
  created_at    DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_archive_date (entry_date),
  KEY idx_archive_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 关于我（单行配置，id 固定为 1）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS about_profile (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  display_name     VARCHAR(128) DEFAULT NULL,
  subtitle         VARCHAR(190) DEFAULT NULL,
  meta             VARCHAR(255) DEFAULT NULL,
  portrait         VARCHAR(255) DEFAULT NULL,
  portrait_alt     VARCHAR(500) DEFAULT NULL,
  portrait_caption VARCHAR(500) DEFAULT NULL,
  bio              LONGTEXT     DEFAULT NULL,
  cols             LONGTEXT     DEFAULT NULL,
  credits          LONGTEXT     DEFAULT NULL,
  email            VARCHAR(190) DEFAULT NULL,
  github           VARCHAR(190) DEFAULT NULL,
  twitter          VARCHAR(190) DEFAULT NULL,
  updated_at       DATETIME     DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 站点文案（只改文字，不改排版与样式）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_setting (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  setting_key   VARCHAR(80)  NOT NULL,
  group_key     VARCHAR(32)  NOT NULL DEFAULT 'site',
  label         VARCHAR(128) NOT NULL,
  setting_value LONGTEXT     DEFAULT NULL,
  input_type    VARCHAR(16)  NOT NULL DEFAULT 'text',
  sort_order    INT          NOT NULL DEFAULT 0,
  updated_at    DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_site_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 首页「此刻」四格
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS now_item (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  label      VARCHAR(64)  NOT NULL,
  item_value VARCHAR(190) NOT NULL,
  note       VARCHAR(190) DEFAULT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 投稿
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submission (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  title         VARCHAR(255) NOT NULL,
  author_name   VARCHAR(128) NOT NULL,
  author_email  VARCHAR(190) DEFAULT NULL,
  author_site   VARCHAR(190) DEFAULT NULL,
  category_id   BIGINT       DEFAULT NULL,
  cover         VARCHAR(255) DEFAULT NULL,
  excerpt       TEXT         DEFAULT NULL,
  content       LONGTEXT     DEFAULT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
  review_note   VARCHAR(1000) DEFAULT NULL,
  reviewed_by   VARCHAR(64)  DEFAULT NULL,
  submitted_at  DATETIME     NOT NULL,
  reviewed_at   DATETIME     DEFAULT NULL,
  article_id    BIGINT       DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_submission_status (status, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 操作日志
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation_log (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  username   VARCHAR(64)  DEFAULT NULL,
  module     VARCHAR(32)  DEFAULT NULL,
  action     VARCHAR(64)  DEFAULT NULL,
  target     VARCHAR(255) DEFAULT NULL,
  detail     VARCHAR(1000) DEFAULT NULL,
  ip         VARCHAR(64)  DEFAULT NULL,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 媒体库
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_asset (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  path       VARCHAR(255) NOT NULL,
  source     VARCHAR(16)  NOT NULL DEFAULT 'UPLOAD',
  mime       VARCHAR(128) DEFAULT NULL,
  file_size  BIGINT       DEFAULT NULL,
  width      INT          DEFAULT NULL,
  height     INT          DEFAULT NULL,
  created_at DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_media_path (path),
  KEY idx_media_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
