<script setup lang="ts">
import type { FolderTree } from '@/types';

interface Props {
  selectedFolder: FolderTree | null;
  folderPath: FolderTree[];
}

interface Emits {
  (e: 'navigate', folder: FolderTree | null): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleHomeClick = () => {
  emit('navigate', null); // ← null = Home view
};

const handleNavigate = (folder: FolderTree) => {
  emit('navigate', folder);
};
</script>

<template>
  <div class="breadcrumb">
    <div 
      class="breadcrumb-item home" 
      :class="{ active: !selectedFolder }"
      @click="handleHomeClick"
    >
      <span class="icon">🏠</span>
      <span>Home</span>
    </div>

    <template v-if="folderPath.length > 0">
      <span class="separator">›</span>
      
      <div
        v-for="(folder, index) in folderPath"
        :key="folder.id"
        class="breadcrumb-item"
        :class="{ active: index === folderPath.length - 1 }"
        @click="handleNavigate(folder)"
      >
        <span>{{ folder.name }}</span>
        <span v-if="index < folderPath.length - 1" class="separator">›</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: white;
  border-bottom: 1px solid #e5e5e5;
  font-size: 13px;
  overflow-x: auto;
  white-space: nowrap;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s;
  color: #424242;
}

.breadcrumb-item:hover {
  background-color: #f0f0f0;
}

.breadcrumb-item.active {
  color: #1f1f1f;
  font-weight: 500;
  cursor: default;
}

.breadcrumb-item.active:hover {
  background-color: transparent;
}

.breadcrumb-item .icon {
  margin-right: 4px;
  font-size: 14px;
}

.separator {
  margin: 0 4px;
  color: #999;
  user-select: none;
}

.breadcrumb::-webkit-scrollbar {
  height: 4px;
}

.breadcrumb::-webkit-scrollbar-track {
  background: transparent;
}

.breadcrumb::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}
</style>