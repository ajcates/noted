<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import FileBrowser from '@/components/FileBrowser.vue';
import Editor from '@/components/Editor.vue';

import '@mdui/icons/menu.js';
import '@mdui/icons/history.js';
import '@mdui/icons/settings.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';

const fileStore = useFileStore();
const drawerOpen = ref(false);

onMounted(() => {
  fileStore.fetchStatus();
});

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeEditor = () => {
  fileStore.closeEditor();
};

const openRecent = (file: any) => {
  fileStore.openFile(file);
  drawerOpen.value = false;
};
</script>

<template>
  <mdui-layout>
    <mdui-top-app-bar>
      <mdui-button-icon v-if="!fileStore.isEditing" @click="toggleDrawer">
        <mdui-icon-menu></mdui-icon-menu>
      </mdui-button-icon>
      <mdui-button-icon v-else @click="closeEditor">
        <mdui-icon-arrow-back></mdui-icon-arrow-back>
      </mdui-button-icon>
      
      <div class="top-bar-content">
        <Breadcrumbs v-if="!fileStore.isEditing" />
        <div v-else class="editor-title">{{ fileStore.currentFile?.name }}</div>
      </div>
    </mdui-top-app-bar>

    <mdui-navigation-drawer :open="drawerOpen" @overlay-click="drawerOpen = false">
      <mdui-list>
        <mdui-list-subheader>
          <mdui-icon-history class="subheader-icon"></mdui-icon-history>
          Recent Files
        </mdui-list-subheader>
        
        <mdui-list-item 
          v-for="file in fileStore.recentFiles" 
          :key="file.path"
          @click="openRecent(file)"
        >
          <mdui-icon-insert-drive-file slot="icon"></mdui-icon-insert-drive-file>
          {{ file.name }}
        </mdui-list-item>

        <div v-if="fileStore.recentFiles.length === 0" class="drawer-empty">
          No recent files
        </div>

        <mdui-divider></mdui-divider>

        <mdui-list-item>
          <mdui-icon-settings slot="icon"></mdui-icon-settings>
          Settings
        </mdui-list-item>
      </mdui-list>
    </mdui-navigation-drawer>

    <mdui-layout-main>
      <FileBrowser v-if="!fileStore.isEditing" />
      <Editor v-else />
    </mdui-layout-main>
  </mdui-layout>
</template>

<style>
.top-bar-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
  margin-left: 8px;
}
.editor-title {
  font-size: 18px;
  font-weight: bold;
}
.subheader-icon {
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}
.drawer-empty {
  padding: 16px;
  opacity: 0.5;
  font-size: 14px;
}
mdui-layout-main {
  min-height: calc(100vh - 64px);
}
</style>
