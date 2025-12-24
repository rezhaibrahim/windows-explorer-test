<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FolderTree } from '@/types';

interface Props {
  folder: FolderTree;
  selectedId: string | null;
  level: number;
}

interface Emits {
  (e: 'select', folder: FolderTree): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isExpanded = ref(false);

const hasChildren = computed(() => props.folder.children && props.folder.children.length > 0);

const isSelected = computed(() => props.folder.id === props.selectedId);

const indentStyle = computed(() => ({
  paddingLeft: `${12 + (props.level * 16)}px`, // Base 12px + 16px per level
}));

const toggleExpand = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value;
  }
};

const handleClick = () => {
  emit('select', props.folder);
};

const handleSelect = (folder: FolderTree) => {
  emit('select', folder);
};
</script>

<template>
  <div class="folder-tree-item">
    <div
      class="folder-row"
      :class="{ selected: isSelected }"
      :style="indentStyle"
      @click="handleClick"
    >
      <span class="expand-icon" @click.stop="toggleExpand">
        <span v-if="hasChildren">{{ isExpanded ? '▼' : '▶' }}</span>
        <span v-else class="no-children">○</span>
      </span>
      <span class="folder-icon">📁</span>
      <span class="folder-name">{{ folder.name }}</span>
    </div>

    <div v-if="isExpanded && hasChildren" class="folder-children">
      <FolderTreeItem
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :selected-id="selectedId"
        :level="level + 1"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.folder-tree-item {
  user-select: none;
}

.folder-row {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  cursor: pointer;
  transition: background-color 0.1s;
  border-radius: 4px;
  margin: 0;
  font-size: 13px;
}

.folder-row:hover {
  background-color: #f0f0f0;
}

.folder-row.selected {
  background-color: #e5f3ff;
}

.folder-row.selected:hover {
  background-color: #d9edff;
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  font-size: 8px;
  cursor: pointer;
  flex-shrink: 0;
  color: #424242;
}

.expand-icon:hover {
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
}

.no-children {
  opacity: 0;
}

.folder-icon {
  margin-right: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.folder-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f1f1f;
}
</style>