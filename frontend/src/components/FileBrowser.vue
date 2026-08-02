<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/stores/fileStore';
import debounce from 'lodash/debounce';

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
import '@mdui/icons/search.js';
import '@mdui/icons/close.js';
import '@mdui/icons/drive-file-move.js';
import '@mdui/icons/check-box.js';
import '@mdui/icons/check-box-outline-blank.js';
import '@mdui/icons/checklist.js';

const fileStore = useFileStore();
const { sortedFiles } = storeToRefs(fileStore);
const emit = defineEmits<{
  'selectionChange': [count: number];
}>();

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
const selectedEntries = ref<any[]>([]);
const selectionCount = computed(() => selectedEntries.value.length);
const moveSnackbarOpen = ref(false);
const movingEntry = ref<any | null>(null);
const moveQueue = ref<any[]>([]);
const moveTotalCount = ref(0);
const moveRenameDialogOpen = ref(false);
const moveRenameName = ref('');
const moveDestinationPath = ref('.');
const currentDirectoryName = computed(() => {
  if (fileStore.currentPath === '.') return 'Workspace';
  return fileStore.currentPath.split('/').filter(Boolean).pop() || 'Workspace';
});
const moveSnackbarLabel = computed(() => {
  if (moveTotalCount.value > 1) return `Move ${moveTotalCount.value} selected to`;
  return `Move ${movingEntry.value?.name || ''} to`;
});

watch(selectionCount, count => emit('selectionChange', count), { immediate: true });
onBeforeUnmount(() => emit('selectionChange', 0));

const isSelected = (entry: any) =>
  selectedEntries.value.some(selected => selected.path === entry.path);

const toggleSelection = (entry: any) => {
  if (isSelected(entry)) {
    selectedEntries.value = selectedEntries.value.filter(selected => selected.path !== entry.path);
  } else {
    selectedEntries.value = [...selectedEntries.value, entry];
  }
};

const clearSelection = () => {
  selectedEntries.value = [];
};

const handleEntryClick = (entry: any) => {
  if (selectionCount.value > 0 && !moveSnackbarOpen.value) {
    toggleSelection(entry);
    return;
  }

  if (entry.type === 'directory') {
    fileStore.navigate(entry.path);
  } else {
    fileStore.openFile(entry);
  }
};

const goBack = () => {
  if (!moveSnackbarOpen.value) {
    clearSelection();
  }
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

const beginMove = (entries: any[]) => {
  if (entries.length === 0) return;
  moveQueue.value = [...entries];
  moveTotalCount.value = entries.length;
  movingEntry.value = moveQueue.value[0];
  moveSnackbarOpen.value = true;
};

const startMove = (entry: any) => beginMove([entry]);
const startSelectedMove = () => beginMove(selectedEntries.value);

const cancelMove = () => {
  moveSnackbarOpen.value = false;
  moveRenameDialogOpen.value = false;
  movingEntry.value = null;
  moveQueue.value = [];
  moveTotalCount.value = 0;
};

const copyNameFor = (name: string) => {
  const extensionIndex = name.lastIndexOf('.');
  if (extensionIndex <= 0) return `${name} copy`;
  return `${name.slice(0, extensionIndex)} copy${name.slice(extensionIndex)}`;
};

const openMoveRenameDialog = () => {
  if (!movingEntry.value) return;
  moveDestinationPath.value = fileStore.currentPath;
  moveRenameName.value = copyNameFor(movingEntry.value.name);
  moveRenameDialogOpen.value = true;
  fileStore.error = null;
};

const removeMovedSelection = (entry: any) => {
  selectedEntries.value = selectedEntries.value.filter(selected => selected.path !== entry.path);
};

const continueMoveQueue = async () => {
  while (moveQueue.value.length > 0) {
    movingEntry.value = moveQueue.value[0];
    const destinationHasConflict = fileStore.files.some(file =>
      file.name === movingEntry.value.name && file.path !== movingEntry.value.path
    );
    if (destinationHasConflict) {
      openMoveRenameDialog();
      return;
    }

    const result = await fileStore.moveEntry(
      movingEntry.value,
      moveDestinationPath.value
    );
    if (result === 'conflict') {
      openMoveRenameDialog();
      return;
    }
    if (result !== 'moved') return;

    const movedEntry = moveQueue.value.shift();
    removeMovedSelection(movedEntry);
  }

  cancelMove();
};

const confirmMove = async () => {
  if (!movingEntry.value) return;
  moveDestinationPath.value = fileStore.currentPath;
  await continueMoveQueue();
};

const deleteSelected = async () => {
  const entries = [...selectedEntries.value];
  if (entries.length === 0) return;

  deletedFileName.value = entries.length === 1 ? entries[0].name : `${entries.length} items`;
  deleteSnackbarOpen.value = true;
  clearSelection();
  await fileStore.deleteEntriesWithUndo(entries);
};

const handleRenamedMoveSuccess = async () => {
  const movedEntry = moveQueue.value.shift();
  removeMovedSelection(movedEntry);
  moveRenameDialogOpen.value = false;
  if (moveQueue.value.length === 0) {
    cancelMove();
  } else {
    await continueMoveQueue();
  }
};

const confirmRenamedMove = async () => {
  const name = moveRenameName.value.trim();
  if (!movingEntry.value || !name) return;

  const result = await fileStore.moveEntry(
    movingEntry.value,
    moveDestinationPath.value,
    name
  );
  if (result === 'moved') {
    await handleRenamedMoveSuccess();
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

const searchQuery = ref('');
const searchVisible = ref(false);
const searchInputRef = ref<any>(null);

watch(searchVisible, (visible) => {
  if (!visible) {
    searchQuery.value = '';
    fileStore.searchResults = [];
  } else {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

const onSearchInput = debounce((query: string) => {
  fileStore.searchFiles(query);
}, 300);

const openSearchResult = (path: string) => {
  fileStore.openFile({ path, name: path.split('/').pop() || '', type: 'file', size: 0, mtime: '' });
  searchQuery.value = '';
  fileStore.searchResults = [];
};

const isFabOpen = ref(false);
</script>

<template>
  <div class="file-browser">
    <mdui-linear-progress v-if="fileStore.loading || fileStore.isSearching"></mdui-linear-progress>
    
    <Teleport to="#top-bar-actions">
      <mdui-button-icon 
        v-if="selectionCount === 0"
        @click="searchVisible = !searchVisible"
        tooltip="Find"
        style="color: #CDDC39; --mdui-button-icon-size: 40px;"
      >
        <mdui-icon-search v-if="!searchVisible"></mdui-icon-search>
        <mdui-icon-close v-else></mdui-icon-close>
      </mdui-button-icon>

      <mdui-dropdown v-else placement="bottom-end">
        <mdui-button-icon
          slot="trigger"
          tooltip="Selected file actions"
          aria-label="Selected file actions"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
        >
          <mdui-icon-more-vert></mdui-icon-more-vert>
        </mdui-button-icon>
        <mdui-menu>
          <mdui-menu-item @click="startSelectedMove">
            <mdui-icon-drive-file-move slot="icon"></mdui-icon-drive-file-move>
            Move to...
          </mdui-menu-item>
          <mdui-menu-item class="delete-item" @click="deleteSelected">
            <mdui-icon-delete slot="icon"></mdui-icon-delete>
            Delete
          </mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>
    </Teleport>

    <!-- Global Search -->
    <div v-if="searchVisible" class="search-section">
      <mdui-text-field
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="Search all notes..."
        variant="outlined"
        class="search-input"
        @input="(e: any) => onSearchInput(e.target.value)"
      >
        <mdui-icon-search slot="icon"></mdui-icon-search>
        <mdui-button-icon v-if="searchQuery" slot="end-icon" @click="searchQuery = ''; fileStore.searchResults = []">
          <mdui-icon-close></mdui-icon-close>
        </mdui-button-icon>
      </mdui-text-field>
    </div>
    
    <!-- Search Results -->
    <div v-if="searchQuery" class="list-surface results-surface">
      <mdui-list v-if="fileStore.searchResults.length > 0">
        <mdui-list-item 
          v-for="result in fileStore.searchResults" 
          :key="result.path"
          @click="openSearchResult(result.path)"
          ripple
        >
          <mdui-icon-insert-drive-file slot="icon"></mdui-icon-insert-drive-file>
          {{ result.name }}
          <div slot="description" class="search-snippet">{{ result.snippet }}</div>
        </mdui-list-item>
      </mdui-list>
      <div v-else-if="!fileStore.isSearching" class="empty-state">
        No matches found for "{{ searchQuery }}"
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="fileStore.loading && fileStore.files.length === 0" class="list-surface">
      <mdui-list style="background-color: transparent;">
        <mdui-list-item v-for="i in 5" :key="i">
          <div slot="icon" class="skeleton-icon"></div>
          <div class="skeleton-text skeleton-title"></div>
          <div slot="description" class="skeleton-text skeleton-desc"></div>
        </mdui-list-item>
      </mdui-list>
    </div>

    <div v-else class="list-surface">
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
          :class="{ 'selected-entry': isSelected(file) }"
          ripple
        >
          <template v-if="selectionCount > 0">
            <mdui-icon-check-box
              v-if="isSelected(file)"
              slot="icon"
              class="selection-icon"
              @click.stop="toggleSelection(file)"
            ></mdui-icon-check-box>
            <mdui-icon-check-box-outline-blank
              v-else
              slot="icon"
              class="selection-icon"
              @click.stop="toggleSelection(file)"
            ></mdui-icon-check-box-outline-blank>
          </template>
          <mdui-icon-folder v-else-if="file.type === 'directory'" slot="icon"></mdui-icon-folder>
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
              <mdui-menu-item @click="toggleSelection(file)">
                <mdui-icon-checklist slot="icon"></mdui-icon-checklist>
                {{ isSelected(file) ? 'Deselect' : 'Select' }}
              </mdui-menu-item>
              <mdui-menu-item @click="startMove(file)">
                <mdui-icon-drive-file-move slot="icon"></mdui-icon-drive-file-move>
                Move
              </mdui-menu-item>
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
    <div v-if="!fileStore.readonly && selectionCount === 0" class="fab-container">
      <mdui-dropdown placement="top-end" @open="isFabOpen = true" @close="isFabOpen = false">
        <mdui-fab 
          slot="trigger" 
          :extended="!isFabOpen" 
          style="background-color: #CDDC39; color: black; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
        >
          <mdui-icon-add v-if="!isFabOpen" slot="icon" class="fab-icon"></mdui-icon-add>
          <mdui-icon-close v-else slot="icon" class="fab-icon rotate-45"></mdui-icon-close>
          <span v-if="!isFabOpen">Create</span>
        </mdui-fab>
        <mdui-menu class="fab-menu">
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

    <mdui-dialog
      :open="moveRenameDialogOpen"
      @overlay-click="moveRenameDialogOpen = false"
      headline="Rename moved item"
    >
      <mdui-text-field
        v-model="moveRenameName"
        label="New name"
        autofocus
        @keyup.enter="confirmRenamedMove"
      ></mdui-text-field>
      <mdui-button slot="action" variant="text" @click="moveRenameDialogOpen = false">Cancel</mdui-button>
      <mdui-button
        slot="action"
        variant="filled"
        :disabled="!moveRenameName.trim()"
        @click="confirmRenamedMove"
      >
        Move
      </mdui-button>
    </mdui-dialog>

    <mdui-snackbar 
      :open="deleteSnackbarOpen" 
      @closed="deleteSnackbarOpen = false"
    >
      Deleted {{ deletedFileName }}
      <mdui-button slot="action" variant="text" @click="undoDelete">Undo</mdui-button>
    </mdui-snackbar>

    <mdui-snackbar
      :open="moveSnackbarOpen"
      :auto-close-delay="0"
      :close-on-outside-click="false"
      closeable
      @closed="cancelMove"
    >
      {{ moveSnackbarLabel }}
      <mdui-button slot="action" variant="text" @click="confirmMove">
        {{ currentDirectoryName }}
      </mdui-button>
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
.search-section {
  margin-bottom: 16px;
}
.search-input {
  width: 100%;
}
.search-snippet {
  font-size: 12px;
  opacity: 0.7;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.results-surface {
  margin-top: 8px;
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
.selected-entry {
  background-color: rgba(205, 220, 57, 0.14);
  color: #CDDC39;
}
.selection-icon {
  color: #CDDC39;
}
.fab-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}
.fab-icon {
  transition: transform 0.3s ease;
}
.rotate-45 {
  transform: rotate(0deg); /* It's already an 'x', but we can animate it */
  animation: rotate-in 0.3s ease;
}
@keyframes rotate-in {
  from { transform: rotate(-90deg); opacity: 0; }
  to { transform: rotate(0deg); opacity: 1; }
}
.fab-menu {
  margin-bottom: 8px;
  background-color: rgb(var(--mdui-color-surface-container-high));
  border-radius: 12px;
  box-shadow: var(--mdui-elevation-level3);
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

/* Skeleton Loading Styles */
.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-text {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-title {
  height: 14px;
  width: 60%;
  margin-top: 4px;
  margin-bottom: 4px;
}
.skeleton-desc {
  height: 12px;
  width: 40%;
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
</style>
