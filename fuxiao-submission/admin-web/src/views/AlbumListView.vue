<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { deleteAlbum, listAlbums } from "@/api/albums";
import type { Album } from "@/types";
import { formatDate, mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import EmptyState from "@/components/EmptyState.vue";

const router = useRouter();
const loading = ref(false);
const albums = ref<Album[]>([]);

async function load() {
  loading.value = true;
  try {
    albums.value = await listAlbums();
  } finally {
    loading.value = false;
  }
}

function edit(album: Album) {
  if (!album.id) return;
  router.push(`/albums/${album.id}/edit`);
}

async function remove(album: Album) {
  if (!album.id) return;
  try {
    await ElMessageBox.confirm(`删除影集「${album.title}」？当中的照片只是引用，不会被删掉。`, "删除影集", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  await deleteAlbum(album.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / ALBUMS"
      title="影集"
      description="影集是暗房里的册子：封面、引子、两段故事、一组照片。顺序就是站点上的编号。"
      :count="`${albums.length} 册`"
    >
      <template #actions>
        <el-button type="primary" @click="router.push('/albums/new')">新建影集</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" style="min-height: 200px">
      <div v-if="albums.length" class="album-grid">
        <article v-for="(album, index) in albums" :key="album.id" class="album-card">
          <div style="position: relative">
            <img class="cover" :src="mediaUrl(album.cover)" :alt="album.coverAlt || ''" />
            <span
              class="mono"
              style="
                position: absolute;
                left: 9px;
                top: 9px;
                padding: 2px 6px;
                background: rgba(16, 18, 21, 0.62);
                color: #f2eee4;
                font-size: 9.5px;
                letter-spacing: 0.08em;
              "
            >
              {{ String(index + 1).padStart(2, "0") }}
            </span>
            <span
              v-if="!album.published"
              class="mono"
              style="
                position: absolute;
                right: 9px;
                top: 9px;
                padding: 2px 6px;
                background: rgba(168, 64, 47, 0.82);
                color: #fff;
                font-size: 9px;
              "
            >
              未发布
            </span>
          </div>

          <div class="body">
            <p class="meta">{{ album.albumYear || "—" }} · {{ album.shots || 0 }} 张</p>
            <h3>{{ album.title }}</h3>
            <p class="meta">{{ album.slug }}</p>
            <div class="foot">
              <span class="mono faint" style="font-size: 9.5px">
                {{ formatDate(album.updatedAt) }}
              </span>
              <div class="row" style="gap: 2px">
                <el-button text size="small" @click="edit(album)">编辑</el-button>
                <el-button text size="small" @click="remove(album)">删除</el-button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <EmptyState v-else text="还没有影集" hint="新建一册，把一组照片放进去。" />
    </div>
  </div>
</template>

<style scoped>
.album-card h3 {
  margin-top: 2px;
}
</style>
