import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { TOKEN_KEY } from "@/api/http";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    group?: string;
    public?: boolean;
    adminOnly?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { title: "登录", public: true },
  },
  {
    path: "/submit",
    name: "submit",
    component: () => import("@/views/SubmitPublicView.vue"),
    meta: { title: "投稿", public: true },
  },
  {
    path: "/",
    component: () => import("@/layouts/AdminLayout.vue"),
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
        meta: { title: "概览", group: "编辑台" },
      },
      {
        path: "articles",
        name: "articles",
        component: () => import("@/views/ArticleListView.vue"),
        meta: { title: "文章", group: "内容" },
      },
      {
        path: "articles/new",
        name: "article-new",
        component: () => import("@/views/ArticleEditorView.vue"),
        meta: { title: "写新文章", group: "内容" },
      },
      {
        path: "articles/:id/edit",
        name: "article-edit",
        component: () => import("@/views/ArticleEditorView.vue"),
        meta: { title: "编辑文章", group: "内容" },
      },
      {
        path: "categories",
        name: "categories",
        component: () => import("@/views/CategoryView.vue"),
        meta: { title: "分类与标签", group: "内容" },
      },
      {
        path: "albums",
        name: "albums",
        component: () => import("@/views/AlbumListView.vue"),
        meta: { title: "影集", group: "内容" },
      },
      {
        path: "albums/new",
        name: "album-new",
        component: () => import("@/views/AlbumEditorView.vue"),
        meta: { title: "新建影集", group: "内容" },
      },
      {
        path: "albums/:id/edit",
        name: "album-edit",
        component: () => import("@/views/AlbumEditorView.vue"),
        meta: { title: "编辑影集", group: "内容" },
      },
      {
        path: "photos",
        name: "photos",
        component: () => import("@/views/PhotoView.vue"),
        meta: { title: "照片", group: "内容" },
      },
      {
        path: "moments",
        name: "moments",
        component: () => import("@/views/MomentView.vue"),
        meta: { title: "说说", group: "内容" },
      },
      {
        path: "projects",
        name: "projects",
        component: () => import("@/views/ProjectView.vue"),
        meta: { title: "项目", group: "内容" },
      },
      {
        path: "archive",
        name: "archive",
        component: () => import("@/views/ArchiveView.vue"),
        meta: { title: "归档", group: "内容" },
      },
      {
        path: "friends",
        name: "friends",
        component: () => import("@/views/FriendView.vue"),
        meta: { title: "友链", group: "内容" },
      },
      {
        path: "about",
        name: "about",
        component: () => import("@/views/AboutView.vue"),
        meta: { title: "关于页", group: "内容" },
      },
      {
        path: "submissions",
        name: "submissions",
        component: () => import("@/views/SubmissionView.vue"),
        meta: { title: "投稿箱", group: "运营" },
      },
      {
        path: "media",
        name: "media",
        component: () => import("@/views/MediaView.vue"),
        meta: { title: "媒体库", group: "运营" },
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("@/views/SettingsView.vue"),
        meta: { title: "站点文案", group: "系统" },
      },
      {
        path: "users",
        name: "users",
        component: () => import("@/views/UserView.vue"),
        meta: { title: "账号", group: "系统", adminOnly: true },
      },
      {
        path: "logs",
        name: "logs",
        component: () => import("@/views/LogView.vue"),
        meta: { title: "操作日志", group: "系统", adminOnly: true },
      },
      {
        path: "export",
        name: "export",
        component: () => import("@/views/ExportView.vue"),
        meta: { title: "导出与发布", group: "系统" },
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("@/views/ProfileView.vue"),
        meta: { title: "个人资料", group: "系统" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { title: "没有找到", public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  if (to.meta.public) return true;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  const auth = useAuthStore();
  if (to.meta.adminOnly && auth.user && auth.user.role !== "ADMIN") {
    ElMessage.warning("这个页面只对管理员开放");
    return { path: "/" };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 拂晓的投稿系统` : "拂晓的投稿系统";
});

export default router;
