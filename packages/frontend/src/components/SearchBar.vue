<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Folder } from '@/types';
import { apiService } from '@/services/api';
import { debounce } from '@/utils/helpers';

interface Emits {
  (e: 'select', folder: Folder): void;
}

const emit = defineEmits<Emits>();

const searchQuery = ref('');
const searchResults = ref<Folder[]>([]);
const isSearching = ref(false);
const showResults = ref(false);

const performSearch = async (query: string) => {
  if (query.trim().length === 0) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  isSearching.value = true;
  const response = await apiService.searchFolders(query);

  if (response.success && response.data) {
    searchResults.value = response.data;
    showResults.value = true;
  }

  isSearching.value = false;
};

const debouncedSearch = debounce(performSearch, 300);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

const selectFolder = (folder: Folder) => {
  emit('select', folder);
  searchQuery.value = '';
  showResults.value = false;
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showResults.value = false;
};

const handleClickOutside = () => {
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};
</script>

<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search folders..."
        class="search-input"
        @blur="handleClickOutside"
        @focus="showResults = searchResults.length > 0"
      />
      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
    </div>

    <div v-if="showResults" class="search-results">
      <div v-if="isSearching" class="search-status">Searching...</div>
      <div v-else-if="searchResults.length === 0" class="search-status">No folders found</div>
      <div v-else class="results-list">
        <div
          v-for="folder in searchResults"
          :key="folder.id"
          class="result-item"
          @click="selectFolder(folder)"
        >
          <span class="result-icon">📁</span>
          <span class="result-name">{{ folder.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 14px;
  pointer-events: none;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 6px 36px 6px 32px;
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.1s;
  background-color: white;
}

.search-input:focus {
  border-color: #0067c0;
  background-color: white;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  color: #737373;
  border-radius: 2px;
  transition: all 0.1s;
}

.clear-btn:hover {
  background-color: #e5e5e5;
  color: #1f1f1f;
}

.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.search-status {
  padding: 12px;
  text-align: center;
  color: #737373;
  font-size: 13px;
}

.results-list {
  padding: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.1s;
}

.result-item:hover {
  background-color: #f3f3f3;
}

.result-icon {
  margin-right: 10px;
  font-size: 16px;
}

.result-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1f1f1f;
}

.search-results::-webkit-scrollbar {
  width: 12px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
  border: 3px solid white;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>