import { http } from "./http";
import type { PageResult, SitePublic, Submission } from "@/types";

export function listSubmissions(params: {
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  return http.get<PageResult<Submission>>("/submissions", { params });
}

export function getSubmission(id: number) {
  return http.get<Submission>(`/submissions/${id}`);
}

export function getSubmissionCounts() {
  return http.get<Record<string, number>>("/submissions/counts");
}

export function approveSubmission(
  id: number,
  data: { categoryId?: number | null; note?: string; publish?: boolean }
) {
  return http.post<{ articleId: number; slug: string; articleStatus: string }>(
    `/submissions/${id}/approve`,
    data
  );
}

export function rejectSubmission(id: number, note: string) {
  return http.post<Submission>(`/submissions/${id}/reject`, { note });
}

export function deleteSubmission(id: number) {
  return http.delete<void>(`/submissions/${id}`);
}

/* ------------------------------------------------------------ 公开接口 */

export function getPublicSite() {
  return http.get<SitePublic>("/public/site");
}

export function submitPublic(data: {
  title: string;
  authorName: string;
  authorEmail?: string;
  authorSite?: string;
  categoryId?: number | null;
  excerpt?: string;
  content: string;
  website?: string;
}) {
  return http.post<{ id: number; status: string; message: string }>("/public/submissions", data);
}
