import type { Block, BlockType } from "@/types";

export const BLOCK_TYPES: { value: BlockType; label: string; hint: string }[] = [
  { value: "p", label: "段落", hint: "正文的一段" },
  { value: "h2", label: "小标题", hint: "文章里的 ## 标题" },
  { value: "q", label: "引用", hint: "单独成段的引文" },
  { value: "code", label: "代码", hint: "等宽字体，保留换行" },
  { value: "img", label: "插图", hint: "一张图 + 说明" },
];

export const ARTICLE_STATUS: { value: string; label: string }[] = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "offline", label: "已下架" },
];

export const STATUS_KEYS: { value: string; label: string }[] = [
  { value: "tech", label: "技术" },
  { value: "read", label: "读书" },
  { value: "life", label: "生活" },
  { value: "photo", label: "摄影" },
  { value: "write", label: "写字" },
];

export const SUBMISSION_STATUS: { value: string; label: string }[] = [
  { value: "pending", label: "待审" },
  { value: "accepted", label: "已采纳" },
  { value: "rejected", label: "已退回" },
];

export const MOMENT_TAGS: { key: string; label: string }[] = [
  { key: "write", label: "写字" },
  { key: "tech", label: "技术" },
  { key: "life", label: "生活" },
  { key: "read", label: "读书" },
  { key: "photo", label: "摄影" },
];

export const PROJECT_STATUS = ["进行中", "搁置", "已完成"];

export const PHOTO_COLLECTIONS = [
  { value: "wall", label: "全部作品" },
  { value: "scatter", label: "散图" },
];

export const ROLES = [
  { value: "ADMIN", label: "管理员" },
  { value: "EDITOR", label: "编辑" },
];

export const SETTING_GROUPS: { key: string; label: string }[] = [
  { key: "site", label: "站点" },
  { key: "home", label: "首页" },
  { key: "articles", label: "文章" },
  { key: "photography", label: "摄影" },
  { key: "moments", label: "说说" },
  { key: "projects", label: "项目" },
  { key: "archive", label: "归档" },
  { key: "friends", label: "友链" },
  { key: "about", label: "关于" },
  { key: "footer", label: "页脚" },
];

export const MODULES = [
  { value: "auth", label: "登录与账号" },
  { value: "article", label: "文章" },
  { value: "category", label: "分类" },
  { value: "album", label: "影集" },
  { value: "moment", label: "说说" },
  { value: "project", label: "项目" },
  { value: "photo", label: "照片" },
  { value: "friend", label: "友链" },
  { value: "archive", label: "归档" },
  { value: "about", label: "关于页" },
  { value: "setting", label: "站点文案" },
  { value: "submission", label: "投稿" },
  { value: "media", label: "媒体库" },
  { value: "user", label: "账号" },
];

export const TAG_LABELS: Record<string, string> = {
  write: "写字",
  tech: "技术",
  life: "生活",
  read: "读书",
  photo: "摄影",
};

export function emptyBlock(type: BlockType): Block {
  if (type === "img") {
    return { t: "img", src: "", alt: "", cap: "" };
  }
  if (type === "code") {
    return { t: "code", text: "" };
  }
  return { t: type, text: "" };
}
