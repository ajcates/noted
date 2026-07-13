<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import debounce from 'lodash/debounce';
import { marked } from 'marked';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { countWords, estimateReadingTime } from '@/utils/metrics';
import AIPanel from './AIPanel.vue';
import { useEditor } from '@/composables/useEditor';
import { useSearch } from '@/composables/useSearch';
import { db } from '@/utils/db';

import '@mdui/icons/auto-awesome.js';
import '@mdui/icons/close.js';
import '@mdui/icons/search.js';
import '@mdui/icons/find-replace.js';
import '@mdui/icons/keyboard-arrow-up.js';
import '@mdui/icons/keyboard-arrow-down.js';
import '@mdui/icons/visibility.js';
import '@mdui/icons/history.js';
import '@mdui/icons/edit.js';
import '@mdui/icons/menu.js';
import '@mdui/icons/folder.js';
import '@mdui/icons/insert-drive-file.js';
import '@mdui/icons/arrow-back.js';
import '@mdui/icons/undo.js';
import '@mdui/icons/text-fields.js';
import '@mdui/icons/border-color.js';
import '@mdui/icons/format-color-reset.js';
import '@mdui/icons/title.js';
import '@mdui/icons/format-list-bulleted.js';
import '@mdui/icons/link.js';
import '@mdui/icons/data-object.js';
import '@mdui/icons/spellcheck.js';

const fileStore = useFileStore();
const historyOpen = ref(false);
const versions = ref<any[]>([]);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const sidebarOpen = ref(false);

const openHistory = async () => {
  if (!fileStore.currentFile) return;
  versions.value = await fileStore.getVersions(fileStore.currentFile.path);
  historyOpen.value = true;
};

const restoreVersion = (content: string) => {
  localContent.value = content;
  historyOpen.value = false;
};

const formatTime = (ts: number) => new Date(ts).toLocaleString();

const localContent = ref(fileStore.currentContent);
const aiPanelOpen = ref(false);
const originalContent = ref('');
const suggestionSnackbarOpen = ref(false);
const pendingSuggestion = ref('');
const previewMode = ref(false);

const autocompleteOpen = ref(false);
const autocompleteQuery = ref('');
const autocompleteStartIndex = ref(-1);
const autocompleteSelectedIndex = ref(0);
const allFiles = ref<any[]>([]);

const loadAllFiles = async () => {
  try {
    allFiles.value = await db.files.toArray();
  } catch (e) {
    console.error('Failed to load files for autocomplete:', e);
  }
};

const mdFiles = computed(() => allFiles.value.filter(f => f.type === 'file' && f.path.endsWith('.md')));
const currentDirectoryEntries = computed(() => fileStore.sortedFiles);
const currentDirectoryLabel = computed(() => fileStore.currentPath === '.' ? 'Workspace' : fileStore.currentPath);
const wordCount = computed(() => countWords(localContent.value));
const readingTime = computed(() => estimateReadingTime(localContent.value));

const isMobileSidebar = () => {
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(max-width: 959px)').matches;
};

const autocompleteSuggestions = computed(() => {
  const query = autocompleteQuery.value.toLowerCase();
  const files = mdFiles.value;
  if (!query) {
    return files.slice(0, 8);
  }
  return files
    .filter(f => f.path.toLowerCase().includes(query))
    .sort((a, b) => {
      const aPath = a.path.toLowerCase();
      const bPath = b.path.toLowerCase();
      const aStarts = aPath.startsWith(query) ? 1 : 0;
      const bStarts = bPath.startsWith(query) ? 1 : 0;
      return bStarts - aStarts;
    })
    .slice(0, 8);
});

const checkAutocomplete = () => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const text = localContent.value;
  const cursor = textarea.selectionStart;

  let atIndex = -1;
  for (let i = cursor - 1; i >= 0; i--) {
    const char = text[i];
    if (char === '\n') break;
    if (char === '@') {
      atIndex = i;
      break;
    }
    if (char === ' ') {
      break;
    }
  }

  if (atIndex !== -1) {
    const prevChar = atIndex > 0 ? text[atIndex - 1] : '';
    if (prevChar === '' || prevChar === ' ' || prevChar === '\n') {
      autocompleteStartIndex.value = atIndex;
      autocompleteQuery.value = text.substring(atIndex + 1, cursor);
      autocompleteOpen.value = true;
      if (autocompleteSelectedIndex.value >= autocompleteSuggestions.value.length) {
        autocompleteSelectedIndex.value = 0;
      }
      return;
    }
  }

  autocompleteOpen.value = false;
  autocompleteStartIndex.value = -1;
  autocompleteQuery.value = '';
};

const selectSuggestion = (file: any) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const text = localContent.value;
  const start = autocompleteStartIndex.value;
  const cursor = textarea.selectionStart;
  const replacement = `[#${file.name}](@${file.path})`;
  localContent.value = text.substring(0, start) + replacement + text.substring(cursor);

  const newCursorPos = start + replacement.length;
  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    updateSelection();
    autocompleteOpen.value = false;
  });
};

const handleTextareaKeyUp = () => {
  updateSelection();
  checkAutocomplete();
};

const handleTextareaClick = () => {
  updateSelection();
  checkAutocomplete();
};

const handleTextareaSelect = () => {
  updateSelection();
  checkAutocomplete();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!autocompleteOpen.value || autocompleteSuggestions.value.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    autocompleteSelectedIndex.value = (autocompleteSelectedIndex.value + 1) % autocompleteSuggestions.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    autocompleteSelectedIndex.value = (autocompleteSelectedIndex.value - 1 + autocompleteSuggestions.value.length) % autocompleteSuggestions.value.length;
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    const selected = autocompleteSuggestions.value[autocompleteSelectedIndex.value];
    if (selected) {
      selectSuggestion(selected);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    autocompleteOpen.value = false;
  }
};

const {
  selectionStart,
  selectionEnd,
  isHighlighted,
  updateSelection,
  handleHighlight,
  handleHeader,
  handleList,
  handleLink,
  handleEscape,
  handleFormat,
  handleUndo
} = useEditor(localContent, textareaRef);

const {
  searchOpen,
  searchQuery,
  replaceQuery,
  searchResults,
  currentResultIndex,
  toggleSearch,
  performSearch,
  nextSearchResult,
  prevSearchResult,
  performReplace,
  replaceAll
} = useSearch(localContent, textareaRef);

const searchInputRef = ref<any>(null);
watch(searchOpen, async (open) => {
  if (open) {
    await nextTick();
    searchInputRef.value?.focus();
  }
});

const debouncedSave = debounce((content: string) => {
  fileStore.saveFile(content);
}, 1000);

const renderedHtml = computed(() => {
  const content = localContent.value.replace(/==(.*?)==/g, '<mark>$1</mark>');
  return sanitizeHtml(marked.parse(content) as string);
});

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const copyPreviewCode = async (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>('.copy-button');
  const code = button?.parentElement?.nextElementSibling?.querySelector('code');
  if (!button || !code) return;

  await navigator.clipboard.writeText(code.textContent || '');
  const oldText = button.textContent;
  button.textContent = 'Copied!';
  button.classList.add('copied');
  setTimeout(() => {
    button.textContent = oldText;
    button.classList.remove('copied');
  }, 2000);
};

const handleSuggestionReceived = (content: string) => {
  if (!suggestionSnackbarOpen.value) {
    originalContent.value = localContent.value;
  }
  pendingSuggestion.value = content;
  localContent.value = content;
  suggestionSnackbarOpen.value = true;
};

const approveSuggestion = () => {
  suggestionSnackbarOpen.value = false;
  originalContent.value = '';
  pendingSuggestion.value = '';
  textareaRef.value?.focus();
};

const rejectSuggestion = () => {
  suggestionSnackbarOpen.value = false;
  if (originalContent.value !== '') {
    localContent.value = originalContent.value;
  }
  originalContent.value = '';
  pendingSuggestion.value = '';
  textareaRef.value?.focus();
};

const handleAIApply = ({ content }: { content: string }) => {
  handleSuggestionReceived(content);
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const openSidebarEntry = async (entry: any) => {
  if (entry.type === 'directory') {
    await fileStore.navigate(entry.path);
  } else {
    await fileStore.openFile(entry);
  }

  if (isMobileSidebar()) {
    sidebarOpen.value = false;
  }
};

const navigateSidebarUp = async () => {
  const parts = fileStore.currentPath.split('/');
  if (parts.length > 1) {
    parts.pop();
    await fileStore.navigate(parts.join('/') || '.');
  } else if (fileStore.currentPath !== '.') {
    await fileStore.navigate('.');
  }
};

watch(() => fileStore.currentContent, (newContent) => {
  if (newContent !== localContent.value) {
    localContent.value = newContent;
  }
});

watch(localContent, (newContent) => {
  if (newContent !== fileStore.currentContent && !fileStore.readonly) {
    fileStore.updateDraft(newContent);
    debouncedSave(newContent);
  }
});

watch(() => fileStore.files, () => {
  loadAllFiles();
}, { deep: true });

onMounted(() => {
  textareaRef.value?.focus();
  loadAllFiles();
  sidebarOpen.value = !isMobileSidebar();

  marked.use({
    renderer: {
      code(token) {
        const lang = escapeHtml(token.lang || '');
        const text = escapeHtml(token.text);
        return `
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-block-lang">${lang}</span>
              <button class="copy-button" type="button" aria-label="Copy code block">Copy</button>
            </div>
            <pre><code class="language-${lang}">${text}</code></pre>
          </div>
        `;
      }
    }
  });
});
</script>

<template>
  <div class="editor-wrapper" :class="{ 'ai-open': aiPanelOpen }">
    <div v-if="sidebarOpen && isMobileSidebar()" class="sidebar-backdrop" @click="closeSidebar"></div>

    <div class="editor-shell">
      <aside class="editor-sidebar" :class="{ 'is-open': sidebarOpen }">
        <div class="sidebar-header">
          <div class="sidebar-label">Directory</div>
          <div class="sidebar-path">{{ currentDirectoryLabel }}</div>
        </div>

        <div v-if="fileStore.currentPath !== '.'" class="sidebar-up">
          <mdui-list-item ripple @click="navigateSidebarUp">
            <mdui-icon-arrow-back slot="icon"></mdui-icon-arrow-back>
            ..
          </mdui-list-item>
        </div>

        <mdui-list class="sidebar-list">
          <mdui-list-item
            v-for="entry in currentDirectoryEntries"
            :key="entry.path"
            ripple
            :class="{ 'active-entry': entry.path === fileStore.currentFile?.path }"
            @click="openSidebarEntry(entry)"
          >
            <mdui-icon-folder v-if="entry.type === 'directory'" slot="icon"></mdui-icon-folder>
            <mdui-icon-insert-drive-file v-else slot="icon"></mdui-icon-insert-drive-file>
            {{ entry.name }}
          </mdui-list-item>
        </mdui-list>
      </aside>

      <div class="editor-main">
        <Transition name="search-slide">
          <div v-if="searchOpen" class="search-bar">
            <div class="search-inputs">
              <mdui-text-field
                ref="searchInputRef"
                v-model="searchQuery"
                placeholder="Search"
                variant="filled"
                class="dense-field"
                @input="performSearch"
              >
                <mdui-button-icon slot="icon" @click="prevSearchResult" :disabled="searchResults.length === 0">
                  <mdui-icon-keyboard-arrow-up></mdui-icon-keyboard-arrow-up>
                </mdui-button-icon>
                <mdui-button-icon slot="end-icon" @click="nextSearchResult" :disabled="searchResults.length === 0">
                  <mdui-icon-keyboard-arrow-down></mdui-icon-keyboard-arrow-down>
                </mdui-button-icon>
              </mdui-text-field>

              <mdui-text-field
                v-model="replaceQuery"
                placeholder="Replace"
                variant="filled"
                class="dense-field"
              >
                <mdui-button-icon slot="icon" @click="performReplace" :disabled="searchResults.length === 0">
                  <mdui-icon-find-replace></mdui-icon-find-replace>
                </mdui-button-icon>
              </mdui-text-field>
            </div>
            <div class="search-actions">
              <span class="results-count" v-if="searchQuery">
                {{ searchResults.length > 0 ? currentResultIndex + 1 : 0 }}/{{ searchResults.length }}
              </span>
              <mdui-button variant="text" @click="replaceAll" :disabled="searchResults.length === 0" style="color: #CDDC39;">All</mdui-button>
              <mdui-button-icon @click="toggleSearch">
                <mdui-icon-close></mdui-icon-close>
              </mdui-button-icon>
            </div>
          </div>
        </Transition>

        <div class="editor-status-bar">
          <span>{{ wordCount }} words</span>
          <span>{{ readingTime }} min read</span>
        </div>

        <div v-if="previewMode" class="preview-container" v-html="renderedHtml" @click="copyPreviewCode"></div>
        <div v-else class="native-editor-container">
          <textarea
            ref="textareaRef"
            v-model="localContent"
            :readonly="fileStore.readonly"
            class="native-textarea"
            placeholder="Start typing..."
            spellcheck="false"
            @keyup="handleTextareaKeyUp"
            @keydown="handleKeyDown"
            @click="handleTextareaClick"
            @select="handleTextareaSelect"
          ></textarea>

          <div v-if="autocompleteOpen && autocompleteSuggestions.length > 0" class="autocomplete-popup">
            <div
              v-for="(suggestion, index) in autocompleteSuggestions"
              :key="suggestion.path"
              class="autocomplete-item"
              :class="{ 'selected': index === autocompleteSelectedIndex }"
              @click="selectSuggestion(suggestion)"
            >
              <span class="suggestion-name">{{ suggestion.name }}</span>
              <span class="suggestion-path">{{ suggestion.path }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <mdui-dialog :open="historyOpen" @overlay-click="historyOpen = false" headline="Version History">
      <mdui-list v-if="versions.length > 0" style="max-height: 400px; overflow-y: auto;">
        <mdui-list-item v-for="v in versions" :key="v.id" @click="restoreVersion(v.content)">
          <div slot="description">{{ formatTime(v.timestamp) }}</div>
          {{ v.content.substring(0, 50) }}{{ v.content.length > 50 ? '...' : '' }}
        </mdui-list-item>
      </mdui-list>
      <div v-else style="padding: 16px; opacity: 0.7; text-align: center;">No versions saved yet.</div>
      <mdui-button slot="action" variant="text" @click="historyOpen = false">Close</mdui-button>
    </mdui-dialog>

    <Teleport to="body">
      <AIPanel
        :open="aiPanelOpen"
        :selected-text="localContent.substring(selectionStart, selectionEnd)"
        :full-content="localContent"
        :file-path="fileStore.currentFile?.path || 'global'"
        @close="aiPanelOpen = false"
        @apply="handleAIApply"
      />
    </Teleport>

    <mdui-snackbar
      :open="suggestionSnackbarOpen"
      :auto-close-delay="0"
      :close-on-outside-click="false"
      @closed="suggestionSnackbarOpen = false"
    >
      Approve Edit?
      <mdui-button slot="action" variant="text" style="color: #CDDC39;" @click="approveSuggestion">Yes</mdui-button>
      <mdui-button slot="action" variant="text" style="color: #f44336;" @click="rejectSuggestion">No</mdui-button>
    </mdui-snackbar>

    <Teleport to="#top-bar-actions">
      <div class="editor-top-actions">
        <mdui-button-icon
          @click="toggleSidebar"
          tooltip="Toggle file sidebar"
          aria-label="Toggle file sidebar"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
        >
          <mdui-icon-menu></mdui-icon-menu>
        </mdui-button-icon>

        <mdui-button-icon
          @click="toggleSearch"
          tooltip="Search & Replace"
          aria-label="Search and replace"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-search></mdui-icon-search>
        </mdui-button-icon>

        <mdui-dropdown @pointerdown.prevent @mousedown.prevent>
          <mdui-button-icon
            slot="trigger"
            tooltip="Format Options"
            aria-label="Format options"
            style="color: #CDDC39; --mdui-button-icon-size: 40px;"
            tabindex="-1"
            @pointerdown.prevent
            @mousedown.prevent
          >
            <mdui-icon-text-fields></mdui-icon-text-fields>
          </mdui-button-icon>
          <mdui-menu @pointerdown.prevent @mousedown.prevent tabindex="-1">
            <mdui-menu-item @click="handleHighlight" @pointerdown.prevent @mousedown.prevent tabindex="-1">
              <mdui-icon-format-color-reset v-if="isHighlighted" slot="icon"></mdui-icon-format-color-reset>
              <mdui-icon-border-color v-else slot="icon"></mdui-icon-border-color>
              Highlight
            </mdui-menu-item>
            <mdui-menu-item @click="handleHeader" @pointerdown.prevent @mousedown.prevent tabindex="-1">
              <mdui-icon-title slot="icon"></mdui-icon-title>
              Header
            </mdui-menu-item>
            <mdui-menu-item @click="handleList" @pointerdown.prevent @mousedown.prevent tabindex="-1">
              <mdui-icon-format-list-bulleted slot="icon"></mdui-icon-format-list-bulleted>
              List
            </mdui-menu-item>
            <mdui-menu-item @click="handleLink" @pointerdown.prevent @mousedown.prevent tabindex="-1">
              <mdui-icon-link slot="icon"></mdui-icon-link>
              Link
            </mdui-menu-item>
            <mdui-menu-item @click="handleEscape" @pointerdown.prevent @mousedown.prevent tabindex="-1">
              <mdui-icon-data-object slot="icon"></mdui-icon-data-object>
              Escape MD
            </mdui-menu-item>
            <mdui-divider></mdui-divider>
            <mdui-menu-item @click="handleFormat" @pointerdown.prevent @mousedown.prevent tabindex="-1">
              <mdui-icon-spellcheck slot="icon"></mdui-icon-spellcheck>
              Auto-format
            </mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>

        <mdui-button-icon
          tooltip="Undo"
          aria-label="Undo"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @click="handleUndo"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-undo></mdui-icon-undo>
        </mdui-button-icon>

        <mdui-button-icon
          :tooltip="previewMode ? 'Back to editor' : 'Preview'"
          :aria-label="previewMode ? 'Back to editor' : 'Preview note'"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @click="previewMode = !previewMode"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-visibility v-if="!previewMode"></mdui-icon-visibility>
          <mdui-icon-edit v-else></mdui-icon-edit>
        </mdui-button-icon>

        <mdui-button-icon
          tooltip="History"
          aria-label="Version history"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @click="openHistory"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-history></mdui-icon-history>
        </mdui-button-icon>

        <mdui-button-icon
          @click="aiPanelOpen = !aiPanelOpen"
          @pointerdown.prevent
          @mousedown.prevent
          tabindex="-1"
          tooltip="AI Assistant"
          aria-label="AI assistant"
          :style="{ color: aiPanelOpen ? '#CDDC39' : 'inherit', '--mdui-button-icon-size': '40px' }"
        >
          <mdui-icon-auto-awesome></mdui-icon-auto-awesome>
        </mdui-button-icon>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.editor-wrapper {
  height: calc(100dvh - 56px);
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.editor-wrapper.ai-open {
  padding-bottom: 380px;
}

@media (max-width: 767px) {
  .editor-wrapper.ai-open {
    padding-bottom: 280px;
  }
}

.sidebar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 19;
}

.editor-shell {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  background:
    linear-gradient(180deg, rgba(205, 220, 57, 0.08), transparent 18%),
    rgb(var(--mdui-color-background));
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(205, 220, 57, 0.08), rgba(0, 0, 0, 0)),
    rgb(var(--mdui-color-surface-container));
}

.sidebar-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #CDDC39;
}

.sidebar-path {
  margin-top: 6px;
  font-size: 15px;
  color: rgb(var(--mdui-color-on-surface));
  word-break: break-word;
}

.sidebar-up {
  padding: 8px 8px 0;
}

.sidebar-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  background: transparent;
}

.sidebar-list mdui-list-item {
  border-radius: 12px;
  margin-bottom: 4px;
  --mdui-list-item-height: 46px;
}

.sidebar-list mdui-list-item.active-entry {
  background: rgba(205, 220, 57, 0.16);
  color: #CDDC39;
}

.editor-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.editor-status-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  font-size: 12px;
  color: rgb(var(--mdui-color-on-surface-variant));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgb(var(--mdui-color-surface-container-low));
}

.preview-container {
  flex-grow: 1;
  width: 100%;
  padding: 24px;
  overflow-y: auto;
  background-color: rgb(var(--mdui-color-background));
  color: rgb(var(--mdui-color-on-background));
  line-height: 1.6;
  font-family: system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

.preview-container :deep(a[href^="@"]) {
  color: #CDDC39;
  text-decoration: none;
  background-color: rgba(205, 220, 57, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  border-bottom: 1px dashed rgba(205, 220, 57, 0.4);
  transition: all 0.2s ease;
}

.preview-container :deep(a[href^="@"]:hover) {
  background-color: rgba(205, 220, 57, 0.25);
  border-bottom-style: solid;
}

.preview-container :deep(h1),
.preview-container :deep(h2),
.preview-container :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #CDDC39;
}

.preview-container :deep(p) {
  margin-bottom: 1em;
}

.preview-container :deep(ul),
.preview-container :deep(ol) {
  padding-left: 24px;
  margin-bottom: 1em;
}

.preview-container :deep(li) {
  margin-bottom: 0.5em;
}

.preview-container :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
}

.preview-container :deep(pre) {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.preview-container :deep(.code-block-wrapper) {
  position: relative;
  margin-bottom: 1em;
}

.preview-container :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-container :deep(.copy-button) {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #CDDC39;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s;
  text-transform: none;
}

.preview-container :deep(.copy-button:hover) {
  background-color: rgba(205, 220, 57, 0.1);
  border-color: #CDDC39;
}

.preview-container :deep(.copy-button.copied) {
  background-color: #CDDC39;
  color: black;
  border-color: #CDDC39;
}

.preview-container :deep(.code-block-wrapper pre) {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.preview-container :deep(blockquote) {
  border-left: 4px solid #CDDC39;
  margin: 0;
  padding-left: 16px;
  opacity: 0.8;
  font-style: italic;
}

.preview-container :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2em 0;
}

.preview-container :deep(mark) {
  background-color: #CDDC39;
  color: black;
  padding: 0 2px;
  border-radius: 2px;
}

.preview-container :deep(img) {
  max-width: 100%;
}

.preview-container :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.preview-container :deep(th),
.preview-container :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  text-align: left;
}

.preview-container :deep(th) {
  background-color: rgba(255, 255, 255, 0.05);
}

.editor-top-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.search-bar {
  background-color: rgb(var(--mdui-color-surface-container-high));
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.search-inputs {
  display: flex;
  gap: 8px;
}

.search-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.dense-field {
  --mdui-text-field-height: 40px;
  flex: 1;
}

.results-count {
  font-size: 12px;
  opacity: 0.7;
}

.native-editor-container {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--mdui-color-surface-container));
}

.native-textarea {
  display: block;
  height: 100%;
  width: 100%;
  border: none;
  resize: none;
  padding: 18px 20px 24px;
  font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 15px;
  line-height: 1.65;
  box-sizing: border-box;
  background-color: transparent;
  color: rgb(var(--mdui-color-on-surface));
  caret-color: #CDDC39;
  outline: none;
}

.search-slide-enter-active,
.search-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.search-slide-enter-from,
.search-slide-leave-to {
  transform: translateY(-20px);
}

.autocomplete-popup {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 280px;
  max-height: 200px;
  background-color: rgb(var(--mdui-color-surface-container-high));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: var(--mdui-elevation-level3);
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.autocomplete-item {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item.selected {
  background-color: rgba(205, 220, 57, 0.2);
}

.autocomplete-item:hover {
  background-color: rgba(205, 220, 57, 0.1);
}

.suggestion-name {
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--mdui-color-on-surface));
}

.suggestion-path {
  font-size: 10px;
  opacity: 0.6;
  margin-top: 2px;
  word-break: break-all;
}

@media (max-width: 959px) {
  .editor-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .editor-sidebar {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(82vw, 320px);
    z-index: 20;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--mdui-elevation-level4);
  }

  .editor-sidebar.is-open {
    transform: translateX(0);
  }

  .editor-status-bar {
    padding: 8px 14px;
    font-size: 11px;
  }

  .search-inputs {
    flex-direction: column;
  }
}
</style>
