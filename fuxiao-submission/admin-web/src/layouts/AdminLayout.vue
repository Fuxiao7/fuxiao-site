<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
import { getSubmissionCounts } from "@/api/submissions";
import { logout as apiLogout } from "@/api/auth";

interface NavItem {
  label: string;
  to: string;
  icon: string;
  adminOnly?: boolean;
  badgeKey?: "pending";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

const blogUrl = (import.meta.env.VITE_BLOG_URL as string | undefined) || "http://localhost:3100";
const pendingCount = ref(0);

const groups: NavGroup[] = [
  {
    label: "概览",
    items: [{ label: "概览", to: "/", icon: "Odometer" }],
  },
  {
    label: "内容",
    items: [
      { label: "文章", to: "/articles", icon: "Document" },
      { label: "分类与标签", to: "/categories", icon: "CollectionTag" },
      { label: "影集", to: "/albums", icon: "PictureFilled" },
      { label: "照片", to: "/photos", icon: "Camera" },
      { label: "说说", to: "/moments", icon: "ChatLineRound" },
      { label: "项目", to: "/projects", icon: "FolderOpened" },
      { label: "归档", to: "/archive", icon: "Files" },
      { label: "友链", to: "/friends", icon: "Link" },
      { label: "关于页", to: "/about", icon: "User" },
    ],
  },
  {
    label: "运营",
    items: [
      { label: "投稿箱", to: "/submissions", icon: "Promotion", badgeKey: "pending" },
      { label: "媒体库", to: "/media", icon: "Picture" },
    ],
  },
  {
    label: "系统",
    items: [
      { label: "站点文案", to: "/settings", icon: "Edit" },
      { label: "账号", to: "/users", icon: "UserFilled", adminOnly: true },
      { label: "操作日志", to: "/logs", icon: "List", adminOnly: true },
      { label: "导出与发布", to: "/export", icon: "Download" },
      { label: "个人资料", to: "/profile", icon: "Setting" },
    ],
  },
];

const visibleGroups = computed(() =>
  groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || auth.isAdmin),
    }))
    .filter((group) => group.items.length > 0)
);

const currentGroup = computed(() => (route.meta.group as string) || "编辑台");

function badgeFor(item: NavItem): number {
  return item.badgeKey === "pending" ? pendingCount.value : 0;
}

async function loadPending() {
  try {
    const counts = await getSubmissionCounts();
    pendingCount.value = counts.pending || 0;
  } catch {
    pendingCount.value = 0;
  }
}

async function handleCommand(command: string) {
  if (command === "profile") {
    router.push("/profile");
    return;
  }
  if (command === "submit") {
    window.open("/submit", "_blank");
    return;
  }
  if (command === "logout") {
    try {
      await ElMessageBox.confirm("退出后需要重新登录，确定吗？", "退出登录", {
        confirmButtonText: "退出",
        cancelButtonText: "再想想",
        type: "warning",
      });
    } catch {
      return;
    }
    apiLogout().catch(() => undefined);
    auth.logout();
    ElMessage.success("已经退出");
    router.replace("/login");
  }
}

watch(
  () => route.fullPath,
  () => app.closeMobileNav()
);

onMounted(() => {
  loadPending();
  if (auth.token) {
    auth.fetchMe().catch(() => {
      auth.logout();
      router.replace("/login");
    });
  }
});
</script>

<template>
  <div class="admin-shell">
    <div v-if="app.mobileNavOpen" class="sidebar-mask" @click="app.closeMobileNav()" />

    <aside class="sidebar" :class="{ 'is-open': app.mobileNavOpen }">
      <RouterLink to="/" class="brand">
        <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="27" r="12" fill="none" stroke="#d9a35f" stroke-width="2.2" />
          <path
            d="M32 8v5M32 41v5M13 27h5M46 27h5M19 14l3.5 3.5M42 37l3.5 3.5M45 14l-3.5 3.5M22 37l-3.5 3.5"
            stroke="#d9a35f"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <path d="M25 54h14" stroke="#8a8177" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>
          <span class="brand-name">拂晓的投稿系统</span>
          <span class="brand-sub">FUXIAO / EDITORIAL</span>
        </span>
      </RouterLink>

      <nav class="side-nav">
        <div v-for="group in visibleGroups" :key="group.label" class="nav-group">
          <p class="nav-group-label">{{ group.label }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ 'is-active': item.to === '/' ? route.path === '/' : route.path.startsWith(item.to) }"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
            <span v-if="badgeFor(item)" class="nav-badge">{{ badgeFor(item) }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="side-foot">
        <a href="/submit" target="_blank" class="side-link">
          <span>投稿入口</span>
          <span>↗</span>
        </a>
        <a :href="blogUrl" target="_blank" class="side-link">
          <span>打开博客</span>
          <span>↗</span>
        </a>
        <div class="side-user">
          <span class="side-avatar">{{ auth.initial }}</span>
          <span>
            <span class="side-user-name">{{ auth.displayName }}</span>
            <span class="side-user-role">{{ auth.user?.role === "ADMIN" ? "ADMINISTRATOR" : "EDITOR" }}</span>
          </span>
        </div>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <button type="button" class="icon-btn menu-toggle" aria-label="打开导航" @click="app.toggleMobileNav()">
          <el-icon><Expand /></el-icon>
        </button>

        <div class="crumbs">
          <span>{{ currentGroup }}</span>
          <span class="sep">/</span>
          <span class="current">{{ route.meta.title }}</span>
        </div>

        <div class="topbar-actions">
          <RouterLink to="/articles/new" class="quick-write">
            <el-icon><EditPen /></el-icon>
            <span>写文章</span>
          </RouterLink>

          <RouterLink to="/submissions" class="icon-btn" aria-label="投稿箱">
            <el-badge :value="pendingCount" :hidden="!pendingCount" :max="99">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </RouterLink>

          <el-dropdown trigger="click" @command="handleCommand">
            <button type="button" class="user-chip">
              <span class="user-avatar">{{ auth.initial }}</span>
              <span class="user-name">{{ auth.displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="submit">投稿入口</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content">
        <RouterView v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.side-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border: 1px solid rgba(217, 163, 95, 0.45);
  border-radius: 50%;
  background: rgba(168, 97, 31, 0.18);
  color: #e2bb84;
  font-family: var(--font-serif);
  font-size: 12.5px;
}

.quick-write {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 3px;
  font-size: 12px;
  color: var(--muted);
  background: rgba(255, 253, 248, 0.6);
  transition: all 0.18s ease;
}

.quick-write:hover {
  border-color: var(--lamp);
  color: var(--lamp);
  background: #fffdf8;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 8px 4px 5px;
  border: 1px solid transparent;
  border-radius: 20px;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.18s ease;
}

.user-chip:hover {
  border-color: var(--line);
  background: var(--surface);
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ink);
  color: #e6c69a;
  font-family: var(--font-serif);
  font-size: 12px;
}

.user-name {
  font-size: 12px;
}

@media (max-width: 640px) {
  .user-name,
  .quick-write span {
    display: none;
  }
}
</style>
