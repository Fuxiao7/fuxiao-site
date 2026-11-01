<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ data: { name: string; count: number; color: string }[] }>(),
  { data: () => [] }
);

const total = computed(() => props.data.reduce((sum, item) => sum + item.count, 0));

const gradient = computed(() => {
  if (!total.value) {
    return "conic-gradient(#e7e1d4 0deg 360deg)";
  }
  let acc = 0;
  const stops = props.data.map((item) => {
    const start = (acc / total.value) * 360;
    acc += item.count;
    const end = (acc / total.value) * 360;
    return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
});
</script>

<template>
  <div class="donut-wrap">
    <div class="donut" :style="{ background: gradient }">
      <div class="donut-center">
        <strong>{{ total }}</strong>
        <span>ARTICLES</span>
      </div>
    </div>
    <div class="legend">
      <div v-for="item in data" :key="item.name" class="legend-item">
        <i :style="{ background: item.color }" />
        <span>{{ item.name || "未分类" }}</span>
        <b>{{ item.count }}</b>
      </div>
      <p v-if="!data.length" class="faint" style="font-size: 11px; margin: 0">还没有分类数据</p>
    </div>
  </div>
</template>
