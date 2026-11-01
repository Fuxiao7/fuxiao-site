<script setup lang="ts">
import { computed } from "vue";
import { mediaUrl } from "@/utils/format";
import ImagePicker from "./ImagePicker.vue";

const props = withDefaults(
  defineProps<{ modelValue: string[]; addText?: string; hint?: string }>(),
  { addText: "添加图片", hint: "" }
);

const emit = defineEmits<{ (event: "update:modelValue", value: string[]): void }>();

const items = computed(() => props.modelValue || []);

function commit(next: string[]) {
  emit("update:modelValue", next);
}

function add(path: string) {
  if (!path) return;
  commit([...items.value, path]);
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
  <div>
    <div v-if="items.length" class="image-list">
      <div v-for="(item, index) in items" :key="item + index" class="image-list-item">
        <img :src="mediaUrl(item)" alt="" />
        <div class="image-list-ops">
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
    </div>
    <ImagePicker :model-value="''" title="添加图片" @update:model-value="add">
      <div class="image-add">+ {{ addText }}</div>
    </ImagePicker>
    <p v-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>
