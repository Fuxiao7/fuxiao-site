import { http } from "./http";
import type { MediaAsset } from "@/types";

export function listMedia(params: { keyword?: string; source?: string } = {}) {
  return http.get<MediaAsset[]>("/media", { params });
}

export function uploadMedia(file: File) {
  const form = new FormData();
  form.append("file", file);
  return http.post<MediaAsset>("/media/upload", form, { timeout: 60000 });
}

export function deleteMedia(id: number) {
  return http.delete<void>(`/media/${id}`);
}
