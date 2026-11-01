<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <div class="auth-page" style="grid-template-columns: 1fr">
    <section class="auth-panel" style="min-height: 100vh">
      <div class="auth-card" style="text-align: center">
        <p class="eyebrow">404 / NOT FOUND</p>
        <h1 style="font-size: 64px; line-height: 1; margin: 12px 0 18px">走错房间了</h1>
        <p class="lede">这条走廊上没有门。也许是地址写错了，也许是那一页已经被收进抽屉。</p>
        <el-button type="primary" @click="router.push('/')">回到编辑台</el-button>
        <el-button text @click="router.back()">返回上一页</el-button>
      </div>
    </section>
  </div>
</template>
