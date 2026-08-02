<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, defineAsyncComponent } from 'vue';
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
import '@mdui/icons/add.js';
import '@mdui/icons/remove.js';

const fileStore = useFileStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const drawerOpen = ref(false);
const settingsDialogOpen = ref(false);
const editorSidebarOpen = ref(false);
const fileSelectionCount = ref(0);

const openSettings = () => {
  settingsDialogOpen.value = true;
  drawerOpen.value = false;
};

const openEditorSettings = () => {
  editorSidebarOpen.value = false;
  openSettings();
};

const handleSort = (by: 'name' | 'mtime' | 'size') => {
  console.log('Sorting by:', by);
  fileStore.setSort(by);
};

// Track transition direction
const transitionName = ref('slide-right');

const showLogin = computed(() => {
  return fileStore.authEnabled && !authStore.isAuthenticated;
});

const handlePopState = () => {
  void fileStore.handleUrl();
};

const handleAuthError = () => {
  authStore.logout();
};

const handleNoteLink = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest('a');
  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (href && href.startsWith('@')) {
    e.preventDefault();
    const filePath = href.substring(1);
    const segments = filePath.split('/');
    const name = segments[segments.length - 1];
    void fileStore.openFile({
      name,
      path: filePath,
      type: 'file',
      size: 0,
      mtime: new Date().toISOString()
    });
  }
};

onMounted(async () => {
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('auth-error', handleAuthError);
  window.addEventListener('click', handleNoteLink);

  fileStore.init();
  await settingsStore.loadSettings();
  settingsStore.applyTheme();
  await fileStore.fetchStatus();
  if (!showLogin.value) {
    await fileStore.handleUrl();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState);
  window.removeEventListener('auth-error', handleAuthError);
  window.removeEventListener('click', handleNoteLink);
  fileStore.dispose();
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
  editorSidebarOpen.value = false;
  if (isEditing) {
    fileSelectionCount.value = 0;
  }
});

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const handleEditorLeadingAction = () => {
  if (editorSidebarOpen.value) {
    fileStore.closeEditor();
    return;
  }

  editorSidebarOpen.value = true;
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
    <mdui-top-app-bar
      class="app-top-bar"
      :class="{ 'editor-sidebar-open': fileStore.isEditing && editorSidebarOpen }"
      style="height: 56px;"
    >
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
        class="editor-sidebar-button"
        @click="handleEditorLeadingAction"
        style="--mdui-button-icon-size: 40px;"
        :aria-label="editorSidebarOpen ? 'Back to file list' : 'Open file sidebar'"
      >
        <mdui-icon-arrow-back v-if="editorSidebarOpen"></mdui-icon-arrow-back>
        <mdui-icon-menu v-else></mdui-icon-menu>
      </mdui-button-icon>
      
      <div class="top-bar-content">
        <div v-if="!fileStore.isEditing && fileSelectionCount > 0" class="selection-title">
          {{ fileSelectionCount }} Selected
        </div>
        <Breadcrumbs v-else-if="!fileStore.isEditing" />
        <div v-else class="editor-title">{{ fileStore.currentFile?.name }}</div>
      </div>

      <div id="top-bar-actions" class="top-bar-actions">
        <mdui-dropdown v-if="!fileStore.isEditing && fileSelectionCount === 0" placement="bottom-end">
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

        <mdui-list-item @click="openSettings">
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

    <!-- Settings Dialog -->
    <mdui-dialog 
      :open="settingsDialogOpen" 
      @overlay-click="settingsDialogOpen = false" 
      headline="Settings"
      style="max-width: 500px;"
    >
      <div class="settings-dialog-content">
        <div class="settings-section">
          <div class="settings-section-title">Appearance</div>
          <div class="settings-row">
            <span class="settings-label">Theme</span>
            <mdui-segmented-button-group 
              :value="settingsStore.theme" 
              @change="(e: any) => settingsStore.setTheme(e.target.value)"
              class="theme-segmented-group"
            >
              <mdui-segmented-button value="light">Light</mdui-segmented-button>
              <mdui-segmented-button value="dark">Dark</mdui-segmented-button>
              <mdui-segmented-button value="auto">Auto</mdui-segmented-button>
            </mdui-segmented-button-group>
          </div>
        </div>

        <mdui-divider style="margin: 16px 0;"></mdui-divider>

        <div class="settings-section">
          <div class="settings-section-title">Editor</div>
          <div class="settings-row">
            <div class="editor-setting-copy">
              <span class="settings-label">Font size</span>
              <span class="settings-value">12–24 px</span>
            </div>
            <div class="font-size-stepper">
              <mdui-button-icon
                aria-label="Decrease editor font size"
                :disabled="settingsStore.editorFontSize <= 12"
                @click="settingsStore.setEditorFontSize(settingsStore.editorFontSize - 1)"
              >
                <mdui-icon-remove></mdui-icon-remove>
              </mdui-button-icon>
              <input
                class="font-size-input"
                type="number"
                min="12"
                max="24"
                step="1"
                :value="settingsStore.editorFontSize"
                aria-label="Editor font size"
                @change="(e: any) => settingsStore.setEditorFontSize(Number(e.target.value))"
              />
              <span class="font-size-unit">px</span>
              <mdui-button-icon
                aria-label="Increase editor font size"
                :disabled="settingsStore.editorFontSize >= 24"
                @click="settingsStore.setEditorFontSize(settingsStore.editorFontSize + 1)"
              >
                <mdui-icon-add></mdui-icon-add>
              </mdui-button-icon>
            </div>
          </div>
          <div class="settings-row">
            <div class="editor-setting-copy">
              <span class="settings-label">Word wrap</span>
              <span class="settings-value">Wrap long lines in the editor</span>
            </div>
            <mdui-switch
              :checked="settingsStore.wordWrap"
              aria-label="Word wrap"
              @change="(e: any) => settingsStore.setWordWrap(Boolean(e.target.checked))"
            ></mdui-switch>
          </div>
        </div>

        <mdui-divider style="margin: 16px 0;"></mdui-divider>

        <div class="settings-section">
          <div class="settings-section-title">AI Assistant</div>
          <div class="settings-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
            <span class="settings-label">Custom AI Instructions</span>
            <mdui-text-field
              label="System instructions to customize AI edits"
              rows="4"
              area
              :value="settingsStore.aiInstructions"
              @input="(e: any) => settingsStore.setAiInstructions(e.target.value)"
              helper="e.g. 'Use British English', 'Avoid passive voice'"
              variant="outlined"
            ></mdui-text-field>
          </div>
        </div>
      </div>
      <mdui-button slot="action" variant="text" @click="settingsDialogOpen = false">Close</mdui-button>
    </mdui-dialog>

    <mdui-layout-main class="main-content">
      <Transition :name="transitionName">
        <div v-if="!fileStore.isEditing" class="view-container">
          <FileBrowser @selection-change="fileSelectionCount = $event" />
        </div>
        <div v-else class="view-container">
          <Editor
            v-model:sidebar-open="editorSidebarOpen"
            @open-settings="openEditorSettings"
          />
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
.app-top-bar.editor-sidebar-open {
  z-index: 1000;
  background: transparent;
  box-shadow: none;
}
.app-top-bar.editor-sidebar-open .top-bar-actions,
.app-top-bar.editor-sidebar-open .offline-icon {
  visibility: hidden;
  pointer-events: none;
}
.app-top-bar.editor-sidebar-open .editor-sidebar-button,
.app-top-bar.editor-sidebar-open .editor-title {
  position: relative;
  z-index: 1;
}
.top-bar-actions {
  display: flex;
  align-items: center;
  height: 40px;
  flex-shrink: 0;
}
.editor-title {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 1.25;
  font-size: 16px;
  font-weight: 400;
  margin-left: 4px;
}
.selection-title {
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
  color: #CDDC39;
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

.settings-dialog-content {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #CDDC39;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.settings-label {
  font-size: 14px;
  color: rgb(var(--mdui-color-on-surface));
}
.editor-setting-copy {
  min-width: 110px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.settings-value {
  font-size: 12px;
  color: rgb(var(--mdui-color-on-surface-variant));
}
.font-size-stepper {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 4px;
  padding: 2px 4px;
  border: 1px solid rgb(var(--mdui-color-outline-variant));
  border-radius: 20px;
}
.font-size-stepper mdui-button-icon {
  --mdui-button-icon-size: 32px;
}
.font-size-input {
  width: 38px;
  padding: 4px 2px;
  border: 0;
  border-bottom: 1px solid rgb(var(--mdui-color-outline));
  outline: none;
  background: transparent;
  color: rgb(var(--mdui-color-on-surface));
  font: inherit;
  text-align: center;
  appearance: textfield;
}
.font-size-input::-webkit-inner-spin-button,
.font-size-input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}
.font-size-unit {
  margin-left: -2px;
  font-size: 12px;
  color: rgb(var(--mdui-color-on-surface-variant));
}
.theme-segmented-group {
  --mdui-segmented-button-height: 36px;
}
</style>
