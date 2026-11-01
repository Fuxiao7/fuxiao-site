<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
    count?: string | number;
    meta?: string;
  }>(),
  { eyebrow: "FUXIAO / EDITORIAL" }
);
</script>

<template>
  <header class="page-head">
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-title">
        {{ title }}
        <span v-if="count !== undefined && count !== ''" class="count">{{ count }}</span>
      </h1>
      <p v-if="description" class="page-desc">{{ description }}</p>
      <p v-if="meta" class="eyebrow mt-10">{{ meta }}</p>
    </div>
    <div v-if="$slots.actions" class="head-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
