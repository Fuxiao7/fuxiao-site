import { http } from "./http";
import type { OperationLog, PageResult, User } from "@/types";

/* ---------------------------------------------------------------- 账号 */

export function listUsers() {
  return http.get<User[]>("/users");
}

export function createUser(data: {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  role?: string;
}) {
  return http.post<User>("/users", data);
}

export function updateUser(
  id: number,
  data: { nickname?: string; email?: string; role?: string }
) {
  return http.put<User>(`/users/${id}`, data);
}

export function setUserEnabled(id: number, enabled: boolean) {
  return http.patch<User>(`/users/${id}/enabled`, { enabled });
}

export function resetUserPassword(id: number, password: string) {
  return http.put<void>(`/users/${id}/password`, { password });
}

export function deleteUser(id: number) {
  return http.delete<void>(`/users/${id}`);
}

/* ---------------------------------------------------------------- 日志 */

export function listLogs(params: {
  module?: string;
  username?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  return http.get<PageResult<OperationLog>>("/logs", { params });
}
