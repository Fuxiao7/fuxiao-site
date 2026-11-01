<script setup lang="ts">
import { computed } from "vue";
import { mediaUrl } from "@/utils/format";
import type { Shot } from "@/types";
import ImagePicker from "./ImagePicker.vue";

const props = withDefaults(
  defineProps<{
    modelValue: Shot[];
    addText?: string;
    altPlaceholder?: string;
    capPlaceholder?: string;
  }>(),
  {
    addText: "添加一张",
    altPlaceholder: "这张照片里有什么（alt）",
    capPlaceholder: "图注，例如「天台 · 18:40」",
  }
);

const emit = defineEmits<{ (event: "update:modelValue", value: Shot[]): void }>();

const items = computed(() => props.modelValue || []);

function commit(next: Shot[]) {
  emit("update:modelValue", next);
}

function patch(index: number, value: Partial<Shot>) {
  commit(items.value.map((item, i) => (i === index ? { ...item, ...value } : item)));
}

function add() {
  commit([...items.value, { img: "", alt: "", cap: "" }]);
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
    <div v-for="(item, index) in items" :key="index" class="shot-row">
      <ImagePicker
        :model-value="item.img"
        title="选择照片"
        @update:model-value="(value) => patch(index, { img: value })"
      >
        <img v-if="item.img" class="thumb" :src="mediaUrl(item.img)" :alt="item.alt || ''" />
        <div v-else class="thumb-empty">选择照片</div>
      </ImagePicker>

      <div class="stack-sm">
        <el-input
          :model-value="item.alt || ''"
          :placeholder="altPlaceholder"
          @update:model-value="(value) => patch(index, { alt: value })"
        />
        <el-input
          :model-value="item.cap || ''"
          :placeholder="capPlaceholder"
          @update:model-value="(value) => patch(index, { cap: value })"
        />
      </div>

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
