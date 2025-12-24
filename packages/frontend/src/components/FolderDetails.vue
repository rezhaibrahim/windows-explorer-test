<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Folder, File, FolderTree } from '@/types';
import { apiService } from '@/services/api';
import { formatFileSize } from '@/utils/helpers';

interface Props {
  selectedFolder: FolderTree | null;
  rootFolders: FolderTree[]; // ← Tambah prop
}

interface Emits {
  (e: 'navigate', folder: Folder): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const folders = ref<Folder[]>([]);
const files = ref<File[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Check if showing Home view
const isHomeView = computed(() => !props.selectedFolder);

// Show root folders when in Home view
const displayFolders = computed(() => {
  if (isHomeView.value) {
    return props.rootFolders;
  }
  return folders.value;
});

watch(
  () => props.selectedFolder,
  async (newFolder) => {
    if (newFolder) {
      await loadFolderDetails(newFolder.id);
    } else {
      // Home view - clear files
      folders.value = [];
      files.value = [];
    }
  }
);

const loadFolderDetails = async (folderId: string) => {
  loading.value = true;
  error.value = null;

  const response = await apiService.getFolderDetails(folderId);

  if (response.success && response.data) {
    folders.value = response.data.folders;
    files.value = response.data.files;
  } else {
    error.value = response.error || 'Failed to load folder details';
  }

  loading.value = false;
};

const handleFolderClick = (folder: Folder) => {
  emit('navigate', folder);
};

const getItemIcon = (type: 'folder' | 'file', name: string): string => {
  if (type === 'folder') return '📁';
  
  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    txt: '📃',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp3: '🎵',
    mp4: '🎬',
    zip: '🗜️',
    exe: '⚙️',
  };
  
  return iconMap[ext || ''] || '📄';
};
</script>

<template>
  <div class="folder-details">
    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="isHomeView && displayFolders.length === 0" class="empty-state">
      <p>🏠 Loading home folders...</p>
    </div>

    <div v-else-if="!isHomeView && displayFolders.length === 0 && files.length === 0" class="empty-state">
      <p>📭 This folder is empty</p>
    </div>

    <div v-else class="details-content">
      <!-- Folders Section -->
      <div v-if="displayFolders.length > 0" class="section">
        <h4 class="section-title">
          {{ isHomeView ? 'Quick Access' : `Folders (${displayFolders.length})` }}
        </h4>
        <div class="items-grid">
          <div 
            v-for="folder in displayFolders" 
            :key="folder.id" 
            class="item folder-item"
            @click="handleFolderClick(folder)"
          >
            <div class="item-icon">{{ getItemIcon('folder', folder.name) }}</div>
            <div class="item-info">
              <div class="item-name" :title="folder.name">{{ folder.name }}</div>
              <div class="item-meta">Folder</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Files Section (only when not Home view) -->
      <div v-if="!isHomeView && files.length > 0" class="section">
        <h4 class="section-title">Files ({{ files.length }})</h4>
        <div class="items-grid">
          <div v-for="file in files" :key="file.id" class="item file-item">
            <div class="item-icon">{{ getItemIcon('file', file.name) }}</div>
            <div class="item-info">
              <div class="item-name" :title="file.name">{{ file.name }}</div>
              <div class="item-meta">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.folder-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.details-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: white;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #424242;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.1s;
  background-color: white;
}

.item:hover {
  background-color: #f9f9f9;
  border-color: #e5e5e5;
}

.item:active {
  background-color: #f0f0f0;
}

.folder-item {
  cursor: pointer; /* ← Pointer cursor untuk folder */
}

.file-item {
  cursor: default; /* ← Default cursor untuk file */
}

.item-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.item-info {
  width: 100%;
  text-align: center;
}

.item-name {
  font-size: 13px;
  font-weight: 400;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f1f1f;
}

.item-meta {
  font-size: 12px;
  color: #737373;
}

.loading,
.error,
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8a8a8a;
  padding: 40px 20px;
}

.error {
  color: #d13438;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
  color: #8a8a8a;
}

.details-content::-webkit-scrollbar {
  width: 12px;
}

.details-content::-webkit-scrollbar-track {
  background: transparent;
}

.details-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
  border: 3px solid white;
}

.details-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .item {
    padding: 12px 8px;
  }

  .item-icon {
    font-size: 36px;
  }
}
</style>