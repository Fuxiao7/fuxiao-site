# 接口一览

- Base URL：`http://127.0.0.1:8080/api`
- 认证：`Authorization: Bearer <token>`（除 `/auth/login` 与 `/public/**`）
- 响应包：

  ```json
  { "code": 0, "message": "ok", "data": {} }
  ```

  `code != 0` 时 HTTP 状态码同时表示错误类型（400 参数、401 未登录、403 权限、404 不存在、409 冲突、500 服务端）。
- 分页参数：`page`（从 1 开始）、`size`（最大 100）；分页响应：

  ```json
  { "list": [], "total": 0, "page": 1, "size": 10 }
  ```

- 时间格式：`LocalDate` → `YYYY-MM-DD`，`LocalDateTime` → `YYYY-MM-DDTHH:mm:ss`。

---

## 认证

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/auth/login` | `{username,password}` → `{token,user}` |
| GET | `/auth/me` | 当前账号 |
| PUT | `/auth/profile` | `{nickname,email,avatar}` |
| PUT | `/auth/password` | `{oldPassword,newPassword}` |
| POST | `/auth/logout` | 记一条日志（JWT 由前端丢弃） |

## 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/dashboard` | 统计、近半年趋势、分类分布、待审投稿、最近日志、内容体检 |

## 文章

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/articles` | 参数：`keyword`、`categoryId`、`status`、`featured`、`page`、`size` |
| GET | `/articles/{id}` | 详情（含正文块） |
| POST | `/articles` | 新建 |
| PUT | `/articles/{id}` | 更新 |
| DELETE | `/articles/{id}` | 删除 |
| PATCH | `/articles/{id}/status` | `{status: draft\|published\|offline}` |
| PATCH | `/articles/{id}/featured` | `{featured: true\|false}` |
| GET | `/articles/options` | `[{id,title,slug}]`，归档关联用 |
| GET | `/articles/tags` | `[{name,count}]` |
| PUT | `/articles/tags/rename` | `{from,to}` → 影响篇数 |

文章对象（节选）：

```json
{
  "id": 1,
  "slug": "p0",
  "title": "把博客当成一间屋子来设计",
  "cover": "/media/anime-desk.jpg",
  "coverAlt": "深夜，一个女孩在雨窗前伏案写字",
  "excerpt": "……",
  "deck": "……",
  "categoryId": 1,
  "categoryName": "技术随笔",
  "statusKey": "tech",
  "publishedAt": "2026-10-28",
  "author": "拂晓",
  "location": "杭州",
  "featured": true,
  "status": "published",
  "views": 1860,
  "wordCount": 1174,
  "readingMinutes": 3,
  "tags": ["技术随笔", "长期有效", "杭州"],
  "blocks": [
    { "t": "p", "text": "……" },
    { "t": "h2", "text": "先决定屋子朝哪边开窗" },
    { "t": "q", "text": "……" },
    { "t": "code", "text": "…" },
    { "t": "img", "src": "/media/anime-store.jpg", "alt": "…", "cap": "…" }
  ]
}
```

## 分类

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/categories` | 含 `articleCount` |
| POST | `/categories` | `{name,slug,statusKey,sortOrder,visible}` |
| PUT | `/categories/{id}` | 同上 |
| DELETE | `/categories/{id}` | 分类下有文章时返回 400 |

## 影集

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/albums` | 列表（含 `shots`、`nextAlbumId`、`nextAlbumTitle`） |
| GET | `/albums/{id}` | 详情 |
| POST | `/albums` | 新建 |
| PUT | `/albums/{id}` | 更新 |
| DELETE | `/albums/{id}` | 删除 |

影集对象（节选）：

```json
{
  "slug": "neon",
  "title": "霓虹下的人",
  "cover": "/media/pt-660.jpg",
  "coverAlt": "……",
  "albumYear": 2026,
  "lead": "……",
  "meta": ["2026 · 十八张", "模特 阿岚", "杭州 · 中山北路"],
  "specs": [{ "k": "年份", "v": "2026 年 4 月至 6 月" }],
  "why": ["……"],
  "quote": ["……", "阿岚在第一次拍摄时说的"],
  "story": ["……"],
  "storyQuote": ["……", ""],
  "process": [{ "k": "前期", "v": "……" }],
  "run1": [{ "img": "/media/pt-550.jpg", "alt": "……", "cap": "天台 · 18:40" }],
  "run2": [],
  "sortOrder": 0,
  "published": true
}
```

## 说说

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/moments` | `keyword`、`tagKey`、`year` |
| GET | `/moments/{id}` | 详情 |
| POST | `/moments` | `{occurredAt,tagKey,tagLabel,body[],images[],published}` |
| PUT | `/moments/{id}` | 更新 |
| DELETE | `/moments/{id}` | 删除 |

## 项目

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET/POST | `/projects` | 列表 / 新建 |
| PUT/DELETE | `/projects/{id}` | 更新 / 删除 |
| GET/POST | `/upcoming` | 待办清单 / 新建 |
| PUT/DELETE | `/upcoming/{id}` | 更新 / 删除 |

项目：`{title,status,progress,summary,period,spec[],images[],tags[],sortOrder,published}`。

## 照片 / 友链 / 归档

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET/POST | `/photos` | 列表（`collection=wall\|scatter`、`keyword`）/ 新建 |
| PUT/DELETE | `/photos/{id}` | 更新 / 删除 |
| GET/POST | `/friends` | 列表 / 新建 |
| PUT/DELETE | `/friends/{id}` | 更新 / 删除 |
| GET/POST | `/archive` | 列表（日期倒序）/ 新建 |
| PUT/DELETE | `/archive/{id}` | 更新 / 删除 |
| POST | `/archive/sync` | 从已发布文章同步，返回 `{created,updated,removed,total}` |

## 关于页 / 站点文案

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/about` | 单行配置；不存在时自动创建 |
| PUT | `/about` | `{displayName,subtitle,meta,portrait,portraitAlt,portraitCaption,bio[],cols[{title,items[]}],credits[],email,github,twitter}` |
| GET | `/settings` | 全部文案 |
| PUT | `/settings` | `{items:[{settingKey,value}]}`，只更新提交的键 |
| GET | `/now` | 首页「此刻」四格 |
| PUT | `/now` | `{items:[{label,value,note}]}`，整体替换 |

## 投稿

管理端（需登录）：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/submissions` | `status=pending\|accepted\|rejected`、`keyword`、分页 |
| GET | `/submissions/counts` | `{all,pending,accepted,rejected}` |
| GET | `/submissions/{id}` | 详情 |
| POST | `/submissions/{id}/approve` | `{categoryId,note,publish}` → 生成文章，返回 `{articleId,slug,articleStatus,submission}` |
| POST | `/submissions/{id}/reject` | `{note}` |
| DELETE | `/submissions/{id}` | 删除（若已关联文章会一并删除） |

公开（无需登录）：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/public/site` | `{copy,categories,now}`，投稿页用 |
| POST | `/public/submissions` | 见下方 |

```json
{
  "title": "在雨里等一班不会来的车",
  "authorName": "阿昼",
  "authorEmail": "azhou@example.com",
  "authorSite": "azhou.ink",
  "categoryId": 3,
  "excerpt": "……",
  "content": "正文，支持 ## / > / ``` / ![alt](url)",
  "website": ""
}
```

`website` 是蜜罐字段，正常浏览器里保持为空；填了会被静默拒绝。

## 媒体

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/media` | `keyword`、`source=BLOG\|UPLOAD` |
| POST | `/media/upload` | `multipart/form-data`，字段名 `file`，最大 20MB |
| DELETE | `/media/{id}` | 仅允许删除 `UPLOAD` 来源 |

上传成功返回媒体对象；图片通过 `/uploads/**` 访问。

## 账号与日志（仅管理员）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/users` | 列表 |
| POST | `/users` | `{username,password,nickname,email,role}` |
| PUT | `/users/{id}` | `{nickname,email,role}` |
| PATCH | `/users/{id}/enabled` | `{enabled}`；不能停用自己 |
| PUT | `/users/{id}/password` | `{password}` 重置密码 |
| DELETE | `/users/{id}` | 不能删除自己，也不能删掉最后一个可用管理员 |
| GET | `/logs` | `module`、`username`、`keyword`、分页 |

## 导出

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/export/preview` | `{content,articleCount}`，给前端做预览 |
| GET | `/export/content` | 下载 `content.json`（含 `posts`、`categories`、`site`、`albums`…） |
| GET | `/export/package` | 下载完整 ZIP（`content.json`、`article-bodies.json`、`bodies.js`、`media-manifest.json`、`README.md`） |

## 线上发布

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/publish/status` | 当前发布状态 |
| POST | `/publish` | 触发一次线上发布（异步；重复调用返回 409） |

仅管理员可调用。返回：

```json
{
  "enabled": true,
  "state": "running",
  "message": "正在导出内容并构建博客…",
  "startedAt": "2026-11-01 12:48:54",
  "finishedAt": null,
  "log": "……"
}
```

`state`：`idle` / `running` / `success` / `failed`。发布行为由后端环境变量控制：

- `PUBLISH_ENABLED=true`
- `BLOG_DIR=/srv/fuxiao/app`
- `BLOG_BUILD_COMMAND="/usr/bin/npm run build"`
- `BLOG_RESTART_COMMAND="/usr/bin/sudo -n /usr/bin/systemctl restart fuxiao-blog"`
- `BLOG_HEALTH_URL=http://127.0.0.1:3100/`

完整部署步骤见 [`DEPLOY_TENCENT.md`](DEPLOY_TENCENT.md)。
