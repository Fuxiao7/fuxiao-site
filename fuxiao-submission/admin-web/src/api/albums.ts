import { http } from "./http";
import type { Album } from "@/types";

export function listAlbums() {
  return http.get<Album[]>("/albums");
}

export function getAlbum(id: number) {
  return http.get<Album>(`/albums/${id}`);
}

export function createAlbum(data: Partial<Album>) {
  return http.post<Album>("/albums", data);
}

export function updateAlbum(id: number, data: Partial<Album>) {
  return http.put<Album>(`/albums/${id}`, data);
}

export function deleteAlbum(id: number) {
  return http.delete<void>(`/albums/${id}`);
}
