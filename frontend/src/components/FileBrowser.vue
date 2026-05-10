<script setup lang="ts">
import { onMounted } from 'vue';
import { useFileStore } from '@/stores/fileStore';

import '@mdui/icons/folder.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';

const fileStore = useFileStore();

onMounted(() => {
  fileStore.fetchFiles();
});

const handleEntryClick = (entry: any) => {
  if (entry.type === 'directory') {
    fileStore.navigate(entry.path);
  } else {
    fileStore.openFile(entry);
  }
};

const goBack = () => {
  const parts = fileStore.currentPath.split('/');
  if (parts.length > 1) {
    parts.pop();
    fileStore.navigate(parts.join('/') || '.');
  } else if (fileStore.currentPath !== '.') {
    fileStore.navigate('.');
  }
};
</script>

<template>
  <div class="file-browser">
    <mdui-linear-progress v-if="fileStore.loading"></mdui-linear-progress>
    
    <mdui-list>
      <mdui-list-item 
        v-if="fileStore.currentPath !== '.'" 
        @click="goBack"
        class="back-item"
      >
        <mdui-icon-arrow-back slot="icon"></mdui-icon-arrow-back>
        ..
      </mdui-list-item>

      <mdui-list-item 
        v-for="file in fileStore.files" 
        :key="file.path"
        @click="handleEntryClick(file)"
      >
        <mdui-icon-folder v-if="file.type === 'directory'" slot="icon"></mdui-icon-folder>
        <mdui-icon-insert-drive-file v-else slot="icon"></mdui-icon-insert-drive-file>
        {{ file.name }}
        <div slot="description" v-if="file.type === 'file'">
          {{ (file.size / 1024).toFixed(2) }} KB
        </div>
      </mdui-list-item>
    </mdui-list>

    <div v-if="!fileStore.loading && fileStore.files.length === 0" class="empty-state">
      No files found in this directory.
    </div>

    <mdui-snackbar v-if="fileStore.error" open>
      {{ fileStore.error }}
    </mdui-snackbar>
  </div>
</template>

<style scoped>
.file-browser {
  padding: 8px;
}
.empty-state {
  text-align: center;
  padding: 32px;
  opacity: 0.6;
}
.back-item {
  opacity: 0.8;
}
</style>
