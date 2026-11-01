<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    flush?: boolean;
    pad?: boolean;
  }>(),
  { flush: false, pad: false }
);
</script>

<template>
  <section class="panel">
    <div v-if="title || $slots.extra || $slots.head" class="panel-head">
      <div>
        <h2 v-if="title" class="panel-title">{{ title }}</h2>
        <p v-if="subtitle" class="panel-sub">{{ subtitle }}</p>
        <slot name="head" />
      </div>
      <div v-if="$slots.extra" class="row"><slot name="extra" /></div>
    </div>
    <div class="panel-body" :class="{ flush, 'pad-lg': pad }">
      <slot />
    </div>
  </section>
</template>
