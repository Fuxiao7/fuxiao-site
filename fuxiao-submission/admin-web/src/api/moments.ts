import { http } from "./http";
import type { Moment } from "@/types";

export function listMoments(params: { keyword?: string; tagKey?: string; year?: number } = {}) {
  return http.get<Moment[]>("/moments", { params });
}

export function getMoment(id: number) {
  return http.get<Moment>(`/moments/${id}`);
}

export function createMoment(data: Partial<Moment>) {
  return http.post<Moment>("/moments", data);
}

export function updateMoment(id: number, data: Partial<Moment>) {
  return http.put<Moment>(`/moments/${id}`, data);
}

export function deleteMoment(id: number) {
  return http.delete<void>(`/moments/${id}`);
}
