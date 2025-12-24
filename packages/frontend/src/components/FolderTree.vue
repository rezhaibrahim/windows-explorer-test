<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FolderTreeItem from './FolderTreeItem.vue';
import type { FolderTree } from '@/types';
import { apiService } from '@/services/api';

interface Emits {
  (e: 'select', folder: FolderTree): void;
  (e: 'loaded', folders: FolderTree[]): void; // ← Tambah ini
}

const emit = defineEmits<Emits>();

const folders = ref<FolderTree[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedId = ref<string | null>(null);
const homeExpanded = ref(true);

onMounted(async () => {
  await loadFolderTree();
});

const loadFolderTree = async () => {
  loading.value = true;
  error.value = null;

  const response = await apiService.getFolderTree();

  if (response.success && response.data) {
    folders.value = response.data;
    emit('loaded', response.data); // ← Emit folders setelah load
  } else {
    error.value = response.error || 'Failed to load folders';
  }

  loading.value = false;
};

const handleSelect = (folder: FolderTree) => {
  selectedId.value = folder.id;
  emit('select', folder);
};

const toggleHome = () => {
  homeExpanded.value = !homeExpanded.value;
};

const refresh = async () => {
  await loadFolderTree();
};

defineExpose({ refresh });
</script>

<template>
  <div class="folder-tree">
    <div v-if="loading" class="loading">Loading folders...</div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="refresh">Retry</button>
    </div>

    <div v-else class="tree-content">
      <!-- Home Section -->
      <div class="nav-section">
        <div class="nav-header" @click="toggleHome">
          <span class="nav-icon">{{ homeExpanded ? '▼' : '▶' }}</span>
          <span class="nav-icon-main">🏠</span>
          <span class="nav-title">Home</span>
        </div>
        
        <div v-if="homeExpanded" class="nav-items">
          <FolderTreeItem
            v-for="folder in folders"
            :key="folder.id"
            :folder="folder"
            :selected-id="selectedId"
            :level="1"
            @select="handleSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-tree {
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.nav-section {
  margin-bottom: 0;
}

.nav-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s;
}

.nav-header:hover {
  background-color: #f0f0f0;
}

.nav-icon {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  font-size: 9px;
  color: #424242;
}

.nav-icon-main {
  margin-right: 8px;
  font-size: 16px;
}

.nav-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f1f1f;
}

.nav-items {
  padding-left: 0;
}

.loading,
.error {
  padding: 20px;
  text-align: center;
  font-size: 13px;
}

.error {
  color: #d13438;
}

.error button {
  margin-top: 10px;
  padding: 6px 16px;
  background-color: #0067c0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.error button:hover {
  background-color: #005a9e;
}

.tree-content::-webkit-scrollbar {
  width: 12px;
}

.tree-content::-webkit-scrollbar-track {
  background: transparent;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
  border: 3px solid #f9f9f9;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>