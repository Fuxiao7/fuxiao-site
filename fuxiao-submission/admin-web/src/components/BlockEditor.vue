<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { BLOCK_TYPES, emptyBlock } from "@/utils/constants";
import { markdownToBlocks } from "@/utils/markdown";
import { mediaUrl } from "@/utils/format";
import type { Block, BlockType } from "@/types";
import ImagePicker from "./ImagePicker.vue";

const props = defineProps<{ modelValue: Block[] }>();
const emit = defineEmits<{ (event: "update:modelValue", value: Block[]): void }>();

const blocks = computed(() => props.modelValue || []);
const importVisible = ref(false);
const importText = ref("");

function commit(next: Block[]) {
  emit("update:modelValue", next);
}

function add(type: BlockType) {
  commit([...blocks.value, emptyBlock(type)]);
}

function remove(index: number) {
  commit(blocks.value.filter((_, i) => i !== index));
}

function move(index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= blocks.value.length) return;
  const next = [...blocks.value];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  commit(next);
}

function patch(index: number, value: Partial<Block>) {
  commit(blocks.value.map((block, i) => (i === index ? { ...block, ...value } : block)));
}

function changeType(index: number, type: BlockType) {
  const current = blocks.value[index];
  if (!current) return;
  if (type === "img") {
    patch(index, { ...emptyBlock("img") });
    return;
  }
  patch(index, { ...emptyBlock(type), text: current.text || "" });
}

function applyImport(mode: "replace" | "append") {
  const parsed = markdownToBlocks(importText.value);
  if (!parsed.length) {
    ElMessage.warning("没有解析到内容");
    return;
  }
  commit(mode === "replace" ? parsed : [...blocks.value, ...parsed]);
  importVisible.value = false;
  importText.value = "";
  ElMessage.success(`已导入 ${parsed.length} 个块`);
}

function typeLabel(type: string) {
  return BLOCK_TYPES.find((item) => item.value === type)?.label || type;
}
</script>

<template>
  <div>
    <div class="block-list">
      <div v-for="(block, index) in blocks" :key="index" class="block-row">
        <div class="block-index">{{ String(index + 1).padStart(2, "0") }}</div>
        <div>
          <div class="block-tools">
            <el-select
              :model-value="block.t"
              size="small"
              style="width: 96px"
              @change="(value) => changeType(index, value)"
            >
              <el-option
                v-for="type in BLOCK_TYPES"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
            <div class="ops">
              <el-button text size="small" :disabled="index === 0" @click="move(index, -1)">
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                text
                size="small"
                :disabled="index === blocks.length - 1"
                @click="move(index, 1)"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
              <el-button text size="small" @click="remove(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <template v-if="block.t === 'img'">
            <div class="image-field">
              <ImagePicker
                :model-value="block.src || ''"
                title="选择插图"
                @update:model-value="(value) => patch(index, { src: value })"
              >
                <div class="shot">
                  <img v-if="block.src" :src="mediaUrl(block.src)" :alt="block.alt || ''" />
                  <div v-else class="empty">选择图片</div>
                </div>
              </ImagePicker>
              <div class="stack-sm" style="flex: 1">
                <el-input
                  :model-value="block.alt || ''"
                  placeholder="图片说明（alt，给读屏与搜索用）"
                  @update:model-value="(value) => patch(index, { alt: value })"
                />
                <el-input
                  :model-value="block.cap || ''"
                  placeholder="图注（显示在图片下方）"
                  @update:model-value="(value) => patch(index, { cap: value })"
                />
              </div>
            </div>
          </template>

          <template v-else-if="block.t === 'code'">
            <el-input
              :model-value="block.text || ''"
              type="textarea"
              :rows="5"
              class="mono"
              placeholder="在这里贴代码，换行会原样保留"
              @update:model-value="(value) => patch(index, { text: value })"
            />
          </template>

          <template v-else-if="block.t === 'h2'">
            <el-input
              :model-value="block.text || ''"
              placeholder="小标题"
              class="serif"
              @update:model-value="(value) => patch(index, { text: value })"
            />
          </template>

          <template v-else>
            <el-input
              :model-value="block.text || ''"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 16 }"
              :placeholder="block.t === 'q' ? '引文' : '正文段落'"
              @update:model-value="(value) => patch(index, { text: value })"
            />
          </template>
        </div>
      </div>
    </div>

    <p v-if="!blocks.length" class="empty-note">还没有正文。先加一段，或者从 Markdown 导入。</p>

    <div class="block-add">
      <span class="label">ADD</span>
      <el-button
        v-for="type in BLOCK_TYPES"
        :key="type.value"
        size="small"
        plain
        @click="add(type.value)"
      >
        + {{ type.label }}
      </el-button>
      <el-button size="small" text style="margin-left: auto" @click="importVisible = true">
        从 Markdown 导入
      </el-button>
    </div>

    <el-dialog v-model="importVisible" title="从 Markdown 导入" width="620px" append-to-body>
      <p class="field-hint" style="margin: 0 0 10px">
        支持 ## 小标题、&gt; 引用、``` 代码块、![说明](图片地址)，空行分段。
      </p>
      <el-input
        v-model="importText"
        type="textarea"
        :rows="14"
        class="mono"
        placeholder="把 Markdown 正文粘在这里"
      />
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button @click="applyImport('append')">追加到末尾</el-button>
        <el-button type="primary" @click="applyImport('replace')">替换当前正文</el-button>
      </template>
    </el-dialog>
  </div>
</template>
