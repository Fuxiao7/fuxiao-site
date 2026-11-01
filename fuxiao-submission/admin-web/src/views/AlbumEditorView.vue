<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { createAlbum, getAlbum, updateAlbum } from "@/api/albums";
import type { Album } from "@/types";
import { mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import ImagePicker from "@/components/ImagePicker.vue";
import ParagraphList from "@/components/ParagraphList.vue";
import PairList from "@/components/PairList.vue";
import ShotList from "@/components/ShotList.vue";

const route = useRoute();
const router = useRouter();

const albumId = computed(() => Number(route.params.id || 0));
const isNew = computed(() => !albumId.value);
const loading = ref(false);
const saving = ref(false);
const activeTab = ref("basic");
const blogUrl = (import.meta.env.VITE_BLOG_URL as string | undefined) || "http://localhost:3100";

function emptyAlbum(): Album {
  return {
    slug: "",
    title: "",
    cover: "",
    coverAlt: "",
    albumYear: dayjs().year(),
    lead: "",
    meta: ["", "", ""],
    specs: [{ k: "年份", v: "" }],
    why: [],
    quote: ["", ""],
    story: [],
    storyQuote: ["", ""],
    process: [],
    run1: [],
    run2: [],
    sortOrder: 0,
    published: true,
  };
}

const form = reactive<Album>(emptyAlbum());

function fill(data: Album) {
  const base = emptyAlbum();
  Object.assign(form, base, data, {
    albumYear: data.albumYear || base.albumYear,
    meta: data.meta && data.meta.length ? [...data.meta] : base.meta,
    specs: data.specs || [],
    why: data.why || [],
    quote: data.quote && data.quote.length >= 2 ? [...data.quote] : ["", ""],
    story: data.story || [],
    storyQuote:
      data.storyQuote && data.storyQuote.length >= 2 ? [...data.storyQuote] : ["", ""],
    process: data.process || [],
    run1: data.run1 || [],
    run2: data.run2 || [],
  });
}

async function load() {
  loading.value = true;
  try {
    if (!isNew.value) {
      fill(await getAlbum(albumId.value));
    }
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning("先给这册影集一个标题");
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<Album> = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim(),
      meta: form.meta.filter((item) => item && item.trim()),
      quote: form.quote,
      storyQuote: form.storyQuote,
    };
    const saved = isNew.value
      ? await createAlbum(payload)
      : await updateAlbum(albumId.value, payload);
    fill(saved);
    ElMessage.success("影集已保存");
    if (isNew.value && saved.id) {
      router.replace(`/albums/${saved.id}/edit`);
    }
  } finally {
    saving.value = false;
  }
}

function openSite() {
  if (!form.slug) {
    ElMessage.info("保存之后才有站点地址");
    return;
  }
  window.open(`${blogUrl}/photography/${form.slug}`, "_blank");
}

const totalShots = computed(() => form.run1.length + form.run2.length);

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / ALBUM"
      :title="isNew ? '新建影集' : '编辑影集'"
      :description="isNew ? '一册影集由封面、引子、两段文字和两组照片组成。' : `正在编辑 ${form.title}`"
    >
      <template #actions>
        <el-button @click="router.push('/albums')">返回影集</el-button>
        <el-button @click="openSite">在站点查看</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading">
      <Panel flush>
        <el-tabs v-model="activeTab" style="padding: 0 20px">
          <el-tab-pane label="基本" name="basic">
            <div class="album-form">
              <div class="stack">
                <div>
                  <span class="field-label">标题</span>
                  <el-input v-model="form.title" size="large" placeholder="影集标题" />
                </div>
                <div class="field-grid">
                  <div>
                    <span class="field-label">slug</span>
                    <el-input v-model="form.slug" placeholder="neon（留空自动生成）" />
                  </div>
                  <div>
                    <span class="field-label">年份</span>
                    <el-input-number v-model="form.albumYear" :min="1990" :max="2100" style="width: 100%" />
                  </div>
                </div>
                <div>
                  <span class="field-label">引子 lead</span>
                  <el-input
                    v-model="form.lead"
                    type="textarea"
                    :autosize="{ minRows: 4, maxRows: 8 }"
                    placeholder="这一组为什么存在，一两句话"
                  />
                </div>
                <div>
                  <span class="field-label">封面信息（依次显示在标题下方）</span>
                  <ParagraphList v-model="form.meta" :min-rows="1" add-text="加一行封面信息" placeholder="2026 · 十八张" />
                </div>
                <div class="row-between" style="border-top: 1px solid var(--line-soft); padding-top: 14px">
                  <div>
                    <span class="field-label" style="margin: 0">在站点上发布</span>
                    <p class="field-hint" style="margin-top: 2px">关闭后不会出现在摄影页</p>
                  </div>
                  <el-switch v-model="form.published" />
                </div>
                <div>
                  <span class="field-label">排序</span>
                  <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 160px" />
                </div>
              </div>

              <div class="stack">
                <div>
                  <span class="field-label">封面</span>
                  <ImagePicker v-model="form.cover" title="选择影集封面">
                    <div class="cover-drop" style="aspect-ratio: 3 / 4">
                      <img v-if="form.cover" :src="mediaUrl(form.cover)" :alt="form.coverAlt || ''" />
                      <div v-else class="cover-empty">
                        <el-icon :size="18"><Picture /></el-icon>
                        <span>点击选择封面</span>
                      </div>
                      <div class="cover-hover">更换封面</div>
                    </div>
                  </ImagePicker>
                </div>
                <div>
                  <span class="field-label">封面说明 alt</span>
                  <el-input
                    v-model="form.coverAlt"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    placeholder="描述封面里发生了什么"
                  />
                </div>
                <p class="field-hint">当前 {{ totalShots }} 张照片。图组在「图组」标签里编辑。影集图片按 jpg 导出，请使用 jpg 格式。</p>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="文字" name="text">
            <div class="stack" style="padding-bottom: 12px">
              <div>
                <h3 class="form-section-title">01 — 为什么拍这一组</h3>
                <ParagraphList v-model="form.why" add-text="加一段" placeholder="写作动机、判断与取舍" />
              </div>

              <div class="field-grid" style="margin-top: 8px">
                <div>
                  <span class="field-label">引言</span>
                  <el-input v-model="form.quote[0]" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
                </div>
                <div>
                  <span class="field-label">引言出处</span>
                  <el-input v-model="form.quote[1]" placeholder="例如：拍摄笔记，2026.06.18" />
                </div>
              </div>

              <div style="margin-top: 12px">
                <h3 class="form-section-title">02 — 我和她</h3>
                <ParagraphList v-model="form.story" add-text="加一段" placeholder="拍摄当天的故事" />
              </div>

              <div class="field-grid" style="margin-top: 8px">
                <div>
                  <span class="field-label">故事里的引言</span>
                  <el-input v-model="form.storyQuote[0]" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
                </div>
                <div>
                  <span class="field-label">出处</span>
                  <el-input v-model="form.storyQuote[1]" placeholder="可以留空" />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="规格与过程" name="specs">
            <div class="stack" style="padding-bottom: 14px">
              <div>
                <h3 class="form-section-title">规格</h3>
                <p class="form-section-hint">显示在引子右侧：年份、地点、模特、器材、张数。</p>
                <PairList v-model="form.specs" key-placeholder="名称" value-placeholder="内容" add-text="加一条规格" />
              </div>
              <div style="margin-top: 14px">
                <h3 class="form-section-title">03 — 怎么准备的</h3>
                <p class="form-section-hint">前期、造型、器材、时间、收尾之类的几条笔记。</p>
                <PairList v-model="form.process" key-placeholder="环节" value-placeholder="做法" add-text="加一条过程" />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="图组" name="photos">
            <div class="stack" style="padding-bottom: 16px">
              <div>
                <h3 class="form-section-title">第一组</h3>
                <p class="form-section-hint">两列大图，出现在「为什么拍」之后。</p>
                <ShotList v-model="form.run1" add-text="加第一组照片" />
              </div>
              <div style="margin-top: 18px">
                <h3 class="form-section-title">第二组</h3>
                <p class="form-section-hint">满宽横图，出现在「我和她」之后。</p>
                <ShotList v-model="form.run2" add-text="加第二组照片" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </Panel>
    </div>
  </div>
</template>

<style scoped>
.album-form {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 28px;
  padding: 8px 0 18px;
}

@media (max-width: 980px) {
  .album-form {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
