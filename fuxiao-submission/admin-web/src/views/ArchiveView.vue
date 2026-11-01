<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createArchive,
  deleteArchive,
  listArchive,
  syncArchive,
  updateArchive,
} from "@/api/site";
import { listArticleOptions } from "@/api/articles";
import type { ArchiveEntry, ArticleOption } from "@/types";
import { formatDate } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";

const loading = ref(false);
const syncing = ref(false);
const entries = ref<ArchiveEntry[]>([]);
const options = ref<ArticleOption[]>([]);

const dialogVisible = ref(false);
const editingId = ref<number | null>(null);

const form = reactive<ArchiveEntry>({
  entryDate: dayjs().format("YYYY-MM-DD"),
  title: "",
  categoryName: "",
  articleId: null,
});

const groups = computed(() => {
  const map = new Map<number, ArchiveEntry[]>();
  entries.value.forEach((entry) => {
    const year = Number(entry.entryDate.slice(0, 4));
    if (!map.has(year)) map.set(year, []);
    map.get(year)?.push(entry);
  });
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, rows]) => ({ year, rows }));
});

async function load() {
  loading.value = true;
  try {
    const [archiveList, articleOptions] = await Promise.all([listArchive(), listArticleOptions()]);
    entries.value = archiveList;
    options.value = articleOptions;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, {
    entryDate: dayjs().format("YYYY-MM-DD"),
    title: "",
    categoryName: "",
    articleId: null,
  });
  dialogVisible.value = true;
}

function openEdit(entry: ArchiveEntry) {
  editingId.value = entry.id || null;
  Object.assign(form, {
    entryDate: entry.entryDate,
    title: entry.title,
    categoryName: entry.categoryName || "",
    articleId: entry.articleId || null,
  });
  dialogVisible.value = true;
}

watch(
  () => form.articleId,
  (articleId) => {
    if (!articleId) return;
    const option = options.value.find((item) => item.id === articleId);
    if (option) {
      form.title = option.title;
    }
  }
);

async function submit() {
  if (!form.title.trim()) {
    ElMessage.warning("请填写标题");
    return;
  }
  const payload: Partial<ArchiveEntry> = {
    entryDate: form.entryDate,
    title: form.title.trim(),
    categoryName: form.categoryName || null,
    articleId: form.articleId || null,
  };
  if (editingId.value) {
    await updateArchive(editingId.value, payload);
    ElMessage.success("归档条目已更新");
  } else {
    await createArchive(payload);
    ElMessage.success("归档条目已添加");
  }
  dialogVisible.value = false;
  load();
}

async function remove(entry: ArchiveEntry) {
  if (!entry.id) return;
  try {
    await ElMessageBox.confirm(`删除归档里的「${entry.title}」？`, "删除归档", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  await deleteArchive(entry.id);
  ElMessage.success("已删除");
  load();
}

async function sync() {
  syncing.value = true;
  try {
    const result = await syncArchive();
    ElMessage.success(
      `同步完成：新增 ${result.created}，更新 ${result.updated}，移除 ${result.removed}，共 ${result.total} 条`
    );
    load();
  } finally {
    syncing.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / ARCHIVE"
      title="归档"
      description="归档是文章的另一条索引。已发布的文章可以一键同步进来，旧文章也可以手动补录。"
      :count="`${entries.length} 条`"
    >
      <template #actions>
        <el-button :loading="syncing" @click="sync">从文章同步</el-button>
        <el-button type="primary" @click="openCreate">新增条目</el-button>
      </template>
    </PageHeader>

    <div class="notice lamp" style="margin-bottom: 16px">
      <el-icon style="margin-top: 2px"><InfoFilled /></el-icon>
      <span>
        「同步」只处理已发布文章：为缺失的文章补条目、更新标题与日期、移除指向草稿的条目。
        手动添加的条目（没有关联文章）不会被删掉。
      </span>
    </div>

    <div v-loading="loading" style="min-height: 240px">
      <div v-if="groups.length">
        <section v-for="group in groups" :key="group.year" style="margin-bottom: 26px">
          <div class="archive-year">
            <h2>{{ group.year }}</h2>
            <span class="mono">{{ group.rows.length }} 篇</span>
          </div>
          <Panel flush>
            <div
              v-for="entry in group.rows"
              :key="entry.id"
              class="archive-row"
            >
              <span class="mono archive-date">{{ formatDate(entry.entryDate, "MM.DD") }}</span>
              <span class="archive-title">
                {{ entry.title }}
                <span v-if="entry.articleId" class="soft-tag" style="margin-left: 8px">已关联 #{{ entry.articleId }}</span>
              </span>
              <span class="mono archive-cat">{{ entry.categoryName || "—" }}</span>
              <span class="row" style="gap: 2px">
                <el-button text size="small" @click="openEdit(entry)">编辑</el-button>
                <el-button text size="small" @click="remove(entry)">删除</el-button>
              </span>
            </div>
          </Panel>
        </section>
      </div>
      <EmptyState v-else text="归档还是空的" hint="点「从文章同步」，把已发布的文章收进来。" />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑归档条目' : '新增归档条目'"
      width="480px"
      append-to-body
    >
      <el-form label-position="top">
        <div class="field-grid">
          <el-form-item label="日期">
            <el-date-picker v-model="form.entryDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="form.categoryName" placeholder="技术随笔" />
          </el-form-item>
        </div>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="文章标题" />
        </el-form-item>
        <el-form-item label="关联文章（可选）">
          <el-select v-model="form.articleId" clearable filterable placeholder="选择一篇文章" style="width: 100%">
            <el-option
              v-for="option in options"
              :key="option.id"
              :label="option.title"
              :value="option.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.archive-year {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 2px 8px;
  border-bottom: 1px solid var(--line);
}

.archive-year h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 400;
}

.archive-year .mono {
  font-size: 10px;
  color: var(--faint);
}

.archive-row {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) 96px 108px;
  align-items: center;
  gap: 12px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--line-soft);
  transition: background-color 0.16s ease;
}

.archive-row:last-child {
  border-bottom: 0;
}

.archive-row:hover {
  background: var(--surface-2);
}

.archive-date {
  font-size: 10px;
  color: var(--faint);
}

.archive-title {
  font-size: 13px;
  color: var(--ink-2);
}

.archive-cat {
  font-size: 10px;
  color: var(--faint);
}
</style>
