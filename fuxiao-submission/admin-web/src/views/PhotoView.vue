<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { createPhoto, deletePhoto, listPhotos, updatePhoto } from "@/api/photos";
import type { Photo } from "@/types";
import { PHOTO_COLLECTIONS } from "@/utils/constants";
import { formatDate, mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ImagePicker from "@/components/ImagePicker.vue";

const loading = ref(false);
const photos = ref<Photo[]>([]);
const collection = ref<"wall" | "scatter">("wall");
const keyword = ref("");

const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);

function emptyPhoto(): Photo {
  return {
    title: "",
    exif: "",
    image: "",
    alt: "",
    collection: collection.value,
    shotOn: "",
    sortOrder: 0,
    visible: true,
  };
}

const form = reactive<Photo>(emptyPhoto());

async function load() {
  loading.value = true;
  try {
    photos.value = await listPhotos({
      collection: collection.value,
      keyword: keyword.value.trim() || undefined,
    });
  } finally {
    loading.value = false;
  }
}

function switchCollection(value: string) {
  collection.value = value === "scatter" ? "scatter" : "wall";
  load();
}

function openCreate() {
  Object.assign(form, emptyPhoto(), {
    collection: collection.value,
    sortOrder: photos.value.length,
  });
  editingId.value = null;
  dialogVisible.value = true;
}

function openEdit(photo: Photo) {
  Object.assign(form, emptyPhoto(), photo, {
    collection: photo.collection,
    shotOn: photo.shotOn || "",
  });
  editingId.value = photo.id || null;
  dialogVisible.value = true;
}

async function submit() {
  if (!form.title.trim()) {
    ElMessage.warning("请填写照片标题");
    return;
  }
  if (!form.image) {
    ElMessage.warning("请选择照片");
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<Photo> = {
      ...form,
      title: form.title.trim(),
      shotOn: form.shotOn || null,
    };
    if (editingId.value) {
      await updatePhoto(editingId.value, payload);
      ElMessage.success("照片已更新");
    } else {
      await createPhoto(payload);
      ElMessage.success("照片已添加");
    }
    dialogVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function remove(photo: Photo) {
  if (!photo.id) return;
  try {
    await ElMessageBox.confirm(`删除照片「${photo.title}」？`, "删除照片", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  await deletePhoto(photo.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / PHOTOGRAPHS"
      title="照片"
      description="照片墙与散图是两种展法：一种排得整齐，一种随手放。上传的图片会进入媒体库。"
      :count="`${photos.length} 张`"
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">添加照片</el-button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <div class="pill-tabs">
        <button
          v-for="item in PHOTO_COLLECTIONS"
          :key="item.value"
          type="button"
          :class="{ 'is-active': collection === item.value }"
          @click="switchCollection(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
      <el-input
        v-model="keyword"
        placeholder="搜标题、EXIF 或文件名"
        clearable
        @keyup.enter="load"
        @clear="load"
      />
      <el-button @click="load">搜索</el-button>
    </div>

    <div v-loading="loading" style="min-height: 240px">
      <div v-if="photos.length" class="photo-grid">
        <article v-for="photo in photos" :key="photo.id" class="photo-cell">
          <div class="photo-frame">
            <img :src="mediaUrl(photo.image)" :alt="photo.alt || photo.title" loading="lazy" />
            <span v-if="!photo.visible" class="photo-hidden">已隐藏</span>
            <div class="photo-ops">
              <el-button text size="small" @click="openEdit(photo)">编辑</el-button>
              <el-button text size="small" @click="remove(photo)">删除</el-button>
            </div>
          </div>
          <div class="photo-meta">
            <p class="photo-title">{{ photo.title }}</p>
            <p class="mono photo-exif">{{ photo.exif || "—" }}</p>
            <p class="mono photo-date">
              {{ photo.shotOn ? formatDate(photo.shotOn) : "未填日期" }} · 排序 {{ photo.sortOrder }}
            </p>
          </div>
        </article>
      </div>
      <EmptyState v-else text="这里还没有照片" hint="可以从媒体库选一张，或者先上传。" />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑照片' : '添加照片'"
      width="560px"
      append-to-body
    >
      <div style="display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 18px">
        <ImagePicker v-model="form.image" title="选择照片">
          <div class="cover-drop" style="aspect-ratio: 4 / 5">
            <img v-if="form.image" :src="mediaUrl(form.image)" :alt="form.alt || ''" />
            <div v-else class="cover-empty">
              <el-icon :size="18"><Picture /></el-icon>
              <span>选择照片</span>
            </div>
            <div class="cover-hover">更换</div>
          </div>
        </ImagePicker>

        <el-form label-position="top">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="这张照片叫什么" />
          </el-form-item>
          <el-form-item label="EXIF">
            <el-input v-model="form.exif" placeholder="f/2 · 1/60s · ISO 800 · 35mm" />
          </el-form-item>
          <el-form-item label="图片说明 alt">
            <el-input v-model="form.alt" placeholder="画面里有什么" />
          </el-form-item>
          <div class="field-grid">
            <el-form-item label="分区">
              <el-select v-model="form.collection">
                <el-option
                  v-for="item in PHOTO_COLLECTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="拍摄日期">
              <el-date-picker
                v-model="form.shotOn"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="可不填"
                style="width: 100%"
              />
            </el-form-item>
          </div>
          <div class="field-grid">
            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
            <el-form-item label="显示">
              <el-switch v-model="form.visible" />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}

.photo-cell {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

.photo-frame {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--paper-2);
}

.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.photo-cell:hover .photo-frame img {
  transform: scale(1.03);
}

.photo-hidden {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 1px 6px;
  background: rgba(16, 18, 21, 0.68);
  color: #f2eee4;
  font-family: var(--font-mono);
  font-size: 9px;
}

.photo-ops {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  justify-content: flex-end;
  gap: 2px;
  padding: 18px 6px 5px;
  background: linear-gradient(to top, rgba(16, 18, 21, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-cell:hover .photo-ops {
  opacity: 1;
}

.photo-ops :deep(.el-button) {
  color: rgba(255, 255, 255, 0.86);
  font-size: 11px;
}

.photo-meta {
  padding: 9px 11px 11px;
}

.photo-title {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink);
}

.photo-exif,
.photo-date {
  margin: 3px 0 0;
  font-size: 9.5px;
  letter-spacing: 0.03em;
  color: var(--faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
