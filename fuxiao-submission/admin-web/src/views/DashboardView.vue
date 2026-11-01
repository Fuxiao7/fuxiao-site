<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { getDashboard } from "@/api/dashboard";
import { useAuthStore } from "@/stores/auth";
import type { DashboardData, Submission } from "@/types";
import { formatShort } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import StatCard from "@/components/StatCard.vue";
import TrendChart from "@/components/TrendChart.vue";
import DonutChart from "@/components/DonutChart.vue";
import EmptyState from "@/components/EmptyState.vue";

const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const data = ref<DashboardData | null>(null);
const failed = ref(false);

const greeting = computed(() => {
  const hour = dayjs().hour();
  if (hour < 5) return "凌晨好";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});

const todayLine = computed(() => {
  const week = ["日", "一", "二", "三", "四", "五", "六"][dayjs().day()];
  return `${dayjs().format("YYYY 年 M 月 D 日")} · 星期${week} · 第 ${dayjs().diff(dayjs("2017-04-07"), "day")} 天`;
});

const counts = computed(() => data.value?.counts || {});
const pending = computed(() => counts.value.pendingSubmissions || 0);

function submissionLine(item: Submission) {
  return `${item.authorName} · ${item.categoryName || "未分类"} · ${formatShort(item.submittedAt)}`;
}

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    data.value = await getDashboard();
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="OVERVIEW / 概览"
      :title="`${greeting}，${auth.displayName}`"
      :description="todayLine"
    >
      <template #actions>
        <el-button @click="router.push('/submissions')">
          审投稿<template v-if="pending">（{{ pending }}）</template>
        </el-button>
        <el-button type="primary" @click="router.push('/articles/new')">新建文章</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" style="min-height: 320px">
      <template v-if="data">
        <div class="grid grid-4">
          <StatCard
            label="文章"
            icon="Document"
            :value="counts.published || 0"
            unit="篇"
            :note="`${counts.drafts || 0} 篇草稿 · ${counts.offline || 0} 篇下架`"
          />
          <StatCard
            label="待审投稿"
            icon="Promotion"
            :value="counts.pendingSubmissions || 0"
            unit="封"
            :note="`投稿箱共 ${counts.submissions || 0} 封`"
          />
          <StatCard
            label="影集 / 照片"
            icon="PictureFilled"
            :value="counts.albums || 0"
            unit="册"
            :note="`照片 ${counts.photos || 0} 张`"
          />
          <StatCard
            label="说说 / 项目"
            icon="ChatLineRound"
            :value="counts.moments || 0"
            unit="条"
            :note="`项目 ${counts.projects || 0} 个 · 友链 ${counts.friends || 0} 个`"
          />
        </div>

        <div class="dash-row">
          <Panel title="近半年发布" subtitle="按发布日期统计，草稿不计入">
            <TrendChart :data="data.trend" />
          </Panel>
          <Panel title="分类分布" subtitle="文章落在哪几个抽屉里">
            <DonutChart :data="data.categories" />
          </Panel>
        </div>

        <div class="dash-row dash-row-even">
          <Panel title="待审投稿" subtitle="读者寄来的稿子">
            <template #extra>
              <RouterLink to="/submissions" class="panel-link">全部 →</RouterLink>
            </template>
            <div v-if="data.recentSubmissions.length" class="dash-list">
              <button
                v-for="item in data.recentSubmissions"
                :key="item.id"
                type="button"
                class="dash-item"
                @click="router.push({ path: '/submissions', query: { id: String(item.id) } })"
              >
                <span class="dash-item-main">
                  <span class="dash-item-title">{{ item.title }}</span>
                  <span class="dash-item-sub">{{ submissionLine(item) }}</span>
                </span>
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>
            <EmptyState v-else text="没有待审的投稿" hint="有人写信来的时候，会先落在这里。" />
          </Panel>

          <Panel title="最近操作" subtitle="后台里发生的事">
            <template #extra>
              <RouterLink to="/logs" class="panel-link">日志 →</RouterLink>
            </template>
            <div v-if="data.recentLogs.length" class="timeline-list">
              <div
                v-for="log in data.recentLogs"
                :key="log.id"
                class="timeline-item"
                :class="{ 'is-accent': log.module === 'submission' }"
              >
                <p class="timeline-text">
                  {{ log.action }}
                  <span v-if="log.target" class="muted">· {{ log.target }}</span>
                </p>
                <p class="timeline-meta">{{ log.username }} · {{ formatShort(log.createdAt) }}</p>
              </div>
            </div>
            <EmptyState v-else text="还没有操作记录" />
          </Panel>
        </div>

        <div class="dash-row dash-row-narrow">
          <Panel title="内容体检" subtitle="每次打开概览都会重新算一遍">
            <div v-for="item in data.health" :key="item.key" class="health-row">
              <span class="health-dot" :class="item.level" />
              <span>
                <span class="health-label">{{ item.label }}</span>
                <span class="health-hint">{{ item.hint }}</span>
              </span>
              <span class="health-count">{{ item.count }}</span>
            </div>
          </Panel>

          <Panel title="编辑台之外" subtitle="几个常用出口">
            <div class="quick-links">
              <RouterLink to="/export" class="quick-link">
                <el-icon><Download /></el-icon>
                <span>导出到博客</span>
                <small>content.json + 正文</small>
              </RouterLink>
              <RouterLink to="/settings" class="quick-link">
                <el-icon><Edit /></el-icon>
                <span>改站点文案</span>
                <small>首页、页脚、各页引言</small>
              </RouterLink>
              <RouterLink to="/media" class="quick-link">
                <el-icon><Picture /></el-icon>
                <span>媒体库</span>
                <small>{{ counts.media || 0 }} 张图片</small>
              </RouterLink>
              <a href="/submit" target="_blank" class="quick-link">
                <el-icon><Promotion /></el-icon>
                <span>投稿入口</span>
                <small>发给读者的公开链接</small>
              </a>
            </div>
            <p class="field-hint" style="margin-top: 14px">
              累计 {{ counts.views || 0 }} 次阅读、{{ counts.words || 0 }} 字。板块、排版与样式不在本系统修改范围内。
            </p>
          </Panel>
        </div>
      </template>

      <Panel v-else-if="failed" title="没有加载出来">
        <div class="empty-note">
          <p>后端没有响应，检查一下服务是否启动、数据库是否导入。</p>
          <el-button size="small" @click="load">再试一次</el-button>
        </div>
      </Panel>
    </div>
  </div>
</template>
