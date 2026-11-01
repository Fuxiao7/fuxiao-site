import dayjs from "dayjs";

const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE as string | undefined) || "";

export function formatDate(value?: string | null, pattern = "YYYY.MM.DD"): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format(pattern) : "—";
}

export function formatDateTime(value?: string | null): string {
  return formatDate(value, "YYYY.MM.DD HH:mm");
}

export function formatShort(value?: string | null): string {
  if (!value) return "—";
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  const now = dayjs();
  if (d.isSame(now, "day")) return `今天 ${d.format("HH:mm")}`;
  if (d.isSame(now.subtract(1, "day"), "day")) return `昨天 ${d.format("HH:mm")}`;
  if (d.isSame(now, "year")) return d.format("MM.DD HH:mm");
  return d.format("YYYY.MM.DD");
}

/** 图片路径：/media 与 /uploads 是站点根路径，其余按博客图片处理。 */
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/uploads/")) return path;
  if (path.startsWith("/media/")) return `${MEDIA_BASE}${path}`;
  if (path.startsWith("/")) return path;
  return `${MEDIA_BASE}/media/${path}`;
}

export function fileName(path?: string | null): string {
  if (!path) return "";
  const clean = path.split("?")[0];
  return clean.slice(clean.lastIndexOf("/") + 1);
}

export function fileSize(size?: number | null): string {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function monthLabel(month: string): string {
  const parts = month.split("-");
  return parts.length === 2 ? `${Number(parts[1])} 月` : month;
}

export function excerptOf(text?: string | null, max = 120): string {
  if (!text) return "";
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}
