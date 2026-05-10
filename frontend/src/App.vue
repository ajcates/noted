<script setup lang="ts">
import { ref } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import FileBrowser from '@/components/FileBrowser.vue';

import '@mdui/icons/menu.js';
import '@mdui/icons/history.js';
import '@mdui/icons/settings.js';
import '@mdui/icons/insert-drive-file.js';

const fileStore = useFileStore();
const drawerOpen = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const openRecent = (file: any) => {
  fileStore.addToRecent(file);
  // TODO: Open editor
  console.log('Open recent file:', file.path);
  drawerOpen.value = false;
};
</script>

<template>
  <mdui-layout>
    <mdui-top-app-bar>
      <mdui-button-icon @click="toggleDrawer">
        <mdui-icon-menu></mdui-icon-menu>
      </mdui-button-icon>
      <div class="top-bar-content">
        <Breadcrumbs />
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
      <FileBrowser />
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
