<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  setUserEnabled,
  updateUser,
} from "@/api/system";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types";
import { formatDateTime } from "@/utils/format";
import { ROLES } from "@/utils/constants";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";

const auth = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const users = ref<User[]>([]);

const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
  username: "",
  password: "",
  nickname: "",
  email: "",
  role: "EDITOR",
});

const resetVisible = ref(false);
const resetTarget = ref<User | null>(null);
const newPassword = ref("");

async function load() {
  loading.value = true;
  try {
    users.value = await listUsers();
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { username: "", password: "", nickname: "", email: "", role: "EDITOR" });
  dialogVisible.value = true;
}

function openEdit(user: User) {
  editingId.value = user.id;
  Object.assign(form, {
    username: user.username,
    password: "",
    nickname: user.nickname || "",
    email: user.email || "",
    role: user.role,
  });
  dialogVisible.value = true;
}

async function submit() {
  if (!form.username.trim()) {
    ElMessage.warning("请填写账号");
    return;
  }
  if (!editingId.value && form.password.length < 6) {
    ElMessage.warning("密码至少 6 位");
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      const updated = await updateUser(editingId.value, {
        nickname: form.nickname,
        email: form.email,
        role: form.role,
      });
      if (auth.user?.id === updated.id) {
        auth.setUser(updated);
      }
      ElMessage.success("账号已更新");
    } else {
      await createUser({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname,
        email: form.email,
        role: form.role,
      });
      ElMessage.success("账号已创建");
    }
    dialogVisible.value = false;
    load();
  } finally {
    saving.value = false;
  }
}

async function toggleEnabled(user: User, value: boolean) {
  try {
    await setUserEnabled(user.id, value);
    ElMessage.success(value ? "账号已启用" : "账号已停用");
  } catch {
    user.enabled = !value;
  }
}

function openReset(user: User) {
  resetTarget.value = user;
  newPassword.value = "";
  resetVisible.value = true;
}

async function submitReset() {
  if (!resetTarget.value) return;
  if (newPassword.value.length < 6) {
    ElMessage.warning("密码至少 6 位");
    return;
  }
  await resetUserPassword(resetTarget.value.id, newPassword.value);
  ElMessage.success("密码已重置");
  resetVisible.value = false;
}

async function remove(user: User) {
  try {
    await ElMessageBox.confirm(`删除账号「${user.username}」？`, "删除账号", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }
  await deleteUser(user.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="SYSTEM / ACCOUNTS"
      title="账号"
      description="后台只有两类人：管理员可以做一切，编辑只能碰内容。停用账号不会删除内容。"
      :count="`${users.length} 个`"
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">新建账号</el-button>
      </template>
    </PageHeader>

    <Panel flush>
      <el-table v-loading="loading" :data="users" row-key="id">
        <el-table-column label="账号" min-width="190">
          <template #default="{ row }">
            <span class="table-title">{{ row.username }}</span>
            <p class="table-sub">{{ row.nickname || "未填昵称" }} · {{ row.email || "未填邮箱" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'warning' : 'info'" size="small" effect="plain">
              {{ row.role === "ADMIN" ? "管理员" : "编辑" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="92" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              size="small"
              :disabled="row.id === auth.user?.id"
              @change="(value) => toggleEnabled(row, Boolean(value))"
            />
          </template>
        </el-table-column>
        <el-table-column label="上次登录" width="156">
          <template #default="{ row }">
            <span class="mono" style="font-size: 10px">{{ formatDateTime(row.lastLoginAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建于" width="120">
          <template #default="{ row }">
            <span class="mono" style="font-size: 10px">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" @click="openReset(row)">改密</el-button>
              <el-button
                text
                size="small"
                :disabled="row.id === auth.user?.id"
                @click="remove(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState text="还没有账号" />
        </template>
      </el-table>
    </Panel>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑账号' : '新建账号'"
      width="460px"
      append-to-body
    >
      <el-form label-position="top">
        <div class="field-grid">
          <el-form-item label="账号">
            <el-input v-model="form.username" :disabled="Boolean(editingId)" />
          </el-form-item>
          <el-form-item v-if="!editingId" label="初始密码">
            <el-input v-model="form.password" type="password" show-password />
          </el-form-item>
        </div>
        <div class="field-grid">
          <el-form-item label="昵称">
            <el-input v-model="form.nickname" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="form.role" style="width: 100%">
              <el-option v-for="role in ROLES" :key="role.value" :label="role.label" :value="role.value" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="用来接收系统通知，可不填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resetVisible" title="重置密码" width="400px" append-to-body>
      <p class="field-hint" style="margin: 0 0 10px">
        正在为 {{ resetTarget?.username }} 设置新密码，请当面或通过安全渠道告知对方。
      </p>
      <el-input v-model="newPassword" type="password" show-password placeholder="至少 6 位" />
      <template #footer>
        <el-button @click="resetVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReset">重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>
