import { http } from "./http";
import type {
  AboutProfile,
  ArchiveEntry,
  ExportPreview,
  Friend,
  NowItem,
  PublishStatus,
  SiteSetting,
  SyncResult,
} from "@/types";

/* ---------------------------------------------------------------- 友链 */

export function listFriends() {
  return http.get<Friend[]>("/friends");
}

export function createFriend(data: Partial<Friend>) {
  return http.post<Friend>("/friends", data);
}

export function updateFriend(id: number, data: Partial<Friend>) {
  return http.put<Friend>(`/friends/${id}`, data);
}

export function deleteFriend(id: number) {
  return http.delete<void>(`/friends/${id}`);
}

/* ---------------------------------------------------------------- 归档 */

export function listArchive() {
  return http.get<ArchiveEntry[]>("/archive");
}

export function createArchive(data: Partial<ArchiveEntry>) {
  return http.post<ArchiveEntry>("/archive", data);
}

export function updateArchive(id: number, data: Partial<ArchiveEntry>) {
  return http.put<ArchiveEntry>(`/archive/${id}`, data);
}

export function deleteArchive(id: number) {
  return http.delete<void>(`/archive/${id}`);
}

export function syncArchive() {
  return http.post<SyncResult>("/archive/sync");
}

/* ---------------------------------------------------------------- 关于 */

export function getAbout() {
  return http.get<AboutProfile>("/about");
}

export function saveAbout(data: Partial<AboutProfile>) {
  return http.put<AboutProfile>("/about", data);
}

/* ------------------------------------------------------------ 站点文案 */

export function listSettings() {
  return http.get<SiteSetting[]>("/settings");
}

export function saveSettings(items: { settingKey: string; value: string }[]) {
  return http.put<number>("/settings", { items });
}

export function listNowItems() {
  return http.get<NowItem[]>("/now");
}

export function saveNowItems(items: NowItem[]) {
  return http.put<NowItem[]>("/now", { items });
}

/* ------------------------------------------------------------ 导出发布 */

export function getExportPreview() {
  return http.get<ExportPreview>("/export/preview");
}

export async function downloadExport(kind: "content" | "package"): Promise<void> {
  const blob = await http.get<Blob>(`/export/${kind}`, { responseType: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = kind === "content" ? "content.json" : "fuxiao-site-export.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ------------------------------------------------------------ 线上发布 */

export function getPublishStatus() {
  return http.get<PublishStatus>("/publish/status");
}

export function publishSite() {
  return http.post<PublishStatus>("/publish");
}
