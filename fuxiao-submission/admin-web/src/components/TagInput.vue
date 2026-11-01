<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(
  defineProps<{ modelValue: string[]; placeholder?: string }>(),
  { placeholder: "输入后回车添加" }
);

const emit = defineEmits<{ (event: "update:modelValue", value: string[]): void }>();

const draft = ref("");

function commit(next: string[]) {
  emit("update:modelValue", next);
}

function add() {
  const value = draft.value.trim();
  if (!value) return;
  if (!props.modelValue.includes(value)) {
    commit([...props.modelValue, value]);
  }
  draft.value = "";
}

function remove(tag: string) {
  commit(props.modelValue.filter((item) => item !== tag));
}

function onBackspace() {
  if (draft.value || !props.modelValue.length) return;
  commit(props.modelValue.slice(0, -1));
}
</script>

<template>
  <div class="tag-input">
    <el-tag
      v-for="tag in modelValue"
      :key="tag"
      size="small"
      effect="plain"
      closable
      @close="remove(tag)"
    >
      {{ tag }}
    </el-tag>
    <input
      v-model="draft"
      :placeholder="modelValue.length ? '' : placeholder"
      @keydown.enter.prevent="add"
      @keydown.backspace="onBackspace"
      @blur="add"
    />
  </div>
</template>
