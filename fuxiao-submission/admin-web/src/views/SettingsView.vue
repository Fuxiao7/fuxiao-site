<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { listNowItems, listSettings, saveNowItems, saveSettings } from "@/api/site";
import type { NowItem, SiteSetting } from "@/types";
import { SETTING_GROUPS } from "@/utils/constants";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";

const loading = ref(false);
const saving = ref(false);
const nowSaving = ref(false);

const settings = ref<SiteSetting[]>([]);
const drafts = reactive<Record<string, string>>({});
const keyword = ref("");
const activeGroup = ref("site");

const nowItems = ref<NowItem[]>([]);

const groups = computed(() =>
  SETTING_GROUPS.filter((group) => settings.value.some((item) => item.groupKey === group.key))
);

const activeGroupLabel = computed(
  () => SETTING_GROUPS.find((group) => group.key === activeGroup.value)?.label || "站点"
);

const filteredSettings = computed(() => {
  const key = keyword.value.trim().toLowerCase();
  if (key) {
    return settings.value.filter(
      (item) =>
        item.label.toLowerCase().includes(key) ||
        item.settingKey.toLowerCase().includes(key) ||
        (item.value || "").toLowerCase().includes(key)
    );
  }
  return settings.value.filter((item) => item.groupKey === activeGroup.value);
});

const dirtyItems = computed(() =>
  settings.value
    .filter((item) => (drafts[item.settingKey] ?? "") !== (item.value ?? ""))
    .map((item) => ({ settingKey: item.settingKey, value: drafts[item.settingKey] ?? "" }))
);

async function load() {
  loading.value = true;
  try {
    const [settingList, now] = await Promise.all([listSettings(), listNowItems()]);
    settings.value = settingList;
    nowItems.value = now.map((item) => ({ ...item }));
    Object.keys(drafts).forEach((key) => delete drafts[key]);
    settingList.forEach((item) => {
      drafts[item.settingKey] = item.value ?? "";
    });
    if (!settingList.some((item) => item.groupKey === activeGroup.value)) {
      activeGroup.value = settingList[0]?.groupKey || "site";
    }
  } finally {
    loading.value = false;
  }
}

function selectGroup(key: string) {
  activeGroup.value = key;
  keyword.value = "";
}

async function save() {
  if (!dirtyItems.value.length) {
    ElMessage.info("没有改动");
    return;
  }
  saving.value = true;
  try {
    const count = await saveSettings(dirtyItems.value);
    ElMessage.success(`已保存 ${count} 项文案`);
    await load();
  } finally {
    saving.value = false;
  }
}

function addNow() {
  nowItems.value.push({ label: "", value: "", note: "" });
}

function removeNow(index: number) {
  nowItems.value.splice(index, 1);
}

async function saveNow() {
  nowSaving.value = true;
  try {
    nowItems.value = await saveNowItems(nowItems.value);
    ElMessage.success("「此刻」已保存");
  } finally {
    nowSaving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="SYSTEM / COPY"
      title="站点文案"
      description="改的是文字，不是版式。板块、排版与样式由博客前端固定。"
    >
      <template #actions>
        <el-input
          v-model="keyword"
          placeholder="搜文案内容或 key"
          clearable
          style="width: 230px"
        />
        <el-button type="primary" :loading="saving" :disabled="!dirtyItems.length" @click="save">
          保存<template v-if="dirtyItems.length">（{{ dirtyItems.length }}）</template>
        </el-button>
      </template>
    </PageHeader>

    <div class="notice lamp" style="margin-bottom: 16px">
      <el-icon style="margin-top: 2px"><InfoFilled /></el-icon>
      <span>
        这里能改首页标题、各页引言、页脚寄语等内容；不能改导航板块、页面结构与颜色字体。
        文案导出后随 <code class="mono">content.json</code> 一起进入博客。
      </span>
    </div>

    <div v-loading="loading" class="settings-layout">
      <nav class="settings-nav">
        <button
          v-for="group in groups"
          :key="group.key"
          type="button"
          :class="{ 'is-active': activeGroup === group.key && !keyword }"
          @click="selectGroup(group.key)"
        >
          {{ group.label }}
        </button>
      </nav>

      <div class="stack">
        <Panel :title="keyword ? '搜索结果' : activeGroupLabel" :subtitle="`${filteredSettings.length} 项`">
          <div v-for="setting in filteredSettings" :key="setting.id" class="setting-row">
            <div class="setting-label">
              {{ setting.label }}
              <div class="setting-key">{{ setting.settingKey }}</div>
            </div>
            <div>
              <el-input
                v-if="setting.inputType === 'textarea'"
                v-model="drafts[setting.settingKey]"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 6 }"
              />
              <el-input v-else v-model="drafts[setting.settingKey]" />
            </div>
          </div>
          <EmptyState v-if="!filteredSettings.length" text="没有找到匹配的文案" hint="换一个关键词试试。" />
        </Panel>

        <Panel
          v-if="!keyword"
          title="首页「此刻」"
          subtitle="首屏下面的四格：在写、在读、在拍、在学"
        >
          <template #extra>
            <el-button size="small" :loading="nowSaving" @click="saveNow">保存此刻</el-button>
          </template>

          <div class="now-head">
            <span>标签</span>
            <span>内容</span>
            <span>备注</span>
            <span />
          </div>
          <div v-for="(item, index) in nowItems" :key="index" class="now-row">
            <el-input v-model="item.label" placeholder="在写" />
            <el-input v-model="item.value" placeholder="Node 里的流" />
            <el-input v-model="item.note" placeholder="第 47 篇" />
            <el-button text size="small" @click="removeNow(index)">删除</el-button>
          </div>
          <div style="margin-top: 10px">
            <el-button size="small" plain @click="addNow">+ 加一格</el-button>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.now-head,
.now-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1fr) 52px;
  gap: 8px;
  align-items: center;
}

.now-head {
  padding: 0 2px 7px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  color: var(--faint);
}

.now-row {
  margin-bottom: 8px;
}
</style>
