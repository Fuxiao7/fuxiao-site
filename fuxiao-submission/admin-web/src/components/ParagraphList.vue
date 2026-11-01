<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    placeholder?: string;
    addText?: string;
    minRows?: number;
  }>(),
  { placeholder: "", addText: "添加一段", minRows: 2 }
);

const emit = defineEmits<{ (event: "update:modelValue", value: string[]): void }>();

const items = computed(() => props.modelValue || []);

function commit(next: string[]) {
  emit("update:modelValue", next);
}

function patch(index: number, value: string) {
  commit(items.value.map((item, i) => (i === index ? value : item)));
}

function add() {
  commit([...items.value, ""]);
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
    <div v-for="(item, index) in items" :key="index" class="paragraph-row">
      <el-input
        :model-value="item"
        type="textarea"
        :autosize="{ minRows, maxRows: 12 }"
        :placeholder="placeholder"
        @update:model-value="(value) => patch(index, value)"
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
