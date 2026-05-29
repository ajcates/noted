<script setup lang="ts">
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import Login from '@/components/Login.vue';
import ConflictResolver from '@/components/ConflictResolver.vue';

const FileBrowser = defineAsyncComponent(() => import('@/components/FileBrowser.vue'));
const Editor = defineAsyncComponent(() => import('@/components/Editor.vue'));

import '@mdui/icons/menu.js';
import '@mdui/icons/history.js';
import '@mdui/icons/settings.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/logout.js';
import '@mdui/icons/cloud-off.js';
import '@mdui/icons/sort.js';
import '@mdui/icons/arrow-upward.js';
import '@mdui/icons/arrow-downward.js';

const fileStore = useFileStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const drawerOpen = ref(false);

const handleSort = (by: 'name' | 'mtime' | 'size') => {
  console.log('Sorting by:', by);
  fileStore.setSort(by);
};

// Track transition direction
const transitionName = ref('slide-right');

const showLogin = computed(() => {
  return fileStore.authEnabled && !authStore.isAuthenticated;
});

onMounted(async () => {
  fileStore.init();
  settingsStore.applyTheme();
  await fileStore.fetchStatus();
  if (!showLogin.value) {
    await fileStore.handleUrl();
  }

  window.addEventListener('popstate', () => {
    fileStore.handleUrl();
  });

  window.addEventListener('auth-error', () => {
    authStore.logout();
  });
});

// Re-handle URL when authenticated
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await fileStore.handleUrl();
  }
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
      <mdui-button-icon 
        v-if="!fileStore.isEditing" 
        @click="toggleDrawer" 
        style="--mdui-button-icon-size: 40px;"
        aria-label="Open menu"
      >
        <mdui-icon-menu></mdui-icon-menu>
      </mdui-button-icon>
      <mdui-button-icon 
        v-else 
        @click="closeEditor" 
        style="--mdui-button-icon-size: 40px;"
        aria-label="Back to file list"
      >
        <mdui-icon-arrow-back></mdui-icon-arrow-back>
      </mdui-button-icon>
      
      <div class="top-bar-content">
        <Breadcrumbs v-if="!fileStore.isEditing" />
        <div v-else class="editor-title">{{ fileStore.currentFile?.name }}</div>
      </div>

      <div id="top-bar-actions" class="top-bar-actions">
        <mdui-dropdown v-if="!fileStore.isEditing" placement="bottom-end">
          <mdui-button-icon slot="trigger" mdui-tooltip="Sort">
            <mdui-icon-sort></mdui-icon-sort>
          </mdui-button-icon>
          <mdui-menu :value="fileStore.sortBy">
            <mdui-menu-item value="name" ripple :selected="fileStore.sortBy === 'name'" @click.stop="fileStore.setSort('name')">
              Name
              <mdui-icon-arrow-upward v-if="fileStore.sortBy === 'name' && !fileStore.sortDesc" slot="end-icon"></mdui-icon-arrow-upward>
              <mdui-icon-arrow-downward v-if="fileStore.sortBy === 'name' && fileStore.sortDesc" slot="end-icon"></mdui-icon-arrow-downward>
            </mdui-menu-item>
            <mdui-menu-item value="mtime" ripple :selected="fileStore.sortBy === 'mtime'" @click.stop="fileStore.setSort('mtime')">
              Date
              <mdui-icon-arrow-upward v-if="fileStore.sortBy === 'mtime' && !fileStore.sortDesc" slot="end-icon"></mdui-icon-arrow-upward>
              <mdui-icon-arrow-downward v-if="fileStore.sortBy === 'mtime' && fileStore.sortDesc" slot="end-icon"></mdui-icon-arrow-downward>
            </mdui-menu-item>
            <mdui-menu-item value="size" ripple :selected="fileStore.sortBy === 'size'" @click.stop="fileStore.setSort('size')">
              Size
              <mdui-icon-arrow-upward v-if="fileStore.sortBy === 'size' && !fileStore.sortDesc" slot="end-icon"></mdui-icon-arrow-upward>
              <mdui-icon-arrow-downward v-if="fileStore.sortBy === 'size' && fileStore.sortDesc" slot="end-icon"></mdui-icon-arrow-downward>
            </mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>
      </div>

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

        <mdui-divider></mdui-divider>
        <mdui-list-subheader>AI Settings</mdui-list-subheader>
        <div style="padding: 0 16px 16px 16px;">
          <mdui-text-field
            label="Custom AI Instructions"
            rows="3"
            area
            :value="settingsStore.aiInstructions"
            @input="(e: any) => settingsStore.setAiInstructions(e.target.value)"
            helper="e.g. 'Use British English', 'Be concise'"
          ></mdui-text-field>
        </div>

        <mdui-divider></mdui-divider>
        <mdui-list-subheader>Theme</mdui-list-subheader>
        <mdui-segmented-button-group 
          :value="settingsStore.theme" 
          @change="(e: any) => settingsStore.setTheme(e.target.value)"
          style="margin: 0 16px 16px 16px;"
        >
          <mdui-segmented-button value="light">Light</mdui-segmented-button>
          <mdui-segmented-button value="dark">Dark</mdui-segmented-button>
          <mdui-segmented-button value="auto">Auto</mdui-segmented-button>
        </mdui-segmented-button-group>

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
