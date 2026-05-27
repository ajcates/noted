<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/stores/fileStore';

import '@mdui/icons/folder.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/add.js';
import '@mdui/icons/note-add.js';
import '@mdui/icons/create-new-folder.js';
import '@mdui/icons/more-vert.js';
import '@mdui/icons/edit.js';
import '@mdui/icons/delete.js';
import '@mdui/icons/sort.js';
import '@mdui/icons/arrow-upward.js';
import '@mdui/icons/arrow-downward.js';

const fileStore = useFileStore();
const { sortedFiles } = storeToRefs(fileStore);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Dialog & Input states
const createDialogOpen = ref(false);
const createType = ref<'file' | 'directory'>('file');
const createName = ref('');

const renameDialogOpen = ref(false);
const renameOldPath = ref('');
const renameNewName = ref('');

onMounted(() => {
  fileStore.fetchFiles(fileStore.currentPath);
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

const openCreateDialog = (type: 'file' | 'directory') => {
  createType.value = type;
  createName.value = '';
  createDialogOpen.value = true;
};

const confirmCreate = async () => {
  if (createName.value.trim()) {
    await fileStore.createFile(createName.value.trim(), createType.value);
    createDialogOpen.value = false;
  }
};

const openRenameDialog = (entry: any) => {
  renameOldPath.value = entry.path;
  renameNewName.value = entry.name;
  renameDialogOpen.value = true;
};

const confirmRename = async () => {
  if (renameNewName.value.trim() && renameNewName.value !== renameOldPath.value.split('/').pop()) {
    await fileStore.renameEntry(renameOldPath.value, renameNewName.value.trim());
    renameDialogOpen.value = false;
  }
};

const deleteSnackbarOpen = ref(false);
const deletedFileName = ref('');

const handleDelete = async (entry: any) => {
  deletedFileName.value = entry.name;
  deleteSnackbarOpen.value = true;
  await fileStore.deleteEntryWithUndo(entry);
};

const undoDelete = () => {
  fileStore.cancelDelete();
  deleteSnackbarOpen.value = false;
};
</script>

<template>
  <div class="file-browser">
    <mdui-linear-progress v-if="fileStore.loading"></mdui-linear-progress>
    
    <div class="list-surface">
      <mdui-list style="background-color: transparent;">
        <mdui-list-item 
          v-if="fileStore.currentPath !== '.'" 
          @click="goBack"
          class="back-item"
          ripple
        >
          <mdui-icon-arrow-back slot="icon"></mdui-icon-arrow-back>
          ..
        </mdui-list-item>

        <mdui-list-item 
          v-for="file in sortedFiles" 
          :key="file.path"
          @click="handleEntryClick(file)"
          ripple
        >
          <mdui-icon-folder v-if="file.type === 'directory'" slot="icon"></mdui-icon-folder>
          <mdui-icon-insert-drive-file v-else slot="icon"></mdui-icon-insert-drive-file>
          
          {{ file.name }}
          
          <div slot="description">
            <span v-if="file.type === 'file'">{{ (file.size / 1024).toFixed(2) }} KB • </span>
            <span>{{ formatDate(file.mtime) }}</span>
          </div>

          <mdui-dropdown v-if="!fileStore.readonly" slot="end-icon" @click.stop>
            <mdui-button-icon slot="trigger">
              <mdui-icon-more-vert></mdui-icon-more-vert>
            </mdui-button-icon>
            <mdui-menu>
              <mdui-menu-item @click="openRenameDialog(file)">
                <mdui-icon-edit slot="icon"></mdui-icon-edit>
                Rename
              </mdui-menu-item>
              <mdui-menu-item @click="handleDelete(file)" class="delete-item">
                <mdui-icon-delete slot="icon"></mdui-icon-delete>
                Delete
              </mdui-menu-item>
            </mdui-menu>
          </mdui-dropdown>
        </mdui-list-item>
      </mdui-list>
    </div>

    <div v-if="!fileStore.loading && fileStore.files.length === 0" class="empty-state">
      No files found in this directory.
    </div>

    <!-- FAB for Creation -->
    <div v-if="!fileStore.readonly" class="fab-container">
      <mdui-dropdown placement="top-end">
        <mdui-fab slot="trigger" icon="add" extended style="background-color: #CDDC39; color: black;">
          <mdui-icon-add slot="icon"></mdui-icon-add>
          Create
        </mdui-fab>
        <mdui-menu>
          <mdui-menu-item @click="openCreateDialog('file')">
            <mdui-icon-note-add slot="icon"></mdui-icon-note-add>
            New File
          </mdui-menu-item>
          <mdui-menu-item @click="openCreateDialog('directory')">
            <mdui-icon-create-new-folder slot="icon"></mdui-icon-create-new-folder>
            New Folder
          </mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>
    </div>

    <!-- Create Dialog -->
    <mdui-dialog 
      :open="createDialogOpen" 
      @overlay-click="createDialogOpen = false"
      :headline="createType === 'file' ? 'New File' : 'New Folder'"
    >
      <mdui-text-field 
        v-model="createName" 
        :label="createType === 'file' ? 'File Name' : 'Folder Name'"
        autofocus
        @keyup.enter="confirmCreate"
      ></mdui-text-field>
      <mdui-button slot="action" variant="text" @click="createDialogOpen = false">Cancel</mdui-button>
      <mdui-button slot="action" variant="filled" @click="confirmCreate">Create</mdui-button>
    </mdui-dialog>

    <!-- Rename Dialog -->
    <mdui-dialog 
      :open="renameDialogOpen" 
      @overlay-click="renameDialogOpen = false"
      headline="Rename"
    >
      <mdui-text-field 
        v-model="renameNewName" 
        label="New Name"
        autofocus
        @keyup.enter="confirmRename"
      ></mdui-text-field>
      <mdui-button slot="action" variant="text" @click="renameDialogOpen = false">Cancel</mdui-button>
      <mdui-button slot="action" variant="filled" @click="confirmRename">Rename</mdui-button>
    </mdui-dialog>

    <mdui-snackbar 
      :open="deleteSnackbarOpen" 
      @closed="deleteSnackbarOpen = false"
    >
      Deleted {{ deletedFileName }}
      <mdui-button slot="action" variant="text" @click="undoDelete">Undo</mdui-button>
    </mdui-snackbar>

    <mdui-snackbar v-if="fileStore.error" open @closed="fileStore.error = null">
      {{ fileStore.error }}
    </mdui-snackbar>
  </div>
</template>

<style scoped>
.file-browser {
  padding: 16px;
  padding-bottom: 72px; /* Space for FAB */
  position: relative;
  min-height: calc(100dvh - 56px);
  background-color: rgb(var(--mdui-color-surface));
}
.list-surface {
  background-color: rgb(var(--mdui-color-surface-container-highest));
  border-radius: 16px;
  box-shadow: var(--mdui-elevation-level2);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.empty-state {
  text-align: center;
  padding: 48px 32px;
  opacity: 0.6;
  font-size: 14px;
}
.back-item {
  opacity: 0.8;
}
.fab-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}
.delete-item {
  color: rgb(var(--mdui-color-error));
}

mdui-list-item {
  --mdui-list-item-height: 48px;
  font-size: 14px;
}

mdui-menu-item {
  --mdui-menu-item-height: 40px;
  font-size: 14px;
  line-height: 40px;
  display: flex;
  align-items: center;
}

/* Ensure MDUI menu item inner parts don't clip */
mdui-menu-item::part(label) {
  line-height: 1.2;
  padding: 4px 0;
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
