<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  createCategory,
  deleteCategory,
  listCategories,
  listTags,
  renameTag,
  updateCategory,
} from "@/api/articles";
import type { Category, TagStat } from "@/types";
import { STATUS_KEYS } from "@/utils/constants";
import PageHeader from "@/components/PageHeader.vue";
import Panel from "@/components/Panel.vue";
import EmptyState from "@/components/EmptyState.vue";

const loading = ref(false);
const categories = ref<Category[]>([]);
const tags = ref<TagStat[]>([]);

const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({
  name: "",
  slug: "",
  statusKey: "write",
  sortOrder: 0,
  visible: true,
});

const renameVisible = ref(false);
const renameFrom = ref("");
const renameTo = ref("");

async function load() {
  loading.value = true;
  try {
    categories.value = await listCategories();
    tags.value = await listTags();
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.name = "";
  form.slug = "";
  form.statusKey = "write";
  form.sortOrder = categories.value.length + 1;
  form.visible = true;
  dialogVisible.value = true;
}

function openEdit(category: Category) {
  editingId.value = category.id;
  form.name = category.name;
  form.slug = category.slug;
  form.statusKey = category.statusKey;
  form.sortOrder = category.sortOrder;
  form.visible = category.visible;
  dialogVisible.value = true;
}

async function submit() {
  if (!form.name.trim()) {
    ElMessage.warning("请填写分类名");
    return;
  }
  const payload = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    statusKey: form.statusKey,
    sortOrder: form.sortOrder,
    visible: form.visible,
  };
  if (editingId.value) {
    await updateCategory(editingId.value, payload);
    ElMessage.success("分类已更新");
  } else {
    await createCategory(payload);
    ElMessage.success("分类已创建");
  }
  dialogVisible.value = false;
  load();
}

async function toggleVisible(category: Category) {
  await updateCategory(category.id, {
    name: category.name,
    slug: category.slug,
    statusKey: category.statusKey,
    sortOrder: category.sortOrder,
    visible: category.visible,
  });
  ElMessage.success(category.visible ? "已显示" : "已隐藏");
}

async function remove(category: Category) {
  try {
    await ElMessageBox.confirm(
      `删除分类「${category.name}」？分类下还有文章时不能删除。`,
      "删除分类",
      { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }
  await deleteCategory(category.id);
  ElMessage.success("已删除");
  load();
}

function openRename(tag: TagStat) {
  renameFrom.value = tag.name;
  renameTo.value = tag.name;
  renameVisible.value = true;
}

async function submitRename() {
  if (!renameTo.value.trim() || renameTo.value.trim() === renameFrom.value) {
    ElMessage.warning("新标签名不能为空，也不能和原来一样");
    return;
  }
  const changed = await renameTag(renameFrom.value, renameTo.value.trim());
  ElMessage.success(`已重命名，影响 ${changed} 篇文章`);
  renameVisible.value = false;
  load();
}

onMounted(load);
</script>

<template>
  <div class="page">
    <PageHeader
      eyebrow="CONTENT / TAXONOMY"
      title="分类与标签"
      description="分类决定文章落在哪个栏目，标签是更细的线。改名会同时更新所有文章。"
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">新建分类</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="dash-row">
      <Panel title="分类" subtitle="顺序决定文章页筛选栏的排列">
        <el-table :data="categories" row-key="id">
          <el-table-column label="分类" min-width="160">
            <template #default="{ row }">
              <span class="table-title">{{ row.name }}</span>
              <p class="table-sub">{{ row.slug }} · {{ row.statusKey }}</p>
            </template>
          </el-table-column>
          <el-table-column label="文章" width="70" align="right">
            <template #default="{ row }">
              <span class="mono">{{ row.articleCount || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="66" align="center">
            <template #default="{ row }">
              <span class="mono faint">{{ row.sortOrder }}</span>
            </template>
          </el-table-column>
          <el-table-column label="显示" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.visible" size="small" @change="toggleVisible(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="104" align="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button text size="small" @click="openEdit(row)">编辑</el-button>
                <el-button text size="small" @click="remove(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <EmptyState text="还没有分类" hint="新建一个，文章才有地方落。" />
          </template>
        </el-table>
      </Panel>

      <Panel title="标签" subtitle="点击标签可以改名">
        <div v-if="tags.length" class="tag-cloud">
          <button v-for="tag in tags" :key="tag.name" type="button" class="tag-cloud-item" @click="openRename(tag)">
            <span>{{ tag.name }}</span>
            <b>{{ tag.count }}</b>
          </button>
        </div>
        <EmptyState v-else text="还没有标签" hint="在文章编辑器里添加标签后，会汇总到这里。" />
        <p class="field-hint" style="margin-top: 14px">
          标签属于内容，不参与排版；改名会写回每一篇用到它的文章。
        </p>
      </Panel>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑分类' : '新建分类'"
      width="460px"
      append-to-body
    >
      <el-form label-position="top">
        <el-form-item label="分类名">
          <el-input v-model="form.name" placeholder="例如：技术随笔" />
        </el-form-item>
        <div class="field-grid">
          <el-form-item label="slug">
            <el-input v-model="form.slug" placeholder="tech" />
          </el-form-item>
          <el-form-item label="状态标识">
            <el-select v-model="form.statusKey">
              <el-option
                v-for="item in STATUS_KEYS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="field-grid">
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
          <el-form-item label="在站点上显示">
            <el-switch v-model="form.visible" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="renameVisible" title="重命名标签" width="420px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="原标签">
          <el-input :model-value="renameFrom" disabled />
        </el-form-item>
        <el-form-item label="新标签">
          <el-input v-model="renameTo" placeholder="输入新的标签名" @keyup.enter="submitRename" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRename">重命名</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.tag-cloud-item {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--line);
  border-radius: 2px;
  background: #fffdf8;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  transition: all 0.18s ease;
}

.tag-cloud-item:hover {
  border-color: var(--lamp);
  color: var(--lamp);
}

.tag-cloud-item b {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 400;
  color: var(--faint);
}
</style>
