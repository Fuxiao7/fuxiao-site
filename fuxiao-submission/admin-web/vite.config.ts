import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 开发时：/api 与 /uploads 走后端 8080，/media 走博客 3100。
// 生产环境请在 Nginx 里把这三条路径分别反代到对应服务。
const apiTarget = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8080";
const mediaTarget = process.env.VITE_MEDIA_PROXY_TARGET || "http://127.0.0.1:3100";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // 管理台不使用 Tailwind；显式清空 PostCSS，避免向上读到博客根目录的
  // postcss.config.js / tailwind.config.js。
  css: {
    postcss: {
      plugins: [],
    },
  },
  build: {
    chunkSizeWarningLimit: 1400,
  },
  server: {
    port: 5174,
    host: "127.0.0.1",
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/uploads": { target: apiTarget, changeOrigin: true },
      "/media": { target: mediaTarget, changeOrigin: true },
    },
  },
});
