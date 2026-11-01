<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { changePassword, updateProfile } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import { mediaUrl, formatDateTime } from "@/utils/format";
import { copyText } from "@/utils/clipboard";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import ImagePicker from "@/components/ImagePicker.vue";

const auth = useAuthStore();

const savingProfile = ref(false);
const savingPassword = ref(false);

const profile = reactive({ nickname: "", email: "", avatar: "" });
const password = reactive({ oldPassword: "", newPassword: "", confirm: "" });

function fillProfile() {
  profile.nickname = auth.user?.nickname || "";
  profile.email = auth.user?.email || "";
  profile.avatar = auth.user?.avatar || "";
}

async function saveProfile() {
  savingProfile.value = true;
  try {
    const updated = await updateProfile({
      nickname: profile.nickname,
      email: profile.email,
      avatar: profile.avatar,
    });
    auth.setUser(updated);
    ElMessage.success("资料已更新");
  } finally {
    savingProfile.value = false;
  }
}

async function savePassword() {
  if (!password.oldPassword || !password.newPassword) {
    ElMessage.warning("请填写当前密码和新密码");
    return;
  }
  if (password.newPassword.length < 6) {
    ElMessage.warning("新密码至少 6 位");
    return;
  }
  if (password.newPassword !== password.confirm) {
    ElMessage.warning("两次输入的新密码不一样");
    return;
  }
  savingPassword.value = true;
  try {
    await changePassword({ oldPassword: password.oldPassword, newPassword: password.newPassword });
    ElMessage.success("密码已修改，下次登录请用新密码");
    password.oldPassword = "";
    password.newPassword = "";
    password.confirm = "";
  } finally {
    savingPassword.value = false;
  }
}

async function copyEmail() {
  const email = auth.user?.email || "";
  if (!email) return;
  const ok = await copyText(email);
  ElMessage[ok ? "success" : "warning"](ok ? "已复制邮箱" : "复制失败");
}

onMounted(fillProfile);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="SYSTEM / PROFILE"
      title="个人资料"
      description="这里是登录后台的账号。文章署名在每篇文章里单独设置。"
    >
      <template #actions>
        <el-button :disabled="!auth.user?.email" @click="copyEmail">复制邮箱</el-button>
        <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存资料</el-button>
      </template>
    </PageHeader>

    <div class="profile-layout">
      <div class="stack">
        <Panel title="账号资料">
          <div style="display: flex; gap: 20px; margin-bottom: 16px">
            <ImagePicker v-model="profile.avatar" title="选择头像">
              <div class="avatar-drop">
                <img v-if="profile.avatar" :src="mediaUrl(profile.avatar)" alt="" />
                <span v-else class="avatar-initial">{{ auth.initial }}</span>
              </div>
            </ImagePicker>
            <div style="flex: 1">
              <p class="eyebrow">ACCOUNT</p>
              <p style="margin: 4px 0 2px; font-family: var(--font-serif); font-size: 22px">
                {{ auth.user?.username }}
              </p>
              <p class="mono faint" style="margin: 0; font-size: 10px">
                {{ auth.user?.role === "ADMIN" ? "管理员 · 可以做一切" : "编辑 · 只管内容" }}
              </p>
              <p class="field-hint" style="margin-top: 8px">
                上次登录：{{ formatDateTime(auth.user?.lastLoginAt) }}
              </p>
            </div>
          </div>

          <div class="field-grid">
            <div>
              <span class="field-label">昵称</span>
              <el-input v-model="profile.nickname" placeholder="拂晓" />
            </div>
            <div>
              <span class="field-label">邮箱</span>
              <el-input v-model="profile.email" placeholder="470379769@qq.com" />
            </div>
          </div>
          <p class="field-hint">头像与昵称只用于后台；站点上的署名与简介在「关于页」里改。</p>
        </Panel>

        <Panel title="修改密码" subtitle="建议每三个月换一次">
          <el-form label-position="top">
            <div class="field-grid">
              <el-form-item label="当前密码">
                <el-input v-model="password.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="password.newPassword" type="password" show-password />
              </el-form-item>
            </div>
            <el-form-item label="再输一次新密码">
              <el-input
                v-model="password.confirm"
                type="password"
                show-password
                @keyup.enter="savePassword"
              />
            </el-form-item>
            <el-button type="primary" :loading="savingPassword" @click="savePassword">
              修改密码
            </el-button>
          </el-form>
        </Panel>
      </div>

      <aside class="editor-aside" style="position: static">
        <Panel title="这个账号能做什么">
          <ul class="guide-list">
            <li><b>管理员</b>：内容、投稿、媒体、账号、日志、导出。</li>
            <li><b>编辑</b>：内容、投稿、媒体、导出；看不到账号与日志。</li>
            <li><b>投稿入口</b> 是公开页面，不需要登录，读者可以自己寄稿。</li>
          </ul>
        </Panel>
        <Panel title="安全提醒">
          <p class="field-hint" style="margin: 0; line-height: 1.9">
            部署到公网之前，记得修改后端环境变量里的
            <code class="mono">JWT_SECRET</code>、数据库密码与
            <code class="mono">ADMIN_INIT_PASSWORD</code>，并确认
            <code class="mono">uploads/</code> 目录有备份。
          </p>
        </Panel>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 318px;
  gap: 20px;
  align-items: start;
}

.avatar-drop {
  display: flex;
  width: 76px;
  height: 76px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--paper-2);
}

.avatar-drop img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  font-family: var(--font-serif);
  font-size: 28px;
  color: var(--lamp);
}

@media (max-width: 1100px) {
  .profile-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
