import { http } from "./http";
import type {
  Article,
  ArticleOption,
  ArticleQuery,
  Category,
  PageResult,
  TagStat,
} from "@/types";

export function listArticles(params: ArticleQuery) {
  return http.get<PageResult<Article>>("/articles", { params });
}

export function getArticle(id: number) {
  return http.get<Article>(`/articles/${id}`);
}

export function createArticle(data: Partial<Article>) {
  return http.post<Article>("/articles", data);
}

export function updateArticle(id: number, data: Partial<Article>) {
  return http.put<Article>(`/articles/${id}`, data);
}

export function deleteArticle(id: number) {
  return http.delete<void>(`/articles/${id}`);
}

export function setArticleStatus(id: number, status: string) {
  return http.patch<Article>(`/articles/${id}/status`, { status });
}

export function setArticleFeatured(id: number, featured: boolean) {
  return http.patch<Article>(`/articles/${id}/featured`, { featured });
}

export function listArticleOptions() {
  return http.get<ArticleOption[]>("/articles/options");
}

export function listTags() {
  return http.get<TagStat[]>("/articles/tags");
}

export function renameTag(from: string, to: string) {
  return http.put<number>("/articles/tags/rename", { from, to });
}

/* ----------------------------------------------------------------- 分类 */

export function listCategories() {
  return http.get<Category[]>("/categories");
}

export function createCategory(data: Partial<Category>) {
  return http.post<Category>("/categories", data);
}

export function updateCategory(id: number, data: Partial<Category>) {
  return http.put<Category>(`/categories/${id}`, data);
}

export function deleteCategory(id: number) {
  return http.delete<void>(`/categories/${id}`);
}
