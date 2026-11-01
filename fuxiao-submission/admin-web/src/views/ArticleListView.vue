<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  deleteArticle,
  listArticles,
  listCategories,
  setArticleFeatured,
  setArticleStatus,
} from "@/api/articles";
import type { Article, Category } from "@/types";
import { ARTICLE_STATUS } from "@/utils/constants";
import { formatDate, mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";
import StatusTag from "@/components/StatusTag.vue";
import ArticlePreview from "@/components/ArticlePreview.vue";

const router = useRouter();

const loading = ref(false);
const rows = ref<Article[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const categories = ref<Category[]>([]);

const filters = reactive<{
  keyword: string;
  categoryId: number | null;
  status: string;
  featured: boolean | null;
}>({ keyword: "", categoryId: null, status: "", featured: null });

const previewVisible = ref(false);
const previewArticle = ref<Article | null>(null);

async function load() {
  loading.value = true;
  try {
    const result = await listArticles({
      keyword: filters.keyword.trim() || undefined,
      categoryId: filters.categoryId || undefined,
      status: filters.status || undefined,
      featured: filters.featured,
      page: page.value,
      size: size.value,
    });
    rows.value = result.list;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function search() {
  page.value = 1;
  load();
}

function reset() {
  filters.keyword = "";
  filters.categoryId = null;
  filters.status = "";
  filters.featured = null;
  search();
}

function changePage(next: number) {
  page.value = next;
  load();
}

function changeSize(next: number) {
  size.value = next;
  page.value = 1;
  load();
}

function edit(article: Article) {
  if (!article.id) return;
  router.push(`/articles/${article.id}/edit`);
}

function preview(article: Article) {
  previewArticle.value = article;
  previewVisible.value = true;
}

async function toggleFeatured(article: Article) {
  if (!article.id) return;
  const next = await setArticleFeatured(article.id, !article.featured);
  article.featured = next.featured;
  ElMessage.success(next.featured ? "已加入首页精选" : "已取消精选");
}

async function toggleStatus(article: Article) {
  if (!article.id) return;
  const nextStatus = article.status === "published" ? "offline" : "published";
  const action = nextStatus === "published" ? "发布" : "下架";
  try {
    await ElMessageBox.confirm(`确定${action}《${article.title}》吗？`, `${action}文章`, {
      confirmButtonText: action,
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  const updated = await setArticleStatus(article.id, nextStatus);
  article.status = updated.status;
  ElMessage.success(`已${action}`);
}

async function remove(article: Article) {
  if (!article.id) return;
  try {
    await ElMessageBox.confirm(
      `《${article.title}》删除后不可恢复，归档条目也会指向空白。`,
      "删除文章",
      { confirmButtonText: "删除", cancelButtonText: "保留", type: "warning" }
    );
  } catch {
    return;
  }
  await deleteArticle(article.id);
  ElMessage.success("已删除");
  if (rows.value.length === 1 && page.value > 1) {
    page.value -= 1;
  }
  load();
}

function onCommand(command: string, article: Article) {
  if (command === "status") toggleStatus(article);
  if (command === "delete") remove(article);
}

onMounted(async () => {
  categories.value = await listCategories();
  await load();
});
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / ARTICLES"
      title="文章"
      :count="`${total} 篇`"
      description="写技术，也写读书和生活。列表按发布日期倒序；首页会取「精选」里的前三篇。"
    >
      <template #actions>
        <el-button @click="router.push('/categories')">分类与标签</el-button>
        <el-button type="primary" @click="router.push('/articles/new')">写新文章</el-button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜标题或 slug"
        clearable
        @keyup.enter="search"
        @clear="search"
      />
      <el-select v-model="filters.categoryId" placeholder="全部分类" clearable @change="search">
        <el-option
          v-for="category in categories"
          :key="category.id"
          :label="`${category.name}（${category.articleCount || 0}）`"
          :value="category.id"
        />
      </el-select>
      <el-select v-model="filters.status" placeholder="全部状态" clearable @change="search">
        <el-option
          v-for="item in ARTICLE_STATUS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select v-model="filters.featured" placeholder="是否精选" clearable @change="search">
        <el-option label="只看精选" :value="true" />
        <el-option label="只看非精选" :value="false" />
      </el-select>
      <el-button @click="search">筛选</el-button>
      <el-button text @click="reset">重置</el-button>
      <span class="mono faint" style="margin-left: auto; font-size: 10px">共 {{ total }} 篇</span>
    </div>

    <Panel flush>
      <el-table v-loading="loading" :data="rows" row-key="id" style="width: 100%">
        <el-table-column label="封面" width="82">
          <template #default="{ row }">
            <img v-if="row.cover" class="table-cover" :src="mediaUrl(row.cover)" :alt="row.coverAlt || ''" />
            <div v-else class="table-cover" />
          </template>
        </el-table-column>

        <el-table-column label="标题" min-width="280">
          <template #default="{ row }">
            <a href="#" class="table-title" @click.prevent="edit(row)">{{ row.title }}</a>
            <p class="table-sub">
              /articles/{{ row.slug }} · {{ row.blocks?.length || 0 }} 块 · {{ row.wordCount || 0 }} 字
            </p>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="112">
          <template #default="{ row }">
            <span class="soft-tag">{{ row.categoryName || "未分类" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="日期" width="114">
          <template #default="{ row }">
            <span class="mono" style="font-size: 11px">{{ formatDate(row.publishedAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="94">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>

        <el-table-column label="精选" width="66" align="center">
          <template #default="{ row }">
            <button
              type="button"
              class="star-btn"
              :class="{ on: row.featured }"
              :title="row.featured ? '取消精选' : '设为首页精选'"
              @click="toggleFeatured(row)"
            >
              <el-icon><Star /></el-icon>
            </button>
          </template>
        </el-table-column>

        <el-table-column label="阅读" width="78" align="right">
          <template #default="{ row }">
            <span class="mono faint" style="font-size: 10.5px">{{ row.views || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="188" align="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text size="small" @click="edit(row)">编辑</el-button>
              <el-button text size="small" @click="preview(row)">预览</el-button>
              <el-dropdown trigger="click" @command="(command) => onCommand(command, row)">
                <el-button text size="small">
                  更多<el-icon style="margin-left: 2px"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="status">
                      {{ row.status === "published" ? "下架" : "发布" }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <EmptyState text="没有匹配的文章" hint="换一个关键词，或者写一篇新的。" />
        </template>
      </el-table>
    </Panel>

    <div class="pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        :current-page="page"
        :page-size="size"
        :page-sizes="[10, 20, 50]"
        @current-change="changePage"
        @size-change="changeSize"
      />
    </div>

    <el-drawer v-model="previewVisible" title="文章预览" size="58%">
      <ArticlePreview :article="previewArticle" />
    </el-drawer>
  </div>
</template>

<style scoped>
.star-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--line-strong);
  cursor: pointer;
  transition: all 0.18s ease;
}

.star-btn:hover {
  color: var(--lamp);
  background: var(--lamp-soft);
}

.star-btn.on {
  color: var(--lamp);
}
</style>
