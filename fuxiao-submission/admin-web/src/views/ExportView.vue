<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  downloadExport,
  getExportPreview,
  getPublishStatus,
  publishSite,
} from "@/api/site";
import type { ExportPreview, PublishState, PublishStatus } from "@/types";
import { copyText } from "@/utils/clipboard";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import StatCard from "@/components/StatCard.vue";

const loading = ref(false);
const downloading = ref<"" | "content" | "package">("");
const preview = ref<ExportPreview | null>(null);

const publish = ref<PublishStatus | null>(null);
const publishLoading = ref(false);
const statusLoading = ref(false);
let pollTimer: number | undefined;

const summary = computed(() => {
  const content = (preview.value?.content || {}) as Record<string, unknown>;
  const size = (value: unknown) => (Array.isArray(value) ? value.length : 0);
  return {
    posts: size(content.posts),
    albums: size(content.albums),
    moments: size(content.moments),
    archive: size(content.archive),
  };
});

const jsonText = computed(() =>
  preview.value ? JSON.stringify(preview.value.content, null, 2) : ""
);

const publishEnabled = computed(() => publish.value?.enabled === true);
const publishRunning = computed(() => publish.value?.state === "running");
const publishState = computed<PublishState>(() => publish.value?.state || "idle");

const stateLabels: Record<PublishState, string> = {
  idle: "尚未发布",
  running: "正在构建",
  success: "已发布",
  failed: "发布失败",
};

const publishLabel = computed(() => stateLabels[publishState.value]);

const publishHint = computed(() => {
  if (!publish.value) return "正在读取发布状态…";
  if (!publish.value.enabled) {
    return "当前后端没有启用线上发布（PUBLISH_ENABLED=false）。本地开发时这是正常的，线上环境会启用。";
  }
  if (publishRunning.value) {
    return "正在导出内容、构建 Next 并重启博客，通常需要 30–60 秒。";
  }
  return publish.value.message || "点击发布，把当前内容推到线上。";
});

async function load() {
  loading.value = true;
  try {
    preview.value = await getExportPreview();
  } finally {
    loading.value = false;
  }
}

async function loadStatus(quiet = true) {
  if (!quiet) statusLoading.value = true;
  try {
    publish.value = await getPublishStatus();
    if (publishRunning.value) {
      startPolling();
    } else {
      stopPolling();
    }
  } catch {
    if (!quiet) ElMessage.error("没有读到发布状态");
  } finally {
    statusLoading.value = false;
  }
}

function stopPolling() {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = undefined;
  }
}

function startPolling() {
  if (pollTimer) return;
  pollTimer = window.setInterval(async () => {
    try {
      const next = await getPublishStatus();
      publish.value = next;
      if (next.state !== "running") {
        stopPolling();
        if (next.state === "success") {
          ElMessage.success("发布完成，线上已更新");
        } else if (next.state === "failed") {
          ElMessage.error(next.message || "发布失败");
        }
      }
    } catch {
      // 后端重启或网络抖动时继续轮询
    }
  }, 2000);
}

async function startPublish() {
  try {
    await ElMessageBox.confirm(
      "服务器会重新构建博客并重启站点，通常需要 30–60 秒。构建失败会恢复旧内容，不会影响线上。确定发布吗？",
      "发布到线上",
      { confirmButtonText: "开始发布", cancelButtonText: "再等等", type: "warning" }
    );
  } catch {
    return;
  }
  publishLoading.value = true;
  try {
    publish.value = await publishSite();
    ElMessage.success("已开始构建，完成后会在这里提示");
    startPolling();
  } finally {
    publishLoading.value = false;
  }
}

async function download(kind: "content" | "package") {
  downloading.value = kind;
  try {
    await downloadExport(kind);
    ElMessage.success(kind === "content" ? "content.json 已开始下载" : "导出包已开始下载");
  } finally {
    downloading.value = "";
  }
}

async function copyJson() {
  if (!jsonText.value) return;
  const ok = await copyText(jsonText.value);
  ElMessage[ok ? "success" : "warning"](ok ? "已复制完整 JSON" : "浏览器不允许自动复制");
}

onMounted(async () => {
  await load();
  await loadStatus(false);
});

onUnmounted(stopPolling);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="SYSTEM / PUBLISH"
      title="导出与发布"
      description="线上部署后，点「发布到线上」即可把当前内容推到站点；手动导出保留为备用方案。"
    >
      <template #actions>
        <el-button :loading="statusLoading" @click="loadStatus(false)">刷新状态</el-button>
        <el-button :loading="loading" @click="load">刷新预览</el-button>
      </template>
    </PageHeader>

    <div class="notice lamp" style="margin-bottom: 18px">
      <el-icon style="margin-top: 2px"><InfoFilled /></el-icon>
      <span>
        发布会在服务器上导出内容、构建 Next.js 并重启博客，通常 30–60 秒。
        构建失败会自动恢复旧内容，线上继续跑旧版本；板块、排版与样式不会随发布改变。
      </span>
    </div>

    <div v-loading="loading">
      <Panel title="发布到线上" subtitle="内容 → 构建 → 重启，一步完成">
        <div class="publish-row">
          <div>
            <p class="publish-state">
              <span class="publish-dot" :class="publishState" />
              {{ publishLabel }}
              <span v-if="publish?.finishedAt" class="mono faint publish-time">
                {{ publish.finishedAt }}
              </span>
            </p>
            <p class="field-hint" style="margin-top: 4px">{{ publishHint }}</p>
          </div>
          <el-button
            type="primary"
            size="large"
            :loading="publishLoading || publishRunning"
            :disabled="!publishEnabled || publishRunning"
            @click="startPublish"
          >
            {{ publishRunning ? "正在构建…" : "发布到线上" }}
          </el-button>
        </div>

        <el-alert
          v-if="!publishEnabled && publish"
          type="info"
          :closable="false"
          show-icon
          title="线上发布未启用"
          description="在服务器的后端环境变量里设置 PUBLISH_ENABLED=true、BLOG_DIR 与重启命令后，这里会出现可用的发布按钮。"
          style="margin-top: 14px"
        />

        <pre v-if="publish?.log" class="publish-log">{{ publish.log }}</pre>
      </Panel>

      <div class="grid grid-4" style="margin-top: 18px">
        <StatCard label="文章" icon="Document" :value="summary.posts" unit="篇" note="已发布，含正文" />
        <StatCard label="影集" icon="PictureFilled" :value="summary.albums" unit="册" note="含图组与文字" />
        <StatCard label="说说" icon="ChatLineRound" :value="summary.moments" unit="条" note="已发布" />
        <StatCard label="归档" icon="Files" :value="summary.archive" unit="条" note="按年份导出" />
      </div>

      <div class="dash-row dash-row-even">
        <Panel title="content.json" subtitle="手动导出（备用）">
          <p class="panel-sub" style="line-height: 1.9; margin: 0 0 14px">
            文章列表、影集、说说、项目、友链、归档、照片与关于页简介，结构与博客
            <code class="mono">lib/content.json</code> 一致。
          </p>
          <div class="row" style="flex-wrap: wrap">
            <el-button :loading="downloading === 'content'" @click="download('content')">
              下载 content.json
            </el-button>
          </div>
        </Panel>

        <Panel title="完整导出包" subtitle="手动导出（备用）">
          <p class="panel-sub" style="line-height: 1.9; margin: 0 0 14px">
            压缩包里除了 content.json，还有每篇文章的正文、可覆盖的
            <code class="mono">lib/bodies.js</code>、图片清单与接入说明。
          </p>
          <el-button :loading="downloading === 'package'" @click="download('package')">
            下载完整包（zip）
          </el-button>
        </Panel>
      </div>

      <Panel title="如果手动发布" subtitle="服务器不可用时的兜底">
        <ol class="export-steps">
          <li>
            解压后，用 <code class="mono">content.json</code> 覆盖博客的
            <code class="mono">lib/content.json</code>。
          </li>
          <li>
            把 <code class="mono">article-bodies.json</code> 放进
            <code class="mono">lib/</code>，再用包里的
            <code class="mono">bodies.js</code> 覆盖 <code class="mono">lib/bodies.js</code>。
          </li>
          <li>
            打开 <code class="mono">media-manifest.json</code>，把后台上传的图片复制到
            <code class="mono">public/media/</code>。
          </li>
          <li>
            在博客目录执行 <code class="mono">npm run build</code>，然后重启博客服务。
          </li>
        </ol>
      </Panel>

      <Panel title="content.json 预览" subtitle="发布前的最后一眼">
        <template #extra>
          <el-button size="small" text @click="copyJson">复制 JSON</el-button>
        </template>
        <pre class="export-json">{{ jsonText || "还没有可预览的内容。" }}</pre>
      </Panel>
    </div>
  </div>
</template>

<style scoped>
.publish-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.publish-state {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  color: var(--ink);
}

.publish-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--faint);
  flex: none;
}

.publish-dot.running {
  background: var(--lamp);
  animation: publish-pulse 1.4s ease-in-out infinite;
}

.publish-dot.success {
  background: var(--ok);
}

.publish-dot.failed {
  background: var(--danger);
}

.publish-time {
  margin-left: 4px;
  font-size: 9.5px;
  letter-spacing: 0.03em;
}

.publish-log {
  margin: 16px 0 0;
  max-height: 300px;
  overflow: auto;
  padding: 14px 16px;
  border: 1px solid var(--line-soft);
  border-radius: 3px;
  background: #17191d;
  color: #d8d2c4;
  font-family: var(--font-mono);
  font-size: 10.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

@keyframes publish-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.86);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.export-steps {
  margin: 0;
  padding-left: 20px;
  font-size: 12.5px;
  line-height: 2.1;
  color: var(--ink-2);
}

.export-steps li {
  padding-left: 4px;
}

.export-steps code {
  padding: 1px 5px;
  border: 1px solid var(--line-soft);
  border-radius: 2px;
  background: var(--surface-2);
  font-size: 10.5px;
  color: var(--lamp);
}

.export-json {
  margin: 0;
  max-height: 420px;
  overflow: auto;
  padding: 16px 18px;
  border: 1px solid var(--line-soft);
  border-radius: 3px;
  background: #17191d;
  color: #d8d2c4;
  font-family: var(--font-mono);
  font-size: 10.5px;
  line-height: 1.7;
}
</style>
