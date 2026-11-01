import raw from "./content.json";

export const media = (name) => `/media/${name}`;

export const posts = raw.posts.map((p, i) => ({ ...p, index: i }));

const jpg = (n) => (/\.jpe?g$/i.test(n) ? n : `${n}.jpg`);
const run = (list) =>
  (list || []).map(([img, alt, cap]) => ({ src: jpg(img), alt, cap }));

export const albums = raw.albums.map((a, i) => ({
  ...a,
  index: i,
  slug: a.file.replace(/^album-/, "").replace(/\.html$/, ""),
  no: String(i + 1).padStart(2, "0"),
  coverFile: jpg(a.cover),
  shots: (a.run1 || []).length + (a.run2 || []).length,
  runs1: run(a.run1),
  runs2: run(a.run2),
  processPairs: (a.process || []).map(([k, v]) => ({ k, v })),
  quoteText: a.quote?.[0] || "",
  quoteBy: a.quote?.[1] || "",
  storyQuoteText: a.story_quote?.[0] || "",
}));

export const albumBySlug = (slug) => albums.find((a) => a.slug === slug);

export const moments = raw.moments;

export const projects = raw.projects;

export const projectTagLabel = {
  web: "Web",
  rust: "Rust",
  桌面: "桌面",
  图像: "图像",
  音频: "音频",
};

export const projectTags = ["web", "rust", "桌面", "图像", "音频"];

export const friends = raw.friends;

export const archive = raw.archiveGroups || [];

export const about = {
  bio: raw.bio,
  cols: raw.aboutCols,
};

export const photos = raw.photos;

export const scatter = raw.scatter;

export const nav = [
  { to: "/articles", label: "文章", k: "01" },
  { to: "/photography", label: "摄影", k: "02" },
  { to: "/moments", label: "说说", k: "03" },
  { to: "/projects", label: "项目", k: "04" },
  { to: "/archive", label: "归档", k: "05" },
  { to: "/friends", label: "友链", k: "06" },
  { to: "/about", label: "关于", k: "07" },
];

/** 暗房世界的路由：摄影与影集 */
export const isDark = (path) =>
  path === "/photography" || path.startsWith("/photography/");

export const tagLabel = {
  write: "写字",
  tech: "技术",
  life: "生活",
  read: "读书",
  photo: "摄影",
};
