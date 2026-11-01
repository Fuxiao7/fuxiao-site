import { http } from "./http";
import type { Photo } from "@/types";

export function listPhotos(params: { collection?: string; keyword?: string } = {}) {
  return http.get<Photo[]>("/photos", { params });
}

export function createPhoto(data: Partial<Photo>) {
  return http.post<Photo>("/photos", data);
}

export function updatePhoto(id: number, data: Partial<Photo>) {
  return http.put<Photo>(`/photos/${id}`, data);
}

export function deletePhoto(id: number) {
  return http.delete<void>(`/photos/${id}`);
}
