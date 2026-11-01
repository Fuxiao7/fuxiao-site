<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    status: string;
    kind?: "article" | "submission" | "visible";
  }>(),
  { kind: "article" }
);

type TagType = "primary" | "success" | "info" | "warning" | "danger";

const meta = computed<{ label: string; type: TagType }>(() => {
  if (props.kind === "submission") {
    switch (props.status) {
      case "pending":
        return { label: "待审", type: "warning" };
      case "accepted":
        return { label: "已采纳", type: "success" };
      case "rejected":
        return { label: "已退回", type: "info" };
      default:
        return { label: props.status, type: "info" };
    }
  }
  if (props.kind === "visible") {
    return props.status === "true"
      ? { label: "显示中", type: "success" }
      : { label: "已隐藏", type: "info" };
  }
  switch (props.status) {
    case "published":
      return { label: "已发布", type: "success" };
    case "offline":
      return { label: "已下架", type: "info" };
    case "draft":
      return { label: "草稿", type: "warning" };
    default:
      return { label: props.status, type: "info" };
  }
});
</script>

<template>
  <el-tag :type="meta.type" size="small" effect="plain" round>{{ meta.label }}</el-tag>
</template>
