<script setup lang="ts">
import { onMounted, ref } from "vue";
import { listLogs } from "@/api/system";
import type { OperationLog } from "@/types";
import { formatDateTime } from "@/utils/format";
import { MODULES } from "@/utils/constants";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";

const loading = ref(false);
const logs = ref<OperationLog[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(20);
const module = ref("");
const keyword = ref("");

const moduleLabels: Record<string, string> = Object.fromEntries(
  MODULES.map((item) => [item.value, item.label])
);

async function load() {
  loading.value = true;
  try {
    const result = await listLogs({
      module: module.value || undefined,
      keyword: keyword.value.trim() || undefined,
      page: page.value,
      size: size.value,
    });
    logs.value = result.list;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function search() {
  page.value = 1;
  load();
}

function changePage(next: number) {
  page.value = next;
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="SYSTEM / AUDIT"
      title="操作日志"
      description="谁在什么时候动了什么。日志只读，保留最近的所有记录。"
      :count="`${total} 条`"
    />

    <div class="filter-bar">
      <el-select v-model="module" placeholder="全部模块" clearable style="width: 150px" @change="search">
        <el-option v-for="item in MODULES" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="搜动作或对象"
        clearable
        style="width: 220px"
        @keyup.enter="search"
        @clear="search"
      />
      <el-button @click="search">筛选</el-button>
      <span class="mono faint" style="margin-left: auto; font-size: 10px">{{ total }} 条</span>
    </div>

    <Panel flush>
      <el-table v-loading="loading" :data="logs" row-key="id">
        <el-table-column label="时间" width="150">
          <template #default="{ row }">
            <span class="mono" style="font-size: 10px">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="110">
          <template #default="{ row }">
            <span class="mono" style="font-size: 11px">{{ row.username || "system" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="110">
          <template #default="{ row }">
            <span class="soft-tag">{{ moduleLabels[row.module] || row.module || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="动作" min-width="180">
          <template #default="{ row }">
            <span style="font-size: 12.5px">{{ row.action }}</span>
            <span v-if="row.target" class="muted" style="font-size: 12px"> · {{ row.target }}</span>
          </template>
        </el-table-column>
        <el-table-column label="细节" min-width="220">
          <template #default="{ row }">
            <span class="faint" style="font-size: 11.5px">{{ row.detail || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="IP" width="120">
          <template #default="{ row }">
            <span class="mono faint" style="font-size: 9.5px">{{ row.ip || "—" }}</span>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState text="还没有日志" hint="登录、编辑、发布都会记在这里。" />
        </template>
      </el-table>
    </Panel>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="page"
        :page-size="size"
        @current-change="changePage"
      />
    </div>
  </div>
</template>
