<script setup lang="ts">
import { ref, computed } from 'vue';
import FolderTree from './components/FolderTree.vue';
import FolderDetails from './components/FolderDetails.vue';
import SearchBar from './components/SearchBar.vue';
import Breadcrumb from './components/Breadcrumb.vue';
import type { FolderTree as FolderTreeType, Folder } from './types';

const selectedFolder = ref<FolderTreeType | null>(null);
const folderTreeRef = ref<InstanceType<typeof FolderTree> | null>(null);
const allFoldersFlat = ref<Map<string, FolderTreeType>>(new Map());
const rootFolders = ref<FolderTreeType[]>([]); // ← Tambah ini untuk store root folders

// Build folder path for breadcrumb
const folderPath = computed(() => {
  if (!selectedFolder.value) return [];
  
  const path: FolderTreeType[] = [];
  let currentId: string | null = selectedFolder.value.id;
  
  while (currentId) {
    const folder = allFoldersFlat.value.get(currentId);
    if (!folder) break;
    
    path.unshift(folder);
    currentId = folder.parentId;
  }
  
  return path;
});

const flattenFolders = (folders: FolderTreeType[], parentMap: Map<string, FolderTreeType>) => {
  folders.forEach(folder => {
    parentMap.set(folder.id, folder);
    if (folder.children && folder.children.length > 0) {
      flattenFolders(folder.children, parentMap);
    }
  });
};

const handleFolderSelect = (folder: FolderTreeType) => {
  selectedFolder.value = folder;
};

const handleTreeLoaded = (folders: FolderTreeType[]) => {
  const flatMap = new Map<string, FolderTreeType>();
  flattenFolders(folders, flatMap);
  allFoldersFlat.value = flatMap;
  rootFolders.value = folders; // ← Store root folders
  
  // Auto-select "Home" (show all root folders)
  // Tidak set selectedFolder, biar FolderDetails tahu ini Home view
};

const handleSearchSelect = (folder: Folder) => {
  const fullFolder = allFoldersFlat.value.get(folder.id);
  
  if (fullFolder) {
    selectedFolder.value = fullFolder;
  } else {
    selectedFolder.value = {
      ...folder,
      children: [],
    };
  }
};

const handleBreadcrumbNavigate = (folder: FolderTreeType | null) => {
  selectedFolder.value = folder;
};

const handleDetailsNavigate = (folder: Folder) => {
  const fullFolder = allFoldersFlat.value.get(folder.id);
  if (fullFolder) {
    selectedFolder.value = fullFolder;
  } else {
    selectedFolder.value = {
      ...folder,
      children: [],
    };
  }
};
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1>📁 File Explorer</h1>
        <div class="search-wrapper">
          <SearchBar @select="handleSearchSelect" />
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="left-panel">
        <FolderTree 
          ref="folderTreeRef" 
          @select="handleFolderSelect"
          @loaded="handleTreeLoaded"
        />
      </div>

      <div class="right-panel">
        <Breadcrumb 
          :selected-folder="selectedFolder"
          :folder-path="folderPath"
          @navigate="handleBreadcrumbNavigate"
        />
        <FolderDetails 
          :selected-folder="selectedFolder"
          :root-folders="rootFolders"
          @navigate="handleDetailsNavigate"
        />
      </div>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f3f3;
}

.app-header {
  background: white;
  color: #1f1f1f;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: none;
}

.header-content {
  max-width: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-header h1 {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: #1f1f1f;
}

.search-wrapper {
  flex: 1;
  max-width: 400px;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: white;
}

.left-panel {
  width: 260px;
  min-width: 200px;
  max-width: 400px;
  overflow: auto;
  background-color: #f9f9f9;
  border-right: 1px solid #e5e5e5;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
}

@media (max-width: 768px) {
  .app-main {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    height: 40%;
  }

  .right-panel {
    height: 60%;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-wrapper {
    max-width: 100%;
  }
}
</style>