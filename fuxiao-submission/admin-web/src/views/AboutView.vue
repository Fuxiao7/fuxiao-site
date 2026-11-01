<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { getAbout, saveAbout } from "@/api/site";
import type { AboutProfile } from "@/types";
import { mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import ParagraphList from "@/components/ParagraphList.vue";
import ImagePicker from "@/components/ImagePicker.vue";

const loading = ref(false);
const saving = ref(false);

function emptyProfile(): AboutProfile {
  return {
    displayName: "",
    subtitle: "",
    meta: "",
    portrait: "",
    portraitAlt: "",
    portraitCaption: "",
    bio: [],
    cols: [],
    credits: [],
    email: "",
    github: "",
    twitter: "",
  };
}

const form = reactive<AboutProfile>(emptyProfile());

async function load() {
  loading.value = true;
  try {
    const data = await getAbout();
    Object.assign(form, emptyProfile(), data, {
      bio: data.bio || [],
      cols: (data.cols || []).map((col) => ({ title: col.title, items: [...col.items] })),
      credits: data.credits || [],
    });
  } finally {
    loading.value = false;
  }
}

function addColumn() {
  form.cols.push({ title: "新栏目", items: [""] });
}

function removeColumn(index: number) {
  form.cols.splice(index, 1);
}

async function save() {
  saving.value = true;
  try {
    const saved = await saveAbout({
      ...form,
      bio: form.bio.filter((item) => item.trim()),
      cols: form.cols
        .map((col) => ({ title: col.title, items: col.items.filter((item) => item.trim()) }))
        .filter((col) => col.title || col.items.length),
      credits: form.credits.filter((item) => item.trim()),
    });
    Object.assign(form, emptyProfile(), saved);
    ElMessage.success("关于页已保存");
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / ABOUT"
      title="关于页"
      description="自我介绍、三栏清单、图片来源与联系方式。这一页只改文字和图片，不改版式。"
    >
      <template #actions>
        <el-button type="primary" :loading="saving" @click="save">保存关于页</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="about-layout">
      <div class="stack">
        <Panel title="基本资料">
          <div class="field-grid">
            <div>
              <span class="field-label">名字</span>
              <el-input v-model="form.displayName" placeholder="拂晓" />
            </div>
            <div>
              <span class="field-label">一句话身份</span>
              <el-input v-model="form.subtitle" placeholder="前端工程师 · 杭州" />
            </div>
          </div>
          <div style="margin-top: 12px">
            <span class="field-label">页头统计</span>
            <el-input v-model="form.meta" placeholder="杭州 · 一个人 · 一周一篇" />
          </div>
        </Panel>

        <Panel title="简介" subtitle="第一段会以大字显示，其余按正文排">
          <ParagraphList v-model="form.bio" add-text="加一段" placeholder="写一段自我介绍" :min-rows="3" />
        </Panel>

        <Panel title="三栏清单" subtitle="手上的东西 / 时间线 / 联系">
          <div class="stack">
            <div v-for="(col, index) in form.cols" :key="index" class="col-editor">
              <div class="row-between" style="margin-bottom: 8px">
                <el-input v-model="col.title" placeholder="栏目名" style="max-width: 220px" />
                <el-button text size="small" @click="removeColumn(index)">删除这一栏</el-button>
              </div>
              <ParagraphList v-model="col.items" add-text="加一条" :min-rows="1" placeholder="一条条目" />
            </div>
            <div>
              <el-button size="small" plain @click="addColumn">+ 添加一栏</el-button>
            </div>
          </div>
        </Panel>

        <Panel title="图片来源与说明" subtitle="显示在关于页最下方">
          <ParagraphList v-model="form.credits" add-text="加一段" placeholder="图片来源、字体、技术说明" :min-rows="2" />
        </Panel>
      </div>

      <aside class="editor-aside" style="position: static">
        <Panel title="人像">
          <ImagePicker v-model="form.portrait" title="选择关于页人像">
            <div class="cover-drop" style="aspect-ratio: 4 / 5">
              <img v-if="form.portrait" :src="mediaUrl(form.portrait)" :alt="form.portraitAlt || ''" />
              <div v-else class="cover-empty">
                <el-icon :size="18"><Picture /></el-icon>
                <span>点击选择人像</span>
              </div>
              <div class="cover-hover">更换人像</div>
            </div>
          </ImagePicker>
          <div style="margin-top: 10px">
            <span class="field-label">图片说明 alt</span>
            <el-input v-model="form.portraitAlt" />
          </div>
          <div style="margin-top: 10px">
            <span class="field-label">图注</span>
            <el-input v-model="form.portraitCaption" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
          </div>
        </Panel>

        <Panel title="联系方式">
          <div class="stack-sm">
            <div>
              <span class="field-label">邮箱</span>
              <el-input v-model="form.email" />
            </div>
            <div>
              <span class="field-label">GitHub</span>
              <el-input v-model="form.github" placeholder="github.com/dengxia" />
            </div>
            <div>
              <span class="field-label">社交账号</span>
              <el-input v-model="form.twitter" placeholder="@dengxia_moe" />
            </div>
          </div>
        </Panel>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.about-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 318px;
  gap: 20px;
  align-items: start;
}

.col-editor {
  padding: 12px 14px;
  border: 1px solid var(--line-soft);
  border-radius: 3px;
  background: #fffdf8;
}

@media (max-width: 1100px) {
  .about-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
