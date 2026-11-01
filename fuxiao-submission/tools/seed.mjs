/**
 * 拂晓的投稿系统 · 演示数据生成器
 * ---------------------------------------------------------------------------
 * 从博客现有内容（lib/content.json、lib/bodies.js、lib/article-p0.json）
 * 与 public/media 目录生成 db/data.sql，使后台一启动就拥有与线上站点一致的内容。
 *
 * 用法（在本目录下）：
 *   node tools/seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "../..");
const outFile = path.resolve(__dirname, "../db/data.sql");

const content = JSON.parse(fs.readFileSync(path.join(siteRoot, "lib/content.json"), "utf8"));
const p0 = JSON.parse(fs.readFileSync(path.join(siteRoot, "lib/article-p0.json"), "utf8"));

/* 用 VM 取出 lib/bodies.js 里的 bodies 对象（剥离 import/export） */
const bodiesSrc = fs.readFileSync(path.join(siteRoot, "lib/bodies.js"), "utf8");
const start = bodiesSrc.indexOf("const P =");
const end = bodiesSrc.indexOf("export function articleFor");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(`${bodiesSrc.slice(start, end)}\n;globalThis.__bodies = bodies;`, sandbox);
const bodies = sandbox.__bodies;

const tagLabel = { write: "写字", tech: "技术", life: "生活", read: "读书", photo: "摄影" };
const categories = [
  { id: 1, name: "技术随笔", slug: "tech", key: "tech", sort: 1 },
  { id: 2, name: "读书", slug: "read", key: "read", sort: 2 },
  { id: 3, name: "生活", slug: "life", key: "life", sort: 3 },
  { id: 4, name: "摄影随笔", slug: "photo", key: "photo", sort: 4 },
  { id: 5, name: "写字", slug: "write", key: "write", sort: 5 },
];
const categoryIdByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

/* ------------------------------------------------------------------ utils */
const esc = (value) => {
  if (value === null || value === undefined) return "NULL";
  const s = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\u0000/g, "");
  return `'${s}'`;
};
const json = (value) => esc(JSON.stringify(value ?? []));
const bool = (v) => (v ? 1 : 0);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const dt = (s) => esc(s);
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const mediaPath = (file) => `/media/${file}`;

const wordCount = (blocks) =>
  (blocks || []).reduce((n, b) => n + (b.text ? String(b.text).replace(/\s/g, "").length : 0), 0);
const readingMinutes = (blocks) => Math.max(2, Math.round(wordCount(blocks) / 400));

const lines = [];
const emit = (s = "") => lines.push(s);

emit("-- ============================================================================");
emit("--  拂晓的投稿系统 · 演示数据（由 tools/seed.mjs 从博客内容生成）");
emit("--  注意：本脚本会清空内容表后重新写入，仅用于首次初始化 / 重置演示数据。");
emit("-- ============================================================================");
emit("USE fuxiao_admin;");
emit("SET NAMES utf8mb4;");
emit("SET FOREIGN_KEY_CHECKS = 0;");
for (const t of [
  "article", "album", "moment", "project", "upcoming_project", "photo", "friend",
  "archive_entry", "about_profile", "site_setting", "now_item", "submission", "media_asset",
]) {
  emit(`TRUNCATE TABLE ${t};`);
}

/* -------------------------------------------------------------- categories */
emit("\n-- 分类");
for (const c of categories) {
  emit(
    `INSERT INTO category (id, name, slug, status_key, sort_order, visible, created_at) VALUES ` +
      `(${c.id}, ${esc(c.name)}, ${esc(c.slug)}, ${esc(c.key)}, ${c.sort}, 1, NOW());`
  );
}

/* ----------------------------------------------------------------- articles */
emit("\n-- 文章");
content.posts.forEach((p, i) => {
  const id = i + 1;
  const catId = categoryIdByName[p.category] ?? 1;
  const extra = p.slug === "p0" ? p0 : bodies[p.slug];
  const deck = extra?.deck || p.excerpt;
  const blocks = extra?.blocks || [{ t: "p", text: p.excerpt }];
  const [y, m, d] = p.date.split(".").map(Number);
  const featured = i < 3 ? 1 : 0;
  const views = Math.max(120, 1860 - i * 117 + (i % 4) * 37);
  const tags = [p.category, "长期有效", "杭州"];
  emit(
    `INSERT INTO article (id, slug, title, cover, cover_alt, excerpt, deck, category_id, status_key, published_at, author, location, featured, status, views, word_count, reading_minutes, tags, blocks, created_at, updated_at) VALUES (` +
      [
        id,
        esc(p.slug),
        esc(p.title),
        esc(mediaPath(p.cover)),
        esc(p.alt),
        esc(p.excerpt),
        esc(deck),
        catId,
        esc(p.status),
        esc(isoDate(y, m, d)),
        esc("拂晓"),
        esc("杭州"),
        featured,
        esc("published"),
        views,
        wordCount(blocks),
        readingMinutes(blocks),
        json(tags),
        json(blocks),
        dt(`${isoDate(y, m, d)} 23:40:00`),
        dt(`${isoDate(y, m, d)} 23:40:00`),
      ].join(", ") +
      `);`
  );
});

/* ------------------------------------------------------------------ albums */
emit("\n-- 影集");
content.albums.forEach((a, i) => {
  const id = i + 1;
  const slug = a.file.replace(/^album-/, "").replace(/\.html$/, "");
  const year = Number(String(a.meta?.[0] || "").slice(0, 4)) || null;
  const shots = (a.run1 || []).map(([img, alt, cap]) => ({ img: mediaPath(`${img}.jpg`), alt, cap }));
  const shots2 = (a.run2 || []).map(([img, alt, cap]) => ({ img: mediaPath(`${img}.jpg`), alt, cap }));
  const specs = (a.specs || []).map(([k, v]) => ({ k, v }));
  const process = (a.process || []).map(([k, v]) => ({ k, v }));
  emit(
    `INSERT INTO album (id, slug, title, cover, cover_alt, album_year, album_lead, meta, specs, why, quote, story, story_quote, process, run1, run2, sort_order, published, created_at, updated_at) VALUES (` +
      [
        id,
        esc(slug),
        esc(a.title),
        esc(mediaPath(`${a.cover}.jpg`)),
        esc(a.cover_alt),
        year,
        esc(a.lead),
        json(a.meta || []),
        json(specs),
        json(a.why || []),
        json(a.quote || []),
        json(a.story || []),
        json(a.story_quote || []),
        json(process),
        json(shots),
        json(shots2),
        i,
        1,
        dt("2026-09-01 12:00:00"),
        dt("2026-09-01 12:00:00"),
      ].join(", ") +
      `);`
  );
});

/* ----------------------------------------------------------------- moments */
emit("\n-- 说说");
content.moments.forEach((m, i) => {
  const id = i + 1;
  const [mm, dd] = m.date.split(".").map(Number);
  const occurred = `${m.year}-${pad(mm)}-${pad(dd)} ${m.time}:00`;
  emit(
    `INSERT INTO moment (id, occurred_at, tag_key, tag_label, body, images, published, created_at, updated_at) VALUES (` +
      [
        id,
        dt(occurred),
        esc(m.key),
        esc(tagLabel[m.key] || m.tag),
        json(m.body || []),
        json((m.images || []).map(mediaPath)),
        1,
        dt(occurred),
        dt(occurred),
      ].join(", ") +
      `);`
  );
});

/* ----------------------------------------------------------------- projects */
emit("\n-- 项目");
content.projects.forEach((p, i) => {
  const id = i + 1;
  emit(
    `INSERT INTO project (id, title, status, progress, summary, period, spec, images, tags, sort_order, published, created_at, updated_at) VALUES (` +
      [
        id,
        esc(p.title),
        esc(p.status),
        num(String(p.pct).replace("%", "")),
        esc(p.say),
        esc(p.when),
        json(p.spec || []),
        json((p.images || []).map(mediaPath)),
        json(p.tags || []),
        i,
        1,
        dt("2026-08-01 10:00:00"),
        dt("2026-08-01 10:00:00"),
      ].join(", ") +
      `);`
  );
});

emit("\n-- 还没开始的项目");
[
  ["把冲扫流程写成脚本", "停在色彩管理"],
  ["一个只读 RSS 的阅读器", "想清楚之前不动手"],
  ["给影集做一个可分享的排版器", "等这本册子做满"],
].forEach(([title, note], i) => {
  emit(
    `INSERT INTO upcoming_project (id, title, note, sort_order, visible, created_at) VALUES ` +
      `(${i + 1}, ${esc(title)}, ${esc(note)}, ${i}, 1, NOW());`
  );
});

/* ------------------------------------------------------------------- photos */
emit("\n-- 照片");
let photoId = 0;
content.photos.forEach((p, i) => {
  photoId += 1;
  emit(
    `INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (` +
      [
        photoId,
        esc(p.title),
        esc(p.exif),
        esc(mediaPath(p.img)),
        esc(p.alt),
        esc("wall"),
        "NULL",
        i,
        1,
        dt("2026-09-01 10:00:00"),
      ].join(", ") +
      `);`
  );
});
content.scatter.forEach((p, i) => {
  photoId += 1;
  const m = /^(\d{4})\.(\d{2})\.(\d{2})/.exec(p.exif || "");
  const shotOn = m ? esc(`${m[1]}-${m[2]}-${m[3]}`) : "NULL";
  emit(
    `INSERT INTO photo (id, title, exif, image, alt, collection, shot_on, sort_order, visible, created_at) VALUES (` +
      [
        photoId,
        esc(p.title),
        esc(p.exif),
        esc(mediaPath(p.img)),
        esc(p.alt),
        esc("scatter"),
        shotOn,
        i,
        1,
        dt("2026-09-01 10:00:00"),
      ].join(", ") +
      `);`
  );
});

/* ------------------------------------------------------------------ friends */
emit("\n-- 友链");
content.friends.forEach((f, i) => {
  emit(
    `INSERT INTO friend (id, name, site, url, description, avatar, sort_order, visible, created_at) VALUES (` +
      [
        i + 1,
        esc(f.name),
        esc(f.site),
        esc(`https://${f.site}`),
        esc(f.desc),
        "NULL",
        i,
        1,
        dt("2026-08-01 10:00:00"),
      ].join(", ") +
      `);`
  );
});

/* ------------------------------------------------------------------ archive */
emit("\n-- 归档");
const titleToArticle = Object.fromEntries(content.posts.map((p, i) => [p.title, i + 1]));
let archiveId = 0;
(content.archiveGroups || []).forEach((g) => {
  g.rows.forEach((r) => {
    archiveId += 1;
    const [mm, dd] = r.date.split(".").map(Number);
    const articleId = titleToArticle[r.title] ?? null;
    emit(
      `INSERT INTO archive_entry (id, entry_date, title, category_name, article_id, created_at) VALUES ` +
        `(${archiveId}, ${esc(`${g.year}-${pad(mm)}-${pad(dd)}`)}, ${esc(r.title)}, ${esc(r.cat)}, ${articleId ?? "NULL"}, NOW());`
    );
  });
});

/* -------------------------------------------------------------------- about */
emit("\n-- 关于");
emit(
  `INSERT INTO about_profile (id, display_name, subtitle, meta, portrait, portrait_alt, portrait_caption, bio, cols, credits, email, github, twitter, updated_at) VALUES (` +
    [
      1,
      esc("拂晓"),
      esc("前端工程师 · 杭州"),
      esc("杭州 · 一个人 · 一周一篇"),
      esc(mediaPath("portrait-alt.jpg")),
      esc("雾天窗前的人影，站在钢架与天光之间"),
      esc("这张是朋友拍的，雾天，我家窗前。"),
      json(content.bio || []),
      json(content.aboutCols || []),
      json([
        "照片来自 Unsplash（Unsplash License，可商用、需署名）。人像部分取自同一图库，它们是占位素材，等我自己拍够一组就换掉。影集里的模特姓名、故事与 EXIF 都是示例，不是这些照片的真实信息。",
        "六张二次元插图为本站用 AI 图像生成制作的占位图（非 Unsplash 素材）：深夜书桌、末班电车、台灯下的书、屏幕的冷光、暗房显影、雨夜便利店。字体是 Noto Serif SC 与 JetBrains Mono。",
        "Next.js · React Router · Tailwind CSS · GSAP — 2026 年重写",
      ]),
      esc("470379769@qq.com"),
      esc("github.com/dengxia"),
      esc("@dengxia_moe"),
      "NOW()",
    ].join(", ") +
    `);`
);

/* ----------------------------------------------------------------- settings */
emit("\n-- 站点文案");
const settings = [
  ["site.name", "site", "站点名称", "拂晓和朋友们", "text"],
  ["site.subtitle", "site", "站点副题", "秦川逐雪", "text"],
  ["site.description", "site", "站点描述", "所有未熄的热爱 — 技术、摄影与生活的个人文集。", "text"],
  ["site.url", "site", "站点地址", "https://fuxiao.art", "text"],
  ["site.email", "site", "联系邮箱", "470379769@qq.com", "text"],
  ["site.icp", "site", "备案号", "苏ICP备2022037935号", "text"],
  ["site.startedAt", "site", "建站时刻", "2017-04-07 04:45", "text"],
  ["home.hero.brand", "home", "首屏左侧标记", "EST. 2017", "text"],
  ["home.hero.city", "home", "首屏城市", "SHANGHAI", "text"],
  ["home.hero.index", "home", "首屏右上角栏目号", "01 / 首页\n记录 · 技术 · 摄影", "textarea"],
  ["home.hero.title", "home", "首屏主标题", "拂晓和朋友们", "text"],
  ["home.hero.subtitle", "home", "首屏副标题", "所有未熄的热爱。", "text"],
  ["home.hero.cta", "home", "首屏主按钮", "读最新的一篇", "text"],
  ["home.hero.darkroom", "home", "首屏次按钮", "进暗房", "text"],
  ["home.hero.update", "home", "首屏更新提示", "最近更新 2026.10.28", "text"],
  ["home.hero.note", "home", "首屏篇数提示", "第 47 篇 · 写于凌晨一点", "text"],
  ["home.writing.title", "home", "精选书写标题", "精选书写", "text"],
  ["home.writing.aside", "home", "精选书写说明", "不是点得最多的，是我自己还会回头看的。技术、读书、生活，各挑了一篇。", "textarea"],
  ["home.photo.title", "home", "摄影区块标题", "在暗处\n才开始显影", "textarea"],
  ["home.photo.aside", "home", "摄影区块说明", "我拍人像，多数是女孩。七个影集、七十一张，都拍在太阳落下去以后。\n纸面上看照片是灰的，进到暗房里才有颜色。", "textarea"],
  ["home.photo.cta", "home", "摄影区块按钮", "推开暗房的门", "text"],
  ["home.photo.meta", "home", "摄影区块脚注", "71 张 · 7 个影集 · 2024—2026", "text"],
  ["home.moments.title", "home", "说说区块标题", "最近说说", "text"],
  ["home.moments.aside", "home", "说说区块说明", "短的东西写在短的地方。一条一句，偶尔带一张照片。", "textarea"],
  ["home.projects.title", "home", "项目区块标题", "正在做的事", "text"],
  ["home.projects.aside", "home", "项目区块说明", "动手的部分。有的快好了，有的停在半路。", "textarea"],
  ["articles.head.lede", "articles", "文章页引言", "写技术，也写读书和生活。多数是在晚上写的，第二天早上改一遍，然后发出来。", "textarea"],
  ["articles.head.meta", "articles", "文章页统计", "12 篇 · 2019—2026", "text"],
  ["articles.more", "articles", "文章页页脚说明", "更早的文章按年份收在归档里。", "text"],
  ["photography.head.lede", "photography", "摄影页引言", "我拍人像，多数是女孩。七个影集、七十一张，都拍在太阳落下去以后。\n这里没有别的，只有光、表情，和一个不太会说话的人。", "textarea"],
  ["photography.head.meta", "photography", "摄影页统计", "71 张照片 · 7 个影集\n2024.03 — 2026.10", "textarea"],
  ["photography.albums.title", "photography", "影集标题", "影集", "text"],
  ["photography.scatter.title", "photography", "散图标题", "散图", "text"],
  ["photography.wall.title", "photography", "全部作品标题", "全部作品", "text"],
  ["photography.scatter.note", "photography", "散图说明", "散图不进影集：试光、收工前最后一张、忘了为什么按的。点开看大图，方向键翻。", "textarea"],
  ["photography.closing.title", "photography", "摄影页收尾标题", "纸面上是灰的，\n只有在暗房里才有颜色。", "textarea"],
  ["photography.closing.text", "photography", "摄影页收尾说明", "整站只有这一处上色。想回到文字那一侧，走廊在左边：技术、读书、生活都在那儿。", "textarea"],
  ["photography.closing.cta", "photography", "摄影页收尾按钮", "回到书写", "text"],
  ["moments.head.lede", "moments", "说说页引言", "短的东西写在短的地方。一条一句，偶尔带一张照片。标签可以点，点完只看那一类。", "textarea"],
  ["projects.head.lede", "projects", "项目页引言", "动手的那部分。有的是给自己造的工具，有的是为了弄明白一件事。状态都写在上面，不美化。", "textarea"],
  ["projects.upcoming.title", "projects", "未开始清单标题", "还没开始的", "text"],
  ["archive.head.lede", "archive", "归档页引言", "全部文章按年份排。标题、日期、分类，没有摘要也没有缩略图，翻起来快。", "textarea"],
  ["friends.head.lede", "friends", "友链页引言", "十个还在写的人。都是我自己会去读的站，不做互相导流的生意，也不换流量。", "textarea"],
  ["friends.apply.title", "friends", "友链申请标题", "想交换链接", "text"],
  ["friends.apply.text", "friends", "友链申请说明", "写信到 470379769@qq.com，把站名、地址和一句介绍给我。我大约每两周看一次信箱，通过了会在这页加上。", "textarea"],
  ["friends.apply.self", "friends", "本站可用信息", "我这边可以用的信息：站名「拂晓和朋友们」，地址 fuxiao.art，一句介绍「在月光下，记录所有未熄的热爱」。", "textarea"],
  ["about.head.lede", "about", "关于页引言", "拂晓，前端工程师，住在杭州。这个站从 2019 年写到现在，没有换过域名，也没有换过主题。", "textarea"],
  ["about.head.meta", "about", "关于页统计", "杭州 · 一个人 · 一周一篇", "text"],
  ["about.credits.title", "about", "图片来源标题", "图片来源", "text"],
  ["about.credits.body1", "about", "图片来源说明一", "照片来自 Unsplash（Unsplash License，可商用、需署名）。人像部分取自同一图库，它们是占位素材，等我自己拍够一组就换掉。影集里的模特姓名、故事与 EXIF 都是示例，不是这些照片的真实信息。", "textarea"],
  ["about.credits.body2", "about", "图片来源说明二", "六张二次元插图为本站用 AI 图像生成制作的占位图（非 Unsplash 素材）：深夜书桌、末班电车、台灯下的书、屏幕的冷光、暗房显影、雨夜便利店。字体是 Noto Serif SC 与 JetBrains Mono。", "textarea"],
  ["about.credits.stack", "about", "关于页技术落款", "Next.js · React Router · Tailwind CSS · GSAP — 2026 年重写", "text"],
  ["footer.origin", "footer", "页脚建站说明", "建成于 2017 年 4 月凌晨 世纪大道的罗森中。", "textarea"],
  ["footer.columnsTitle", "footer", "页脚栏目标题", "栏目", "text"],
  ["footer.nowTitle", "footer", "页脚此刻标题", "此刻", "text"],
  ["footer.mailTitle", "footer", "页脚写信标题", "写信", "text"],
  ["footer.credits", "footer", "页脚驱动方", "由拂晓智能体-黎明核心驱动", "text"],
  ["footer.running", "footer", "页脚运行提示", "博客已运行", "text"],
];
settings.forEach(([key, group, label, value, type], i) => {
  emit(
    `INSERT INTO site_setting (id, setting_key, group_key, label, setting_value, input_type, sort_order, updated_at) VALUES ` +
      `(${i + 1}, ${esc(key)}, ${esc(group)}, ${esc(label)}, ${esc(value)}, ${esc(type)}, ${i}, NOW());`
  );
});

/* ---------------------------------------------------------------- now items */
emit("\n-- 首页此刻");
[
  ["在写", "Node 里的流", "第 47 篇"],
  ["在读", "《夜晚的潜水艇》", "第三遍"],
  ["在拍", "霓虹下的人", "18 张"],
  ["在学", "CRDT / Rust", "ossia"],
].forEach(([label, value, note], i) => {
  emit(
    `INSERT INTO now_item (id, label, item_value, note, sort_order) VALUES ` +
      `(${i + 1}, ${esc(label)}, ${esc(value)}, ${esc(note)}, ${i});`
  );
});

/* -------------------------------------------------------------- submissions */
emit("\n-- 投稿样例");
const submissions = [
  {
    title: "在雨里等一班不会来的车",
    name: "阿昼",
    email: "azhou@example.com",
    site: "azhou.ink",
    category: "生活",
    excerpt: "末班车停运的夜里，我在站台上碰到了三个同样在等的人。",
    content:
      "那天末班车停运，站台的电子屏只显示一行“今日运营结束”。我没有走，因为雨太大了。\n\n## 三个人\n\n第一个是抱着花的男生，花用塑料袋包着；第二个是拎着行李箱的女孩；第三个是我。我们站在同一盏灯下，谁也没说话。\n\n后来男生先走，把花留在了长椅上。女孩看了看那束花，笑了一下，也走了。\n\n## 最后\n\n我把花带回了家，插在矿泉水瓶里。它开了四天。\n\n有时候城市里最温柔的事，是两个陌生人共同保守一个没人说出口的秘密。",
    status: "pending",
    note: null,
    submittedAt: "2026-10-31 22:14:00",
  },
  {
    title: "Rust 所有权给我的三次退烧",
    name: "陈默",
    email: "chenmo@example.com",
    site: "chenmo.dev",
    category: "技术随笔",
    excerpt: "借用检查器没有让我变聪明，它只是让我不再自欺欺人。",
    content:
      "我学 Rust 的第一个月，写下的代码比删掉的少。\n\n## 第一次\n\n我以为 clone 是解决办法。三个月后我打开一个热点文件，看见满屏的 to_owned()，像一屋子没有扔的快递箱。\n\n## 第二次\n\n我开始学着把数据的所有权放在离使用最近的地方。函数签名变长了，但调用处变短了。\n\n## 第三次\n\n我不再问“怎么让它编译过”，而是问“这块数据应该活多久”。这个问题在别的语言里也有，只是编译器不逼我回答。\n\n现在我还是会写错，但错得比以前坦白。",
    status: "pending",
    note: null,
    submittedAt: "2026-11-01 09:02:00",
  },
  {
    title: "读《伐木之夜》：树林里没有答案",
    name: "林深见鹿",
    email: "lsjl@example.com",
    site: "lsjl.me",
    category: "读书",
    excerpt: "一本关于砍树的书，最后讲的是如何与不砍树这件事相处。",
    content:
      "我把这本书带进了山里读，这大概是我今年做过最正确的一个决定。\n\n作者写伐木，其实很少写树倒下的那一刻，他写的是锯子停下来以后，林子里的声音怎么慢慢回来。\n\n> 树林里没有答案，只有回声。\n\n读到最后我明白，这本书不是在讲劳动，是在讲一个人如何在一个不需要他的地方，安静地待着。",
    status: "accepted",
    note: "已读过，很好。排在下个月的读书栏目。",
    submittedAt: "2026-10-28 20:41:00",
  },
  {
    title: "关于贵站排版的七条建议",
    name: "匿名读者",
    email: "reader@example.com",
    site: null,
    category: "生活",
    excerpt: "一封信，关于字距、留白和为什么正文应该更宽一点。",
    content:
      "你好：\n\n我很喜欢这个站，但有七条排版建议想提。第一，正文行长偏短；第二，图片说明的字号可以再小一点；第三……\n\n希望没有冒犯。",
    status: "rejected",
    note: "谢谢来信。本站的排版由作者本人固定，不开放修改，也不接受排版类投稿。",
    submittedAt: "2026-10-27 16:20:00",
  },
];
submissions.forEach((s, i) => {
  const reviewed = s.status !== "pending";
  emit(
    `INSERT INTO submission (id, title, author_name, author_email, author_site, category_id, cover, excerpt, content, status, review_note, reviewed_by, submitted_at, reviewed_at, article_id) VALUES (` +
      [
        i + 1,
        esc(s.title),
        esc(s.name),
        esc(s.email),
        esc(s.site),
        categoryIdByName[s.category] ?? null,
        "NULL",
        esc(s.excerpt),
        esc(s.content),
        esc(s.status),
        s.note ? esc(s.note) : "NULL",
        reviewed ? esc("拂晓") : "NULL",
        dt(s.submittedAt),
        reviewed ? dt("2026-11-01 10:00:00") : "NULL",
        "NULL",
      ].join(", ") +
      `);`
  );
});

/* --------------------------------------------------------------------- media */
emit("\n-- 媒体库（博客现有图片）");
const mediaDir = path.join(siteRoot, "public/media");
const files = fs
  .readdirSync(mediaDir)
  .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
  .sort();
files.forEach((file, i) => {
  const stat = fs.statSync(path.join(mediaDir, file));
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";
  emit(
    `INSERT INTO media_asset (id, name, path, source, mime, file_size, width, height, created_at) VALUES (` +
      `\n  ${i + 1}, ${esc(file)}, ${esc(mediaPath(file))}, 'BLOG', ${esc(mime)}, ${num(stat.size)}, NULL, NULL, NOW());`
  );
});

emit("\nSET FOREIGN_KEY_CHECKS = 1;");
emit("\n-- 演示数据导入完成：文章 12 篇 / 影集 7 册 / 说说 17 条 / 项目 4 个 / 照片 17 张 / 友链 10 个");
emit("-- 后台初始账号由后端启动时自动创建（默认 admin / fuxiao@2026）。");

fs.writeFileSync(outFile, lines.join("\n") + "\n", "utf8");
console.log(`generated ${outFile} (${lines.length} lines, ${files.length} media assets)`);
