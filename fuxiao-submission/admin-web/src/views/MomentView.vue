<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { createMoment, deleteMoment, listMoments, updateMoment } from "@/api/moments";
import type { Moment } from "@/types";
import { MOMENT_TAGS } from "@/utils/constants";
import { mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ParagraphList from "@/components/ParagraphList.vue";
import ImageListField from "@/components/ImageListField.vue";

const loading = ref(false);
const all = ref<Moment[]>([]);
const filter = reactive<{ tagKey: string; year: number | null; keyword: string }>({
  tagKey: "",
  year: null,
  keyword: "",
});

const drawerVisible = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);

function emptyMoment(): Moment {
  return {
    occurredAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    tagKey: "life",
    tagLabel: "生活",
    body: [""],
    images: [],
    published: true,
  };
}

const form = reactive<Moment>(emptyMoment());

const years = computed(() =>
  Array.from(new Set(all.value.map((item) => dayjs(item.occurredAt).year()))).sort((a, b) => b - a)
);

const tagCounts = computed(() => {
  const counts: Record<string, number> = {};
  all.value.forEach((item) => {
    counts[item.tagKey] = (counts[item.tagKey] || 0) + 1;
  });
  return counts;
});

const list = computed(() => {
  const keyword = filter.keyword.trim().toLowerCase();
  return all.value.filter((item) => {
    if (filter.tagKey && item.tagKey !== filter.tagKey) return false;
    if (filter.year && dayjs(item.occurredAt).year() !== filter.year) return false;
    if (keyword && !item.body.join(" ").toLowerCase().includes(keyword)) return false;
    return true;
  });
});

async function load() {
  loading.value = true;
  try {
    all.value = await listMoments();
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  Object.assign(form, emptyMoment());
  editingId.value = null;
  drawerVisible.value = true;
}

function openEdit(moment: Moment) {
  Object.assign(form, emptyMoment(), moment, {
    body: moment.body.length ? [...moment.body] : [""],
    images: [...moment.images],
  });
  editingId.value = moment.id || null;
  drawerVisible.value = true;
}

async function save() {
  const body = form.body.filter((item) => item.trim());
  if (!body.length) {
    ElMessage.warning("说说总得有一句话");
    return;
  }
  saving.value = true;
  try {
    const tagLabel = MOMENT_TAGS.find((item) => item.key === form.tagKey)?.label || form.tagLabel;
    const payload: Partial<Moment> = {
      ...form,
      body,
      tagLabel,
    };
    if (editingId.value) {
      await updateMoment(editingId.value, payload);
      ElMessage.success("说说已更新");
    } else {
      await createMoment(payload);
      ElMessage.success("说说已发布");
    }
    drawerVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function remove(moment: Moment) {
  if (!moment.id) return;
  try {
    await ElMessageBox.confirm("删除这条说说？", "删除说说", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  await deleteMoment(moment.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / MOMENTS"
      title="说说"
      description="短的东西写在短的地方。一条一句，偶尔带一张照片。"
      :count="`${all.length} 条`"
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">写一条</el-button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <div class="pill-tabs">
        <button type="button" :class="{ 'is-active': !filter.tagKey }" @click="filter.tagKey = ''">
          全部<span class="count">{{ all.length }}</span>
        </button>
        <button
          v-for="tag in MOMENT_TAGS"
          :key="tag.key"
          type="button"
          :class="{ 'is-active': filter.tagKey === tag.key }"
          @click="filter.tagKey = tag.key"
        >
          {{ tag.label }}<span class="count">{{ tagCounts[tag.key] || 0 }}</span>
        </button>
      </div>
      <el-select v-model="filter.year" placeholder="全部年份" clearable style="width: 130px">
        <el-option v-for="year in years" :key="year" :label="`${year} 年`" :value="year" />
      </el-select>
      <el-input v-model="filter.keyword" placeholder="搜一条说说" clearable style="width: 200px" />
    </div>

    <div v-loading="loading" style="min-height: 240px">
      <div v-if="list.length" class="moment-list">
        <article v-for="moment in list" :key="moment.id" class="moment-item">
          <div class="moment-date">
            <p class="mono">{{ dayjs(moment.occurredAt).format("MM.DD") }}</p>
            <p class="mono faint">{{ dayjs(moment.occurredAt).format("HH:mm") }}</p>
            <p class="mono faint" style="font-size: 9px">{{ dayjs(moment.occurredAt).year() }}</p>
          </div>

          <div class="moment-body">
            <div class="row" style="gap: 8px">
              <span class="soft-tag">#{{ moment.tagLabel }}</span>
              <span v-if="!moment.published" class="soft-tag" style="color: var(--danger)">未发布</span>
            </div>
            <p v-for="(paragraph, index) in moment.body" :key="index" class="moment-text">
              {{ paragraph }}
            </p>
            <div v-if="moment.images.length" class="moment-images">
              <el-image
                v-for="image in moment.images"
                :key="image"
                :src="mediaUrl(image)"
                :preview-src-list="moment.images.map(mediaUrl)"
                fit="cover"
                class="moment-image"
              />
            </div>
          </div>

          <div class="moment-actions">
            <el-button text size="small" @click="openEdit(moment)">编辑</el-button>
            <el-button text size="small" @click="remove(moment)">删除</el-button>
          </div>
        </article>
      </div>
      <EmptyState v-else text="没有匹配的说说" hint="换一个标签，或者写一条新的。" />
    </div>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑说说' : '写一条说说'" size="520px">
      <el-form label-position="top">
        <div class="field-grid">
          <el-form-item label="时间">
            <el-date-picker
              v-model="form.occurredAt"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="form.tagKey" style="width: 100%">
              <el-option
                v-for="tag in MOMENT_TAGS"
                :key="tag.key"
                :label="tag.label"
                :value="tag.key"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="正文">
          <ParagraphList v-model="form.body" add-text="加一段" placeholder="写点什么" :min-rows="3" />
        </el-form-item>

        <el-form-item label="配图">
          <ImageListField v-model="form.images" add-text="添加配图" hint="显示在说说下方，点击可以看大图。" />
        </el-form-item>

        <el-form-item label="发布">
          <el-switch v-model="form.published" />
          <span class="field-hint" style="margin-left: 10px">关闭后这条只留在后台</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="row" style="justify-content: flex-end">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.moment-list {
  border-top: 1px solid var(--line);
}

.moment-item {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) 78px;
  gap: 18px;
  padding: 20px 4px;
  border-bottom: 1px solid var(--line-soft);
}

.moment-date p {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.04em;
}

.moment-date p + p {
  margin-top: 2px;
}

.moment-body {
  min-width: 0;
}

.moment-text {
  margin: 9px 0 0;
  font-size: 13.5px;
  line-height: 1.95;
  color: var(--ink-2);
}

.moment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.moment-image {
  width: 150px;
  height: 106px;
  border-radius: 2px;
  cursor: zoom-in;
}

.moment-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

@media (max-width: 720px) {
  .moment-item {
    grid-template-columns: 62px minmax(0, 1fr);
  }

  .moment-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
  }

  .moment-image {
    width: 120px;
    height: 86px;
  }
}
</style>
