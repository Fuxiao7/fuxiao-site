<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, type UploadRequestOptions } from "element-plus";
import { listMedia, uploadMedia } from "@/api/media";
import { mediaUrl } from "@/utils/format";
import type { MediaAsset } from "@/types";

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    title?: string;
    hint?: string;
  }>(),
  { modelValue: "", title: "选择图片", hint: "" }
);

const emit = defineEmits<{ (event: "update:modelValue", value: string): void }>();

const visible = ref(false);
const loading = ref(false);
const uploading = ref(false);
const assets = ref<MediaAsset[]>([]);
const keyword = ref("");
const source = ref("ALL");
const manual = ref("");

async function load() {
  loading.value = true;
  try {
    assets.value = await listMedia({
      keyword: keyword.value || undefined,
      source: source.value === "ALL" ? undefined : source.value,
    });
  } finally {
    loading.value = false;
  }
}

function open() {
  manual.value = props.modelValue || "";
  visible.value = true;
  load();
}

function choose(path: string) {
  emit("update:modelValue", path);
  visible.value = false;
}

async function handleUpload(options: UploadRequestOptions) {
  uploading.value = true;
  try {
    const asset = await uploadMedia(options.file);
    assets.value.unshift(asset);
    emit("update:modelValue", asset.path);
    visible.value = false;
    ElMessage.success("图片已上传并选用");
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="picker-trigger" @click="open">
    <slot />
  </div>

  <el-dialog v-model="visible" :title="title" width="790px" append-to-body destroy-on-close>
    <div class="picker-bar">
      <el-input
        v-model="keyword"
        placeholder="按文件名搜索"
        clearable
        @keyup.enter="load"
        @clear="load"
      />
      <el-select v-model="source" style="width: 118px" @change="load">
        <el-option label="全部来源" value="ALL" />
        <el-option label="博客图片" value="BLOG" />
        <el-option label="后台上传" value="UPLOAD" />
      </el-select>
      <el-button @click="load">搜索</el-button>
      <el-upload
        action="#"
        :show-file-list="false"
        accept="image/*"
        :http-request="handleUpload"
        style="margin-left: auto"
      >
        <el-button type="primary" plain :loading="uploading">上传新图</el-button>
      </el-upload>
    </div>

    <p v-if="hint" class="field-hint" style="margin: 0 0 10px">{{ hint }}</p>

    <div v-loading="loading" class="picker-grid">
      <button
        v-for="asset in assets"
        :key="asset.id"
        type="button"
        class="picker-cell"
        :class="{ active: asset.path === modelValue }"
        @click="choose(asset.path)"
      >
        <img :src="mediaUrl(asset.path)" :alt="asset.name" loading="lazy" />
        <span>{{ asset.name }}</span>
      </button>
      <p v-if="!loading && !assets.length" class="empty-note" style="grid-column: 1 / -1">
        没有找到图片，换一个关键词或直接上传。
      </p>
    </div>

    <div class="picker-manual">
      <el-input v-model="manual" placeholder="也可以直接填路径，例如 /media/anime-desk.jpg" />
      <el-button type="primary" @click="choose(manual.trim())">使用这个路径</el-button>
      <el-button text @click="choose('')">清除</el-button>
    </div>
  </el-dialog>
</template>
