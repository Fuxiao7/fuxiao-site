import { http } from "./http";
import type { LoginResponse, User } from "@/types";

export function login(data: { username: string; password: string }) {
  return http.post<LoginResponse>("/auth/login", data);
}

export function getMe() {
  return http.get<User>("/auth/me");
}

export function updateProfile(data: { nickname?: string; email?: string; avatar?: string }) {
  return http.put<User>("/auth/profile", data);
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return http.put<void>("/auth/password", data);
}

export function logout() {
  return http.post<void>("/auth/logout");
}
