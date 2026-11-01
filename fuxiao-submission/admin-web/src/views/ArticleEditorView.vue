<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { createArticle, getArticle, listCategories, updateArticle } from "@/api/articles";
import type { Article, Category } from "@/types";
import { ARTICLE_STATUS } from "@/utils/constants";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import BlockEditor from "@/components/BlockEditor.vue";
import ImagePicker from "@/components/ImagePicker.vue";
import TagInput from "@/components/TagInput.vue";
import ArticlePreview from "@/components/ArticlePreview.vue";
import StatusTag from "@/components/StatusTag.vue";
import { mediaUrl } from "@/utils/format";

const route = useRoute();
const router = useRouter();

const articleId = computed(() => Number(route.params.id || 0));
const isNew = computed(() => !articleId.value);

const loading = ref(false);
const saving = ref(false);
const categories = ref<Category[]>([]);
const previewVisible = ref(false);

function emptyArticle(): Article {
  return {
    slug: "",
    title: "",
    cover: "",
    coverAlt: "",
    excerpt: "",
    deck: "",
    categoryId: null,
    statusKey: "write",
    publishedAt: dayjs().format("YYYY-MM-DD"),
    author: "拂晓",
    location: "杭州",
    featured: false,
    status: "draft",
    tags: [],
    blocks: [{ t: "p", text: "" }],
  };
}

const form = reactive<Article>(emptyArticle());

const words = computed(() =>
  form.blocks.reduce((total, block) => {
    if (!block.text) return total;
    return total + block.text.replace(/\s/g, "").length;
  }, 0)
);

const minutes = computed(() => Math.max(2, Math.round(words.value / 400)));

const selectedCategory = computed(() =>
  categories.value.find((category) => category.id === form.categoryId)
);

const previewArticle = computed<Article>(() => ({
  ...form,
  wordCount: words.value,
  readingMinutes: minutes.value,
  categoryName: selectedCategory.value?.name || form.categoryName || "",
}));

watch(
  () => form.categoryId,
  (categoryId) => {
    const category = categories.value.find((item) => item.id === categoryId);
    if (category) {
      form.statusKey = category.statusKey;
    }
  }
);

function fill(data: Article) {
  Object.assign(form, emptyArticle(), data, {
    blocks:
      data.blocks && data.blocks.length ? data.blocks : [{ t: "p" as const, text: "" }],
    tags: data.tags || [],
    publishedAt: data.publishedAt || dayjs().format("YYYY-MM-DD"),
  });
}

async function load() {
  loading.value = true;
  try {
    categories.value = await listCategories();
    if (!isNew.value) {
      const data = await getArticle(articleId.value);
      fill(data);
    } else {
      const first = categories.value[0];
      if (first) {
        form.categoryId = first.id;
        form.statusKey = first.statusKey;
      }
    }
  } finally {
    loading.value = false;
  }
}

function cleanBlocks() {
  return form.blocks.filter((block) => {
    if (block.t === "img") return Boolean(block.src);
    return Boolean(block.text && block.text.trim());
  });
}

async function save(publish: boolean) {
  if (!form.title.trim()) {
    ElMessage.warning("先给这篇文章一个标题");
    return;
  }
  if (!form.slug.trim() && !publish) {
    // 留空时由后端按时间生成，仍然提示一次
    ElMessage.info("slug 留空，将由系统生成");
  }
  saving.value = true;
  try {
    const payload: Partial<Article> = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim(),
      status: publish ? "published" : isNew.value ? "draft" : form.status,
      deck: form.deck?.trim() || form.excerpt?.trim() || "",
      blocks: cleanBlocks(),
      tags: form.tags,
    };
    const saved = isNew.value
      ? await createArticle(payload)
      : await updateArticle(articleId.value, payload);
    fill(saved);
    ElMessage.success(publish ? "已保存并发布" : "已保存");
    if (isNew.value && saved.id) {
      router.replace(`/articles/${saved.id}/edit`);
    }
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / EDITOR"
      :title="isNew ? '写一篇新的' : '编辑文章'"
      :description="isNew ? '先写三段，然后把它放上去。' : `正在编辑 /articles/${form.slug}`"
    >
      <template #actions>
        <el-button @click="router.push('/articles')">返回列表</el-button>
        <el-button @click="previewVisible = true">预览</el-button>
        <el-button :loading="saving" @click="save(false)">保存</el-button>
        <el-button type="primary" :loading="saving" @click="save(true)">保存并发布</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="editor-layout">
      <div class="stack">
        <div class="panel" style="padding: 22px 24px 26px">
          <el-input v-model="form.title" class="title-input" placeholder="文章标题" />
          <div class="preview-meta" style="margin-top: 10px">
            <StatusTag :status="form.status" />
            <span>{{ selectedCategory?.name || "未分类" }}</span>
            <span>/</span>
            <span>{{ form.publishedAt || "未定日期" }}</span>
            <span>/</span>
            <span>{{ words }} 字 · 约 {{ minutes }} 分钟</span>
            <span v-if="form.featured" style="color: var(--lamp)">· 首页精选</span>
          </div>

          <div class="divider" style="margin: 20px 0 18px" />

          <BlockEditor v-model="form.blocks" />
        </div>

        <Panel title="摘要与导语" subtitle="列表页用摘要，文章页用导语">
          <div class="grid grid-2" style="gap: 0 16px">
            <div>
              <span class="field-label">摘要 excerpt</span>
              <el-input
                v-model="form.excerpt"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="一两句话，出现在文章列表和搜索结果里"
              />
            </div>
            <div>
              <span class="field-label">导语 deck</span>
              <el-input
                v-model="form.deck"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="正文开头的那段斜体引言；留空则复用摘要"
              />
            </div>
          </div>
        </Panel>
      </div>

      <aside class="editor-aside">
        <Panel title="发布设置">
          <div class="stack-sm">
            <div>
              <span class="field-label">状态</span>
              <el-select v-model="form.status" style="width: 100%">
                <el-option
                  v-for="item in ARTICLE_STATUS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div>
              <span class="field-label">分类</span>
              <el-select v-model="form.categoryId" clearable placeholder="选择分类" style="width: 100%">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </div>
            <div>
              <span class="field-label">发布日期</span>
              <el-date-picker
                v-model="form.publishedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%"
              />
            </div>
            <div class="row-between" style="padding-top: 4px">
              <span class="field-label" style="margin: 0">首页精选</span>
              <el-switch v-model="form.featured" />
            </div>
            <div>
              <span class="field-label">标签</span>
              <TagInput v-model="form.tags" />
            </div>
          </div>
        </Panel>

        <Panel title="封面">
          <ImagePicker v-model="form.cover" title="选择封面">
            <div class="cover-drop">
              <img v-if="form.cover" :src="mediaUrl(form.cover)" :alt="form.coverAlt || ''" />
              <div v-else class="cover-empty">
                <el-icon :size="18"><Picture /></el-icon>
                <span>点击选择封面</span>
              </div>
              <div class="cover-hover">更换封面</div>
            </div>
          </ImagePicker>
          <div style="margin-top: 10px">
            <span class="field-label">图片说明 alt</span>
            <el-input v-model="form.coverAlt" placeholder="给读屏与搜索用的一句话" />
          </div>
          <p class="field-hint">封面会出现在列表卡片与文章页顶部，推荐 16:10。</p>
        </Panel>

        <Panel title="链接与署名">
          <div class="stack-sm">
            <div>
              <span class="field-label">slug</span>
              <el-input v-model="form.slug" placeholder="留空自动生成">
                <template #prepend>/articles/</template>
              </el-input>
            </div>
            <div class="grid grid-2" style="gap: 0 10px">
              <div>
                <span class="field-label">作者</span>
                <el-input v-model="form.author" />
              </div>
              <div>
                <span class="field-label">地点</span>
                <el-input v-model="form.location" />
              </div>
            </div>
            <p class="field-hint">slug 只支持小写字母、数字与短横线；改动后旧链接会失效。</p>
          </div>
        </Panel>
      </aside>
    </div>

    <el-drawer v-model="previewVisible" title="文章预览" size="58%">
      <ArticlePreview :article="previewArticle" />
    </el-drawer>
  </div>
</template>
