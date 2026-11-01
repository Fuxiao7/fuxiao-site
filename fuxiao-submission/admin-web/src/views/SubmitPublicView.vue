<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { getPublicSite, submitPublic } from "@/api/submissions";
import type { SitePublic } from "@/types";

const blogUrl = (import.meta.env.VITE_BLOG_URL as string | undefined) || "http://localhost:3100";
const year = new Date().getFullYear();

const site = ref<SitePublic | null>(null);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const done = ref(false);
const receipt = ref<{ id: number; status: string; message: string } | null>(null);

function emptyForm() {
  return {
    title: "",
    authorName: "",
    authorEmail: "",
    authorSite: "",
    categoryId: null as number | null,
    excerpt: "",
    content: "",
    website: "",
  };
}

const form = reactive(emptyForm());

const rules: FormRules = {
  title: [
    { required: true, message: "请写一个标题", trigger: "blur" },
    { max: 200, message: "标题最多 200 字", trigger: "blur" },
  ],
  authorName: [{ required: true, message: "请写一个署名", trigger: "blur" }],
  content: [{ required: true, message: "正文还没有写", trigger: "blur" }],
  authorEmail: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) return callback();
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return callback();
        return callback(new Error("邮箱格式好像不对"));
      },
      trigger: "blur",
    },
  ],
};

async function loadSite() {
  try {
    site.value = await getPublicSite();
  } catch {
    site.value = null;
  }
}

async function submit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const result = await submitPublic({
      ...form,
      categoryId: form.categoryId || null,
    });
    receipt.value = result;
    done.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    ElMessage.error("没有寄出去，稍后再试一次");
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  Object.assign(form, emptyForm());
  receipt.value = null;
  done.value = false;
  formRef.value?.clearValidate();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openBlog() {
  window.open(blogUrl, "_blank");
}

onMounted(loadSite);
</script>

<template>
  <div class="public-page">
    <header class="public-top">
      <RouterLink to="/submit" class="public-brand">
        <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="27" r="12" fill="none" stroke="#a8611f" stroke-width="2.2" />
          <path
            d="M32 8v5M32 41v5M13 27h5M46 27h5M19 14l3.5 3.5M42 37l3.5 3.5M45 14l-3.5 3.5M22 37l-3.5 3.5"
            stroke="#a8611f"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <span>{{ site?.copy?.["site.name"] || "拂晓和朋友们" }}</span>
        <span class="mono" style="font-size: 9px; letter-spacing: 0.18em; color: var(--faint)">投稿</span>
      </RouterLink>
      <div class="row" style="gap: 16px">
        <a :href="blogUrl" class="mono" style="font-size: 10.5px; color: var(--faint)">回博客 ↗</a>
        <RouterLink to="/login" class="mono" style="font-size: 10.5px; color: var(--faint)">后台入口 →</RouterLink>
      </div>
    </header>

    <section class="public-hero">
      <p class="eyebrow">CONTRIBUTION / 投稿</p>
      <h1>把你的文章，<br />放进这间屋子。</h1>
      <p>
        这里收技术、读书、生活和摄影的文字。不必是成品，不必有结论，先把它写完就好。
        我会在两周内回信，告诉你它会不会被排进某一期。
      </p>
    </section>

    <div class="public-body">
      <div v-if="done && receipt">
        <div class="panel success-card">
          <div class="success-mark">
            <el-icon :size="24"><Check /></el-icon>
          </div>
          <h2 style="font-family: var(--font-serif); font-weight: 400; margin: 18px 0 8px">
            收到了，谢谢你。
          </h2>
          <p style="margin: 0 auto; max-width: 26em; font-size: 13px; line-height: 1.9; color: var(--muted)">
            {{ receipt.message }}
          </p>
          <p class="mono" style="margin-top: 12px; font-size: 10px; color: var(--faint)">
            编号 #{{ receipt.id }} · {{ receipt.status === "pending" ? "待审" : receipt.status }}
          </p>
          <div class="row" style="justify-content: center; margin-top: 22px">
            <el-button @click="resetForm">再写一篇</el-button>
            <el-button type="primary" @click="openBlog">去看看博客</el-button>
          </div>
        </div>
      </div>

      <div v-else class="panel">
        <div class="panel-head" style="padding-bottom: 6px">
          <div>
            <h2 class="panel-title">投稿表单</h2>
            <p class="panel-sub">带 * 的是必填项。正文支持一点点 Markdown。</p>
          </div>
        </div>
        <div class="panel-body" style="padding: 4px 22px 22px">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" size="large" placeholder="一句话说清这篇写的是什么" />
            </el-form-item>

            <div class="field-grid">
              <el-form-item label="署名" prop="authorName">
                <el-input v-model="form.authorName" placeholder="发表时用的名字" />
              </el-form-item>
              <el-form-item label="邮箱" prop="authorEmail">
                <el-input v-model="form.authorEmail" placeholder="用来收回复，不会公开" />
              </el-form-item>
            </div>

            <div class="field-grid">
              <el-form-item label="你的站点">
                <el-input v-model="form.authorSite" placeholder="可以留空" />
              </el-form-item>
              <el-form-item label="归入分类">
                <el-select v-model="form.categoryId" clearable placeholder="由编辑决定也可以" style="width: 100%">
                  <el-option
                    v-for="category in site?.categories || []"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="摘要">
              <el-input
                v-model="form.excerpt"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                placeholder="两三句，告诉读者这篇在讲什么"
              />
            </el-form-item>

            <el-form-item label="正文" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="16"
                class="mono"
                placeholder="把正文贴在这里。空行分段；## 小标题；> 引用；``` 包住代码；![说明](图片地址) 插图。"
              />
            </el-form-item>

            <div v-show="false">
              <label>
                网站
                <input v-model="form.website" tabindex="-1" autocomplete="off" />
              </label>
            </div>

            <div class="row-between" style="margin-top: 8px; flex-wrap: wrap; gap: 12px">
              <p class="field-hint" style="margin: 0; max-width: 34em">
                投稿即表示这篇是你原创的、可以在这里发表。图片请先给外链，采用之后我再帮你搬到站内。
              </p>
              <el-button type="primary" size="large" :loading="submitting" @click="submit">
                寄出这封信
              </el-button>
            </div>
          </el-form>
        </div>
      </div>

      <aside class="public-side">
        <div class="panel">
          <div class="panel-head"><h2 class="panel-title">收什么</h2></div>
          <div class="panel-body">
            <ul class="guide-list">
              <li><b>技术</b>：踩过的坑、读过的源码、做过的小工具。</li>
              <li><b>读书</b>：一本书里让你停下来的那一页。</li>
              <li><b>生活</b>：城市、雨、深夜和具体的人。</li>
              <li><b>摄影</b>：一组照片背后的过程，不是参数堆砌。</li>
              <li><b>长度</b>：800–4000 字最好，长一点也没关系。</li>
            </ul>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><h2 class="panel-title">正文格式</h2></div>
          <div class="panel-body">
            <p class="field-hint" style="margin-top: 0">
              <code class="mono">## 小标题</code><br />
              <code class="mono">&gt; 一段引用</code><br />
              <code class="mono">``` 代码 ```</code><br />
              <code class="mono">![说明](https://…)</code>
            </p>
            <p class="field-hint">
              不需要自己排版，标题层级和图片位置我会再整理。正文里的换行会原样保留。
            </p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head"><h2 class="panel-title">之后</h2></div>
          <div class="panel-body">
            <p class="field-hint" style="margin-top: 0">
              信会先落进「投稿箱」。我读完之后，会采纳成草稿、回信约时间，或者说明这次不合适的理由。
              不会未经同意改动你的观点。
            </p>
          </div>
        </div>
      </aside>
    </div>

    <footer style="max-width: 1080px; margin: 0 auto; padding: 0 28px 40px; border-top: 1px solid var(--line-soft); padding-top: 18px">
      <p class="mono" style="margin: 0; font-size: 9.5px; letter-spacing: 0.1em; color: var(--faint)">
        {{ site?.copy?.["site.name"] || "拂晓和朋友们" }} · 投稿不收钱，也不付稿费 · {{ year }}
      </p>
    </footer>
  </div>
</template>
