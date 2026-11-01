<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox, type UploadRequestOptions } from "element-plus";
import { deleteMedia, listMedia, uploadMedia } from "@/api/media";
import type { MediaAsset } from "@/types";
import { fileSize, mediaUrl } from "@/utils/format";
import { copyText } from "@/utils/clipboard";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";

const loading = ref(false);
const uploading = ref(false);
const assets = ref<MediaAsset[]>([]);
const keyword = ref("");
const source = ref("ALL");

const previewList = computed(() => assets.value.map((asset) => mediaUrl(asset.path)));

async function load() {
  loading.value = true;
  try {
    assets.value = await listMedia({
      keyword: keyword.value.trim() || undefined,
      source: source.value === "ALL" ? undefined : source.value,
    });
  } finally {
    loading.value = false;
  }
}

async function handleUpload(options: UploadRequestOptions) {
  uploading.value = true;
  try {
    await uploadMedia(options.file);
    ElMessage.success("上传完成");
    await load();
  } finally {
    uploading.value = false;
  }
}

async function copy(asset: MediaAsset) {
  const ok = await copyText(asset.path);
  if (ok) {
    ElMessage.success(`已复制 ${asset.path}`);
  } else {
    ElMessage.warning("浏览器不允许自动复制，请手动选择路径");
  }
}

async function remove(asset: MediaAsset) {
  try {
    await ElMessageBox.confirm(
      `删除「${asset.name}」？文件会从 uploads 目录里移除，已经被文章引用的地方会变成空图。`,
      "删除图片",
      { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }
  await deleteMedia(asset.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="OPERATIONS / MEDIA"
      title="媒体库"
      description="博客原有图片是只读的；后台上传的图片放在 uploads 目录，可以删除。"
      :count="`${assets.length} 张`"
    >
      <template #actions>
        <el-upload action="#" :show-file-list="false" accept="image/*" :http-request="handleUpload">
          <el-button type="primary" :loading="uploading">上传图片</el-button>
        </el-upload>
      </template>
    </PageHeader>

    <Panel style="margin-bottom: 16px">
      <el-upload
        action="#"
        drag
        :show-file-list="false"
        accept="image/*"
        :http-request="handleUpload"
        style="width: 100%"
      >
        <div v-loading="uploading" class="upload-zone">
          <el-icon :size="22"><UploadFilled /></el-icon>
          <p>把图片拖到这里，或者点击选择</p>
          <span class="mono">jpg / png / webp / gif / avif · 单张最大 20MB</span>
        </div>
      </el-upload>
    </Panel>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="按文件名搜索"
        clearable
        style="width: 240px"
        @keyup.enter="load"
        @clear="load"
      />
      <el-select v-model="source" style="width: 140px" @change="load">
        <el-option label="全部来源" value="ALL" />
        <el-option label="博客原有" value="BLOG" />
        <el-option label="后台上传" value="UPLOAD" />
      </el-select>
      <el-button @click="load">搜索</el-button>
      <span class="mono faint" style="margin-left: auto; font-size: 10px">
        {{ assets.length }} 张
      </span>
    </div>

    <div v-loading="loading" style="min-height: 260px">
      <div v-if="assets.length" class="media-grid">
        <article v-for="asset in assets" :key="asset.id" class="media-card">
          <el-image
            class="pic"
            :src="mediaUrl(asset.path)"
            :preview-src-list="previewList"
            :initial-index="assets.indexOf(asset)"
            fit="cover"
            loading="lazy"
            preview-teleported
          />
          <div class="meta">
            <p class="name" :title="asset.name">{{ asset.name }}</p>
            <div class="sub">
              <span>{{ asset.source === "BLOG" ? "博客" : "上传" }} · {{ fileSize(asset.size) }}</span>
              <span>{{ asset.width && asset.height ? `${asset.width}×${asset.height}` : "" }}</span>
            </div>
            <div class="row" style="gap: 0; margin-top: 6px">
              <el-button text size="small" @click="copy(asset)">复制路径</el-button>
              <el-button
                v-if="asset.source === 'UPLOAD'"
                text
                size="small"
                @click="remove(asset)"
              >
                删除
              </el-button>
            </div>
          </div>
        </article>
      </div>
      <EmptyState v-else text="没有图片" hint="拖一张进来，或者换个关键词。" />
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 26px 12px;
  color: var(--muted);
}

.upload-zone p {
  margin: 4px 0 0;
  font-size: 13px;
}

.upload-zone span {
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: var(--faint);
}

.media-card :deep(.el-image) {
  display: block;
}
</style>
