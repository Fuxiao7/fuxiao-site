<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createProject,
  createUpcoming,
  deleteProject,
  deleteUpcoming,
  listProjects,
  listUpcoming,
  updateProject,
  updateUpcoming,
} from "@/api/projects";
import type { Project, UpcomingProject } from "@/types";
import { PROJECT_STATUS } from "@/utils/constants";
import { mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ParagraphList from "@/components/ParagraphList.vue";
import TagInput from "@/components/TagInput.vue";
import ImageListField from "@/components/ImageListField.vue";

const loading = ref(false);
const projects = ref<Project[]>([]);
const upcoming = ref<UpcomingProject[]>([]);
const tab = ref("projects");

const drawerVisible = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);

function emptyProject(): Project {
  return {
    title: "",
    status: "进行中",
    progress: 0,
    summary: "",
    period: "",
    spec: [],
    images: [],
    tags: [],
    sortOrder: projects.value.length,
    published: true,
  };
}

const form = reactive<Project>(emptyProject());

const upcomingVisible = ref(false);
const upcomingEditingId = ref<number | null>(null);
const upcomingForm = reactive<UpcomingProject>({
  title: "",
  note: "",
  sortOrder: 0,
  visible: true,
});

const progressLabel = computed(() => `${form.progress}%`);

async function load() {
  loading.value = true;
  try {
    const [projectList, upcomingList] = await Promise.all([listProjects(), listUpcoming()]);
    projects.value = projectList;
    upcoming.value = upcomingList;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  Object.assign(form, emptyProject());
  editingId.value = null;
  drawerVisible.value = true;
}

function openEdit(project: Project) {
  Object.assign(form, emptyProject(), project, {
    spec: [...project.spec],
    images: [...project.images],
    tags: [...project.tags],
  });
  editingId.value = project.id || null;
  drawerVisible.value = true;
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning("请填写项目名称");
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<Project> = { ...form, title: form.title.trim() };
    if (editingId.value) {
      await updateProject(editingId.value, payload);
      ElMessage.success("项目已更新");
    } else {
      await createProject(payload);
      ElMessage.success("项目已创建");
    }
    drawerVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function remove(project: Project) {
  if (!project.id) return;
  try {
    await ElMessageBox.confirm(`删除项目「${project.title}」？`, "删除项目", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  await deleteProject(project.id);
  ElMessage.success("已删除");
  load();
}

function openUpcoming(item?: UpcomingProject) {
  if (item) {
    Object.assign(upcomingForm, item);
    upcomingEditingId.value = item.id || null;
  } else {
    Object.assign(upcomingForm, {
      title: "",
      note: "",
      sortOrder: upcoming.value.length,
      visible: true,
    });
    upcomingEditingId.value = null;
  }
  upcomingVisible.value = true;
}

async function saveUpcoming() {
  if (!upcomingForm.title.trim()) {
    ElMessage.warning("请填写项目名称");
    return;
  }
  const payload: Partial<UpcomingProject> = {
    ...upcomingForm,
    title: upcomingForm.title.trim(),
  };
  if (upcomingEditingId.value) {
    await updateUpcoming(upcomingEditingId.value, payload);
    ElMessage.success("已更新");
  } else {
    await createUpcoming(payload);
    ElMessage.success("已添加");
  }
  upcomingVisible.value = false;
  load();
}

async function removeUpcoming(item: UpcomingProject) {
  if (!item.id) return;
  try {
    await ElMessageBox.confirm(`删除「${item.title}」？`, "删除待办项目", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  await deleteUpcoming(item.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / PROJECTS"
      title="项目"
      description="动手的那部分。状态、进度和说明都写在上面，不美化。"
      :count="`${projects.length} 个`"
    >
      <template #actions>
        <el-button v-if="tab === 'projects'" type="primary" @click="openCreate">新建项目</el-button>
        <el-button v-else type="primary" @click="openUpcoming()">添加待办</el-button>
      </template>
    </PageHeader>

    <div class="row" style="margin-bottom: 16px">
      <div class="pill-tabs">
        <button type="button" :class="{ 'is-active': tab === 'projects' }" @click="tab = 'projects'">
          项目<span class="count">{{ projects.length }}</span>
        </button>
        <button type="button" :class="{ 'is-active': tab === 'upcoming' }" @click="tab = 'upcoming'">
          还没开始的<span class="count">{{ upcoming.length }}</span>
        </button>
      </div>
    </div>

    <div v-loading="loading" style="min-height: 240px">
      <template v-if="tab === 'projects'">
        <div v-if="projects.length" class="project-list">
          <article v-for="project in projects" :key="project.id" class="project-row">
            <div class="project-main">
              <div class="row" style="gap: 8px">
                <h2 class="project-title">{{ project.title }}</h2>
                <span class="soft-tag">{{ project.status }}</span>
                <span v-if="!project.published" class="soft-tag" style="color: var(--danger)">未发布</span>
              </div>
              <p class="mono project-period">{{ project.period || "未写时间" }}</p>
              <p class="project-summary">{{ project.summary }}</p>
              <div class="project-progress">
                <el-progress
                  :percentage="project.progress"
                  :show-text="false"
                  :stroke-width="2"
                  color="#a8611f"
                />
                <span class="mono">{{ project.progress }}%</span>
              </div>
              <div class="row" style="flex-wrap: wrap; gap: 4px 12px; margin-top: 10px">
                <span v-for="spec in project.spec" :key="spec" class="mono project-spec">
                  <span class="faint">[+]</span> {{ spec }}
                </span>
              </div>
              <div class="row" style="flex-wrap: wrap; gap: 5px; margin-top: 8px">
                <span v-for="tag in project.tags" :key="tag" class="soft-tag">{{ tag }}</span>
              </div>
            </div>

            <div class="project-shots">
              <img
                v-for="(image, index) in project.images"
                :key="image + index"
                :src="mediaUrl(image)"
                alt=""
                loading="lazy"
              />
            </div>

            <div class="project-actions">
              <el-button text size="small" @click="openEdit(project)">编辑</el-button>
              <el-button text size="small" @click="remove(project)">删除</el-button>
            </div>
          </article>
        </div>
        <EmptyState v-else text="还没有项目" hint="动手做点什么，然后记在这里。" />
      </template>

      <template v-else>
        <div v-if="upcoming.length" class="panel">
          <div
            v-for="item in upcoming"
            :key="item.id"
            class="upcoming-row"
          >
            <span>
              <span class="table-title">{{ item.title }}</span>
              <span class="table-sub">{{ item.note || "没有备注" }}</span>
            </span>
            <span class="row" style="gap: 12px">
              <span class="mono faint" style="font-size: 10px">排序 {{ item.sortOrder }}</span>
              <el-tag v-if="!item.visible" size="small" type="info" effect="plain">隐藏</el-tag>
              <el-button text size="small" @click="openUpcoming(item)">编辑</el-button>
              <el-button text size="small" @click="removeUpcoming(item)">删除</el-button>
            </span>
          </div>
        </div>
        <EmptyState v-else text="待办清单是空的" hint="把还没开始的想法先放进来。" />
      </template>
    </div>

    <el-drawer v-model="drawerVisible" :title="editingId ? '编辑项目' : '新建项目'" size="560px">
      <el-form label-position="top">
        <el-form-item label="项目名称">
          <el-input v-model="form.title" placeholder="例如：ossia" />
        </el-form-item>
        <div class="field-grid">
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%">
              <el-option v-for="item in PROJECT_STATUS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-input v-model="form.period" placeholder="2026 年 1 月至今" />
          </el-form-item>
        </div>
        <el-form-item :label="`进度 ${progressLabel}`">
          <el-slider v-model="form.progress" :min="0" :max="100" :step="1" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="form.summary"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="这个项目在做什么，为什么做"
          />
        </el-form-item>
        <el-form-item label="技术栈 / 清单">
          <ParagraphList v-model="form.spec" add-text="加一条" placeholder="Rust + CRDT" :min-rows="1" />
        </el-form-item>
        <el-form-item label="标签">
          <TagInput v-model="form.tags" placeholder="web / rust / 桌面 / 图像 / 音频" />
        </el-form-item>
        <el-form-item label="截图">
          <ImageListField v-model="form.images" add-text="添加截图" />
        </el-form-item>
        <div class="field-grid">
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
          <el-form-item label="在站点上发布">
            <el-switch v-model="form.published" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="row" style="justify-content: flex-end">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="upcomingVisible" :title="upcomingEditingId ? '编辑待办' : '添加待办'" width="440px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="项目名称">
          <el-input v-model="upcomingForm.title" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="upcomingForm.note" placeholder="停在哪儿、等什么" />
        </el-form-item>
        <div class="field-grid">
          <el-form-item label="排序">
            <el-input-number v-model="upcomingForm.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
          <el-form-item label="显示">
            <el-switch v-model="upcomingForm.visible" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="upcomingVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUpcoming">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.project-list {
  border-top: 1px solid var(--line);
}

.project-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px 80px;
  gap: 22px;
  padding: 22px 4px;
  border-bottom: 1px solid var(--line-soft);
  align-items: start;
}

.project-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 500;
}

.project-period {
  margin: 6px 0 0;
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--faint);
}

.project-summary {
  margin: 9px 0 0;
  max-width: 42em;
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--muted);
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  max-width: 300px;
}

.project-progress :deep(.el-progress) {
  flex: 1;
}

.project-progress .mono {
  font-size: 10px;
  color: var(--faint);
}

.project-spec {
  font-size: 10px;
  color: var(--muted);
}

.project-shots {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
}

.project-shots img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: var(--paper-2);
  display: block;
}

.project-shots img:first-child:nth-last-child(n + 3) {
  grid-column: span 2;
  aspect-ratio: 16 / 10;
}

.project-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.upcoming-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line-soft);
}

.upcoming-row:last-child {
  border-bottom: 0;
}

@media (max-width: 980px) {
  .project-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .project-shots {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .project-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
