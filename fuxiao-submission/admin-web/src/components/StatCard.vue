<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    note?: string;
    unit?: string;
    icon?: string;
  }>(),
  { unit: "" }
);
</script>

<template>
  <div class="panel stat">
    <p class="stat-label">
      <el-icon v-if="icon" :size="12"><component :is="icon" /></el-icon>
      {{ label }}
    </p>
    <p class="stat-value">
      {{ value }}<small v-if="unit">{{ unit }}</small>
    </p>
    <p v-if="note" class="stat-note">{{ note }}</p>
  </div>
</template>
