<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  approveSubmission,
  deleteSubmission,
  getSubmission,
  getSubmissionCounts,
  listSubmissions,
  rejectSubmission,
} from "@/api/submissions";
import { listCategories } from "@/api/articles";
import type { Category, Submission } from "@/types";
import { formatDateTime } from "@/utils/format";
import { SUBMISSION_STATUS } from "@/utils/constants";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";
import StatusTag from "@/components/StatusTag.vue";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const rows = ref<Submission[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const keyword = ref("");
const status = ref("pending");
const categories = ref<Category[]>([]);
const counts = reactive<Record<string, number>>({ all: 0, pending: 0, accepted: 0, rejected: 0 });

const drawerVisible = ref(false);
const detail = ref<Submission | null>(null);
const detailLoading = ref(false);
const reviewCategoryId = ref<number | null>(null);
const reviewNote = ref("");
const reviewing = ref(false);

async function load() {
  loading.value = true;
  try {
    const [result, countData] = await Promise.all([
      listSubmissions({
        status: status.value || undefined,
        keyword: keyword.value.trim() || undefined,
        page: page.value,
        size: size.value,
      }),
      getSubmissionCounts(),
    ]);
    rows.value = result.list;
    total.value = result.total;
    Object.assign(counts, countData);
  } finally {
    loading.value = false;
  }
}

function switchStatus(value: string) {
  status.value = value;
  page.value = 1;
  load();
}

function changePage(next: number) {
  page.value = next;
  load();
}

async function openDetail(id: number) {
  drawerVisible.value = true;
  detailLoading.value = true;
  try {
    const data = await getSubmission(id);
    detail.value = data;
    reviewCategoryId.value = data.categoryId || null;
    reviewNote.value = data.reviewNote || "";
  } finally {
    detailLoading.value = false;
  }
}

async function approve(publish: boolean) {
  if (!detail.value) return;
  reviewing.value = true;
  try {
    const result = await approveSubmission(detail.value.id, {
      categoryId: reviewCategoryId.value,
      note: reviewNote.value.trim(),
      publish,
    });
    ElMessage.success(publish ? "已采纳并发布" : "已采纳，生成了文章草稿");
    const refreshed = await getSubmission(detail.value.id);
    detail.value = refreshed;
    await load();
    if (result.articleId) {
      ElMessage({
        message: `文章 #${result.articleId} 已经生成，可以继续编辑。`,
        type: "success",
        duration: 4000,
      });
    }
  } finally {
    reviewing.value = false;
  }
}

async function reject() {
  if (!detail.value) return;
  if (!reviewNote.value.trim()) {
    ElMessage.warning("写一句退回的理由，投稿的人会看到");
    return;
  }
  reviewing.value = true;
  try {
    const updated = await rejectSubmission(detail.value.id, reviewNote.value.trim());
    detail.value = updated;
    ElMessage.success("已退回");
    await load();
  } finally {
    reviewing.value = false;
  }
}

async function remove(submission: Submission) {
  try {
    await ElMessageBox.confirm(
      submission.articleId
        ? "这封投稿已经生成过文章，删除投稿会连同那篇文章一起删除。确定吗？"
        : `删除投稿「${submission.title}」？`,
      "删除投稿",
      { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }
  await deleteSubmission(submission.id);
  ElMessage.success("已删除");
  drawerVisible.value = false;
  load();
}

function editArticle() {
  if (detail.value?.articleId) {
    router.push(`/articles/${detail.value.articleId}/edit`);
  }
}

function openSubmitPage() {
  window.open("/submit", "_blank");
}

onMounted(async () => {
  categories.value = await listCategories();
  await load();
  const id = Number(route.query.id);
  if (id) {
    openDetail(id);
  }
});
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="OPERATIONS / INBOX"
      title="投稿箱"
      description="读者寄来的稿子。采纳会生成一篇文章草稿，正文按 Markdown 解析；退回会留下理由。"
      :count="`${counts.all || 0} 封`"
    >
      <template #actions>
        <el-button @click="load">刷新</el-button>
        <el-button @click="openSubmitPage">打开投稿页</el-button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <div class="pill-tabs">
        <button type="button" :class="{ 'is-active': !status }" @click="switchStatus('')">
          全部<span class="count">{{ counts.all || 0 }}</span>
        </button>
        <button
          v-for="item in SUBMISSION_STATUS"
          :key="item.value"
          type="button"
          :class="{ 'is-active': status === item.value }"
          @click="switchStatus(item.value)"
        >
          {{ item.label }}<span class="count">{{ counts[item.value] || 0 }}</span>
        </button>
      </div>
      <el-input
        v-model="keyword"
        placeholder="搜标题或作者"
        clearable
        style="width: 220px"
        @keyup.enter="load"
        @clear="load"
      />
      <el-button @click="load">搜索</el-button>
    </div>

    <Panel flush>
      <el-table v-loading="loading" :data="rows" row-key="id">
        <el-table-column label="投稿" min-width="280">
          <template #default="{ row }">
            <button type="button" class="sub-title" @click="openDetail(row.id)">{{ row.title }}</button>
            <p class="table-sub">{{ row.authorName }} · {{ row.authorEmail || "未留邮箱" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="110">
          <template #default="{ row }">
            <span class="soft-tag">{{ row.categoryName || "未分类" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="投稿时间" width="150">
          <template #default="{ row }">
            <span class="mono" style="font-size: 10px">{{ formatDateTime(row.submittedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="94">
          <template #default="{ row }">
            <StatusTag :status="row.status" kind="submission" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text size="small" @click="openDetail(row.id)">审阅</el-button>
              <el-button v-if="row.articleId" text size="small" @click="router.push(`/articles/${row.articleId}/edit`)">
                文章
              </el-button>
              <el-button text size="small" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState text="这一格是空的" hint="没有待审的稿子，或者换个状态看看。" />
        </template>
      </el-table>
    </Panel>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="page"
        :page-size="size"
        @current-change="changePage"
      />
    </div>

    <el-drawer v-model="drawerVisible" title="审阅投稿" size="620px">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <p class="eyebrow">{{ detail.categoryName || "未分类" }} · {{ formatDateTime(detail.submittedAt) }}</p>
          <h1 class="preview-title" style="margin-top: 8px">{{ detail.title }}</h1>

          <dl class="drawer-meta" style="margin-top: 16px">
            <dt>作者</dt>
            <dd>{{ detail.authorName }}</dd>
            <dt>邮箱</dt>
            <dd>{{ detail.authorEmail || "—" }}</dd>
            <dt>站点</dt>
            <dd>{{ detail.authorSite || "—" }}</dd>
            <dt>状态</dt>
            <dd><StatusTag :status="detail.status" kind="submission" /></dd>
            <dt>摘要</dt>
            <dd>{{ detail.excerpt || "—" }}</dd>
          </dl>

          <h2 class="form-section-title">正文</h2>
          <pre class="submission-text">{{ detail.content }}</pre>

          <div v-if="detail.reviewNote" class="notice" style="margin-top: 16px">
            <el-icon style="margin-top: 2px"><ChatLineSquare /></el-icon>
            <span>审核意见：{{ detail.reviewNote }}</span>
          </div>

          <template v-if="detail.status === 'accepted'">
            <div v-if="detail.articleId" class="notice lamp" style="margin-top: 16px">
              <el-icon style="margin-top: 2px"><CircleCheck /></el-icon>
              <span>这封投稿已经生成文章 #{{ detail.articleId }}，可以继续去编辑器里打磨。</span>
            </div>
            <div v-else class="notice" style="margin-top: 16px">
              <el-icon style="margin-top: 2px"><CircleCheck /></el-icon>
              <span>这封投稿已经标记为采纳，但没有关联文章（可能是手动处理的旧稿）。</span>
            </div>
            <el-button
              v-if="detail.articleId"
              type="primary"
              style="margin-top: 12px"
              @click="editArticle"
            >
              去编辑这篇文章
            </el-button>
          </template>

          <template v-else>
            <div v-if="detail.status === 'rejected'" class="notice" style="margin-top: 16px">
              <el-icon style="margin-top: 2px"><InfoFilled /></el-icon>
              <span>这封投稿已经退回。如果改变主意，可以直接重新采纳。</span>
            </div>

            <div class="divider" style="margin: 22px 0 16px" />
            <h2 class="form-section-title">审核</h2>
            <div class="review-bar">
              <div style="width: 170px">
                <span class="field-label">归入分类</span>
                <el-select v-model="reviewCategoryId" placeholder="选择分类" style="width: 100%">
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </div>
              <div style="flex: 1; min-width: 180px">
                <span class="field-label">给作者的说明（可选）</span>
                <el-input v-model="reviewNote" placeholder="写一句意见，采纳或退回都会记下来" />
              </div>
            </div>
            <div class="row" style="margin-top: 14px; flex-wrap: wrap">
              <el-button type="primary" :loading="reviewing" @click="approve(true)">采纳并发布</el-button>
              <el-button :loading="reviewing" @click="approve(false)">采纳，生成草稿</el-button>
              <el-button text :loading="reviewing" @click="reject">退回</el-button>
              <el-button text style="margin-left: auto" @click="remove(detail)">删除投稿</el-button>
            </div>
          </template>
        </template>
        <p v-else class="empty-note">没有读到这封投稿。</p>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.sub-title {
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 13.5px;
  color: var(--ink);
  cursor: pointer;
}

.sub-title:hover {
  color: var(--lamp);
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
