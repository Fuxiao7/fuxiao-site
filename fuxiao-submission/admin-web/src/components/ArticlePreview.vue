<script setup lang="ts">
import { computed } from "vue";
import { mediaUrl, formatDate } from "@/utils/format";
import type { Article, Block } from "@/types";

const props = defineProps<{ article: Article | null }>();

const blocks = computed<Block[]>(() => props.article?.blocks || []);
</script>

<template>
  <div v-if="article">
    <div class="preview-head">
      <p class="eyebrow">{{ article.categoryName || "未分类" }} · {{ formatDate(article.publishedAt) }}</p>
      <h1 class="preview-title">{{ article.title }}</h1>
      <div class="preview-meta">
        <span>{{ article.author || "拂晓" }}</span>
        <span>/</span>
        <span>{{ article.location || "杭州" }}</span>
        <span>/</span>
        <span>约 {{ article.readingMinutes || 2 }} 分钟 · {{ article.wordCount || 0 }} 字</span>
      </div>
    </div>

    <img
      v-if="article.cover"
      class="preview-cover"
      :src="mediaUrl(article.cover)"
      :alt="article.coverAlt || ''"
    />

    <p v-if="article.deck || article.excerpt" class="prose-lamp" style="font-size: 17px; color: var(--muted)">
      {{ article.deck || article.excerpt }}
    </p>

    <div class="prose-lamp">
      <template v-for="(block, index) in blocks" :key="index">
        <h2 v-if="block.t === 'h2'">{{ block.text }}</h2>
        <blockquote v-else-if="block.t === 'q'">{{ block.text }}</blockquote>
        <pre v-else-if="block.t === 'code'"><code>{{ block.text }}</code></pre>
        <figure v-else-if="block.t === 'img'">
          <img :src="mediaUrl(block.src)" :alt="block.alt || ''" />
          <figcaption v-if="block.cap">{{ block.cap }}</figcaption>
        </figure>
        <p v-else>{{ block.text }}</p>
      </template>
      <p v-if="!blocks.length" class="faint">还没有正文。</p>
    </div>
  </div>
  <p v-else class="empty-note">没有可以预览的内容。</p>
</template>
