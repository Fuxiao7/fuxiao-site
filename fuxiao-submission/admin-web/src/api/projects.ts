import { http } from "./http";
import type { Project, UpcomingProject } from "@/types";

export function listProjects() {
  return http.get<Project[]>("/projects");
}

export function createProject(data: Partial<Project>) {
  return http.post<Project>("/projects", data);
}

export function updateProject(id: number, data: Partial<Project>) {
  return http.put<Project>(`/projects/${id}`, data);
}

export function deleteProject(id: number) {
  return http.delete<void>(`/projects/${id}`);
}

export function listUpcoming() {
  return http.get<UpcomingProject[]>("/upcoming");
}

export function createUpcoming(data: Partial<UpcomingProject>) {
  return http.post<UpcomingProject>("/upcoming", data);
}

export function updateUpcoming(id: number, data: Partial<UpcomingProject>) {
  return http.put<UpcomingProject>(`/upcoming/${id}`, data);
}

export function deleteUpcoming(id: number) {
  return http.delete<void>(`/upcoming/${id}`);
}
