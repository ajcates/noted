<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import { useAuthStore } from '@/stores/authStore';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import FileBrowser from '@/components/FileBrowser.vue';
import Editor from '@/components/Editor.vue';
import Login from '@/components/Login.vue';
import ConflictResolver from '@/components/ConflictResolver.vue';

import '@mdui/icons/menu.js';
import '@mdui/icons/history.js';
import '@mdui/icons/settings.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/logout.js';
import '@mdui/icons/cloud-off.js';

const fileStore = useFileStore();
const authStore = useAuthStore();
const drawerOpen = ref(false);

// Track transition direction
const transitionName = ref('slide-right');

const showLogin = computed(() => {
  return fileStore.authEnabled && !authStore.isAuthenticated;
});

onMounted(async () => {
  fileStore.init();
  await fileStore.fetchStatus();
  if (!showLogin.value) {
    fileStore.fetchFiles();
  }

  window.addEventListener('auth-error', () => {
    authStore.logout();
  });
});

// Watch isEditing to determine slide direction
watch(() => fileStore.isEditing, (isEditing) => {
  transitionName.value = isEditing ? 'slide-right' : 'slide-left';
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

const handleLogout = () => {
  authStore.logout();
  drawerOpen.value = false;
};

const buildNumber = __BUILD_NUMBER__;
</script>

<template>
  <template v-if="showLogin">
    <Login />
  </template>
  
  <mdui-layout v-else>
    <mdui-top-app-bar style="height: 56px;">
      <mdui-button-icon v-if="!fileStore.isEditing" @click="toggleDrawer" style="--mdui-button-icon-size: 40px;">
        <mdui-icon-menu></mdui-icon-menu>
      </mdui-button-icon>
      <mdui-button-icon v-else @click="closeEditor" style="--mdui-button-icon-size: 40px;">
        <mdui-icon-arrow-back></mdui-icon-arrow-back>
      </mdui-button-icon>
      
      <div class="top-bar-content">
        <Breadcrumbs v-if="!fileStore.isEditing" />
        <div v-else class="editor-title">{{ fileStore.currentFile?.name }}</div>
      </div>

      <div id="top-bar-actions" class="top-bar-actions"></div>

      <mdui-button-icon v-if="!fileStore.isOnline" class="offline-icon" mdui-tooltip="Offline" style="--mdui-button-icon-size: 40px;">
        <mdui-icon-cloud-off></mdui-icon-cloud-off>
      </mdui-button-icon>
    </mdui-top-app-bar>

    <mdui-navigation-drawer :open="drawerOpen" @overlay-click="drawerOpen = false" style="background-color: #2c2c2c;">
      <mdui-list style="background-color: transparent;">
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

        <mdui-list-item v-if="fileStore.authEnabled" @click="handleLogout">
          <mdui-icon-logout slot="icon"></mdui-icon-logout>
          Logout
        </mdui-list-item>

        <div class="build-number">Build: {{ buildNumber }}</div>
      </mdui-list>
    </mdui-navigation-drawer>

    <mdui-layout-main class="main-content">
      <Transition :name="transitionName">
        <div v-if="!fileStore.isEditing" class="view-container">
          <FileBrowser />
        </div>
        <div v-else class="view-container">
          <Editor />
        </div>
      </Transition>
    </mdui-layout-main>

    <ConflictResolver 
      v-if="fileStore.conflict"
      :file-name="fileStore.currentFile?.name || ''"
      :server-content="fileStore.conflict.serverContent"
      :local-content="fileStore.conflict.localContent"
      @resolve="fileStore.resolveConflict"
    />
  </mdui-layout>
</template>

<style>
.top-bar-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
  margin-left: 4px;
  height: 100%;
}
.top-bar-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.editor-title {
  font-size: 16px;
  font-weight: 400;
  margin-left: 4px;
}
.build-number {
  padding: 8px 16px;
  opacity: 0.5;
  font-size: 10px;
  text-align: right;
  color: rgb(var(--mdui-color-on-surface-variant));
}
.offline-icon {
  color: rgb(var(--mdui-color-error));
  margin-right: 4px;
}
.subheader-icon {
  font-size: 16px;
  margin-right: 8px;
  vertical-align: middle;
}
.drawer-empty {
  padding: 12px 16px;
  opacity: 0.5;
  font-size: 12px;
}

.main-content {
  height: calc(100dvh - 56px);
  margin-top: 56px;
  overflow: hidden; /* Prevent scrollbars during transition */
  position: relative;
  background-color: rgb(var(--mdui-color-background));
}

.view-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

/* Slide Right Transition (Opening Editor) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0.5;
}
.slide-right-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

/* Slide Left Transition (Closing Editor) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0.5;
}
.slide-left-leave-to {
  transform: translateX(30%);
  opacity: 0;
}
</style>
