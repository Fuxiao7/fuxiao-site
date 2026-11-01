<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { createFriend, deleteFriend, listFriends, updateFriend } from "@/api/site";
import type { Friend } from "@/types";
import { mediaUrl } from "@/utils/format";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";
import ImagePicker from "@/components/ImagePicker.vue";

const loading = ref(false);
const friends = ref<Friend[]>([]);

const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const form = reactive<Friend>({
  name: "",
  site: "",
  url: "",
  description: "",
  avatar: "",
  sortOrder: 0,
  visible: true,
});

async function load() {
  loading.value = true;
  try {
    friends.value = await listFriends();
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, {
    name: "",
    site: "",
    url: "",
    description: "",
    avatar: "",
    sortOrder: friends.value.length,
    visible: true,
  });
  dialogVisible.value = true;
}

function openEdit(friend: Friend) {
  editingId.value = friend.id || null;
  Object.assign(form, {
    name: friend.name,
    site: friend.site || "",
    url: friend.url || "",
    description: friend.description || "",
    avatar: friend.avatar || "",
    sortOrder: friend.sortOrder,
    visible: friend.visible,
  });
  dialogVisible.value = true;
}

async function submit() {
  if (!form.name.trim()) {
    ElMessage.warning("请填写站名");
    return;
  }
  const payload: Partial<Friend> = {
    ...form,
    name: form.name.trim(),
    url: form.url?.trim() || (form.site ? `https://${form.site.trim()}` : null),
  };
  if (editingId.value) {
    await updateFriend(editingId.value, payload);
    ElMessage.success("友链已更新");
  } else {
    await createFriend(payload);
    ElMessage.success("友链已添加");
  }
  dialogVisible.value = false;
  load();
}

async function remove(friend: Friend) {
  if (!friend.id) return;
  try {
    await ElMessageBox.confirm(`删除友链「${friend.name}」？`, "删除友链", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  await deleteFriend(friend.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / FRIENDS"
      title="友链"
      description="十个还在写的人。顺序就是页面上的顺序；隐藏的条目不会出现在站点上。"
      :count="`${friends.length} 个`"
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">新增友链</el-button>
      </template>
    </PageHeader>

    <Panel flush>
      <el-table v-loading="loading" :data="friends" row-key="id">
        <el-table-column label="序号" width="58">
          <template #default="{ $index }">
            <span class="mono faint" style="font-size: 10px">{{ String($index + 1).padStart(2, "0") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="站名" min-width="200">
          <template #default="{ row }">
            <span class="table-title">{{ row.name }}</span>
            <p class="table-sub">{{ row.site || "—" }}</p>
          </template>
        </el-table-column>
        <el-table-column label="介绍" min-width="280">
          <template #default="{ row }">
            <span class="muted" style="font-size: 12px">{{ row.description || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="66" align="center">
          <template #default="{ row }">
            <span class="mono faint" style="font-size: 10px">{{ row.sortOrder }}</span>
          </template>
        </el-table-column>
        <el-table-column label="显示" width="78" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible ? 'success' : 'info'" size="small" effect="plain">
              {{ row.visible ? "显示" : "隐藏" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="108" align="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text size="small" @click="openEdit(row)">编辑</el-button>
              <el-button text size="small" @click="remove(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState text="还没有友链" hint="把常读的站加进来。" />
        </template>
      </el-table>
    </Panel>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑友链' : '新增友链'" width="500px" append-to-body>
      <div style="display: flex; gap: 16px">
        <ImagePicker v-model="form.avatar" title="选择头像">
          <div class="cover-drop" style="width: 84px; aspect-ratio: 1">
            <img v-if="form.avatar" :src="mediaUrl(form.avatar)" alt="" />
            <div v-else class="cover-empty" style="font-size: 9px">头像</div>
            <div class="cover-hover" style="font-size: 9px">更换</div>
          </div>
        </ImagePicker>
        <el-form label-position="top" style="flex: 1">
          <el-form-item label="站名">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="显示地址">
            <el-input v-model="form.site" placeholder="lsjl.me" />
          </el-form-item>
        </el-form>
      </div>

      <el-form label-position="top" style="margin-top: 4px">
        <el-form-item label="跳转链接">
          <el-input v-model="form.url" placeholder="https://lsjl.me（留空会按显示地址补全）" />
        </el-form-item>
        <el-form-item label="一句介绍">
          <el-input
            v-model="form.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="写 Rust 和爬山的女生……"
          />
        </el-form-item>
        <div class="field-grid">
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
          <el-form-item label="显示">
            <el-switch v-model="form.visible" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
