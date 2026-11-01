<script setup lang="ts">
import { computed } from "vue";
import { monthLabel } from "@/utils/format";

const props = withDefaults(
  defineProps<{ data: { month: string; count: number }[] }>(),
  { data: () => [] }
);

const max = computed(() => Math.max(1, ...props.data.map((item) => item.count)));
const height = (count: number) => `${Math.max(3, Math.round((count / max.value) * 100))}%`;
</script>

<template>
  <div class="chart-bars">
    <div
      v-for="item in data"
      :key="item.month"
      class="chart-bar"
      :title="`${item.month}：${item.count} 篇`"
    >
      <span class="num">{{ item.count }}</span>
      <div class="bar" :style="{ height: height(item.count) }" />
      <span class="month">{{ monthLabel(item.month) }}</span>
    </div>
  </div>
</template>
