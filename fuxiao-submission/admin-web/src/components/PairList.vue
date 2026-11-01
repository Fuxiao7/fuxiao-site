<script setup lang="ts">
import { computed } from "vue";
import type { SpecItem } from "@/types";

const props = withDefaults(
  defineProps<{
    modelValue: SpecItem[];
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    addText?: string;
  }>(),
  {
    keyPlaceholder: "名称",
    valuePlaceholder: "内容",
    addText: "添加一行",
  }
);

const emit = defineEmits<{ (event: "update:modelValue", value: SpecItem[]): void }>();

const items = computed(() => props.modelValue || []);

function commit(next: SpecItem[]) {
  emit("update:modelValue", next);
}

function patch(index: number, key: "k" | "v", value: string) {
  commit(items.value.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
}

function add() {
  commit([...items.value, { k: "", v: "" }]);
}

function remove(index: number) {
  commit(items.value.filter((_, i) => i !== index));
}

function move(index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= items.value.length) return;
  const next = [...items.value];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  commit(next);
}
</script>

<template>
  <div class="stack-sm">
    <div v-for="(item, index) in items" :key="index" class="pair-row">
      <el-input
        class="pair-key"
        :model-value="item.k"
        :placeholder="keyPlaceholder"
        @update:model-value="(value) => patch(index, 'k', value)"
      />
      <el-input
        :model-value="item.v"
        :placeholder="valuePlaceholder"
        @update:model-value="(value) => patch(index, 'v', value)"
      />
      <div class="list-row-actions">
        <el-button text size="small" :disabled="index === 0" @click="move(index, -1)">
          <el-icon><Top /></el-icon>
        </el-button>
        <el-button text size="small" :disabled="index === items.length - 1" @click="move(index, 1)">
          <el-icon><Bottom /></el-icon>
        </el-button>
        <el-button text size="small" @click="remove(index)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div>
      <el-button size="small" plain @click="add">+ {{ addText }}</el-button>
    </div>
  </div>
</template>
