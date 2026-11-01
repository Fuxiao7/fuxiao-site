import axios, { type AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

export const TOKEN_KEY = "fuxiao_token";
export const USER_KEY = "fuxiao_user";

const instance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE as string | undefined) || "/api",
  timeout: 30000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload instanceof Blob) {
      return payload;
    }
    if (payload && typeof payload === "object" && "code" in payload) {
      const body = payload as { code: number; message?: string; data: unknown };
      if (body.code !== 0) {
        ElMessage.error(body.message || "请求失败");
        return Promise.reject(new Error(body.message || "请求失败"));
      }
      return body.data;
    }
    return payload;
  },
  (error) => {
    const status = error?.response?.status as number | undefined;
    const message = (error?.response?.data?.message as string | undefined) || error?.message || "网络错误";
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
    } else if (status === 403) {
      ElMessage.error("没有权限执行这个操作");
    } else {
      ElMessage.error(message);
    }
    return Promise.reject(error);
  }
);

interface HttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const http = instance as unknown as HttpClient;
