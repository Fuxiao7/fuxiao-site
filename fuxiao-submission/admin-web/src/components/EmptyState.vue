<script setup lang="ts">
withDefaults(defineProps<{ text?: string; hint?: string }>(), {
  text: "这里还什么都没有",
});
</script>

<template>
  <div class="empty-note">
    <p style="margin: 0 0 4px">{{ text }}</p>
    <p v-if="hint" style="margin: 0; opacity: 0.72">{{ hint }}</p>
  </div>
</template>
