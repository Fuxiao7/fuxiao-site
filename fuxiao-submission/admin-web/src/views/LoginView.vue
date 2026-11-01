<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const blogUrl = (import.meta.env.VITE_BLOG_URL as string | undefined) || "http://localhost:3100";
const isDev = import.meta.env.DEV;

const formRef = ref<FormInstance>();
const form = reactive({ username: "admin", password: "" });
const submitting = ref(false);

const rules: FormRules = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

async function submit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    await auth.login(form.username, form.password);
    ElMessage.success(`欢迎回来，${auth.displayName}`);
    const redirect = (route.query.redirect as string) || "/";
    router.replace(redirect);
  } catch {
    /* 错误提示由请求拦截器统一处理 */
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-art">
      <div class="auth-art-inner">
        <div class="auth-brand">
          <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="27" r="12" fill="none" stroke="#d9a35f" stroke-width="2.2" />
            <path
              d="M32 8v5M32 41v5M13 27h5M46 27h5M19 14l3.5 3.5M42 37l3.5 3.5M45 14l-3.5 3.5M22 37l-3.5 3.5"
              stroke="#d9a35f"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <span>拂晓的投稿系统</span>
          <small>EST. 2017</small>
        </div>

        <div style="margin-top: clamp(70px, 14vh, 150px)">
          <p class="eyebrow" style="color: rgba(242, 238, 228, 0.36)">ALL UNEXTINGUISHED LOVE</p>
          <h1 class="auth-title" style="margin-top: 16px">
            所有未熄的<br />
            <em>热爱</em>，都在<br />
            这里归档。
          </h1>
          <p class="auth-note">
            文章、影集、说说、项目与来信。写作的那一侧归你，排列它们的那一侧归这里。
          </p>
        </div>
      </div>

      <div class="auth-meta">
        <span>FUXIAO / EDITORIAL SYSTEM</span>
        <span>杭州 · UTC+8</span>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <p class="eyebrow">ADMIN / 后台</p>
        <h1>回到编辑台</h1>
        <p class="lede">登录后可以编辑站点的全部内容。板块、排版与样式由博客前端固定，不在本系统中修改。</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" size="large" autocomplete="username" placeholder="admin" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              size="large"
              show-password
              autocomplete="current-password"
              placeholder="请输入密码"
              @keyup.enter="submit"
            />
          </el-form-item>
          <el-button
            type="primary"
            class="auth-submit"
            :loading="submitting"
            native-type="submit"
          >
            进入编辑台
          </el-button>
        </el-form>

        <p v-if="isDev" class="auth-hint">
          初始账号：admin / fuxiao@2026<br />
          第一次登录后，请到「个人资料」里改掉密码。
        </p>

        <div class="auth-alt">
          <RouterLink to="/submit">我是读者，去投稿 →</RouterLink>
          <a :href="blogUrl" target="_blank" rel="noreferrer">回到博客 ↗</a>
        </div>
      </div>
    </section>
  </div>
</template>
