<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import debounce from 'lodash/debounce';
import { marked } from 'marked';
import { countWords, estimateReadingTime } from '@/utils/metrics';
import BottomBar from './BottomBar.vue';
import { aiApi } from '@/api';
import AIPanel from './AIPanel.vue';
import { useEditor } from '@/composables/useEditor';
import { useSearch } from '@/composables/useSearch';
import HighlightOverlay from './HighlightOverlay.vue';

import '@mdui/icons/auto-awesome.js';
import '@mdui/icons/close.js';
import '@mdui/icons/search.js';
import '@mdui/icons/find-replace.js';
import '@mdui/icons/keyboard-arrow-up.js';
import '@mdui/icons/keyboard-arrow-down.js';
import '@mdui/icons/visibility.js';
import '@mdui/icons/history.js';
import '@mdui/icons/edit.js';

const fileStore = useFileStore();
const historyOpen = ref(false);
const versions = ref<any[]>([]);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const openHistory = async () => {
  if (!fileStore.currentFile) return;
  versions.value = await fileStore.getVersions(fileStore.currentFile.path);
  historyOpen.value = true;
};

const restoreVersion = (content: string) => {
  localContent.value = content;
  historyOpen.value = false;
};

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleString();
};

// Local state for the textarea
const localContent = ref(fileStore.currentContent);
const aiPanelOpen = ref(false);
const originalContent = ref('');
const suggestionSnackbarOpen = ref(false);
const pendingSuggestion = ref('');
const previewMode = ref(false);
const scrollPos = ref(0);

const handleScroll = (e: Event) => {
  scrollPos.value = (e.target as HTMLTextAreaElement).scrollTop;
};

// Composables
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

// Computed for metrics
const wordCount = computed(() => countWords(localContent.value));
const readingTime = computed(() => estimateReadingTime(localContent.value));

const debouncedSave = debounce((content: string) => {
  fileStore.saveFile(content);
}, 1000);

// Computed for rendered HTML
const renderedHtml = computed(() => {
  const content = localContent.value.replace(/==(.*?)==/g, '<mark>$1</mark>');
  return marked.parse(content);
});

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

// Sync local content when store changes (e.g. file opened or websocket update)
watch(() => fileStore.currentContent, (newContent) => {
  if (newContent !== localContent.value) {
    localContent.value = newContent;
  }
});

// Update store when local content changes
watch(localContent, (newContent) => {
  if (newContent !== fileStore.currentContent && !fileStore.readonly) {
    debouncedSave(newContent);
  }
});

onMounted(() => {
  textareaRef.value?.focus();
  
  // Configure marked to include copy buttons in code blocks
  marked.use({
    renderer: {
      code(token) {
        const lang = token.lang || '';
        const text = token.text;
        return `
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-block-lang">${lang}</span>
              <button class="copy-button" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.querySelector('code').innerText).then(() => { const btn = this; const oldText = btn.innerText; btn.innerText = 'Copied!'; btn.classList.add('copied'); setTimeout(() => { btn.innerText = oldText; btn.classList.remove('copied'); }, 2000); })">Copy</button>
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
    <!-- Search Bar -->
    <div v-if="searchOpen" class="search-bar">
      <div class="search-inputs">
        <mdui-text-field
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

    <!-- History Dialog -->
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

    <div v-if="previewMode" class="preview-container" v-html="renderedHtml"></div>
    <div v-else class="native-editor-container">
      <HighlightOverlay :text="localContent" :style="{ top: `-${scrollPos}px` }" />
      <textarea
        ref="textareaRef"
        v-model="localContent"
        :readonly="fileStore.readonly"
        class="native-textarea"
        placeholder="Start typing..."
        spellcheck="false"
        @keyup="updateSelection"
        @click="updateSelection"
        @select="updateSelection"
        @scroll="handleScroll"
      ></textarea>
    </div>
    
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

    <BottomBar
      :is-highlighted="isHighlighted"
      :can-undo="true"
      :is-processing="false"
      :word-count="wordCount"
      :reading-time="readingTime"
      @highlight="handleHighlight"
      @undo="handleUndo"
      @format="handleFormat"
      @header="handleHeader"
      @list="handleList"
      @link="handleLink"
      @escape="handleEscape"
      @select-prompt="(id: string) => aiPanelOpen = true"
      @run-prompt="() => aiPanelOpen = true"
    />

    <Teleport v-if="!previewMode" to="#top-bar-actions">
      <div class="editor-top-actions">
        <!-- Preview Mode -->
        <mdui-button-icon 
          @click="previewMode = true"
          tooltip="Preview"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-visibility></mdui-icon-visibility>
        </mdui-button-icon>

        <div class="top-divider"></div>

        <!-- Version History -->
        <mdui-button-icon 
          @click="openHistory"
          tooltip="History"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-history></mdui-icon-history>
        </mdui-button-icon>

        <div class="top-divider"></div>

        <!-- Search -->
        <mdui-button-icon 
          @click="toggleSearch"
          tooltip="Search & Replace"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-search></mdui-icon-search>
        </mdui-button-icon>

        <div class="top-divider"></div>

        <!-- AI Assistant Toggle -->
        <mdui-button-icon 
          @click="aiPanelOpen = !aiPanelOpen"
          @pointerdown.prevent 
          @mousedown.prevent
          tabindex="-1"
          tooltip="AI Assistant"
          :style="{ color: aiPanelOpen ? '#CDDC39' : 'inherit', '--mdui-button-icon-size': '40px' }"
        >
          <mdui-icon-auto-awesome></mdui-icon-auto-awesome>
        </mdui-button-icon>
      </div>
    </Teleport>

    <div v-if="previewMode" class="reading-mode-fab">
      <mdui-fab @click="previewMode = false" size="small" style="background-color: #CDDC39; color: black;">
        <mdui-icon-edit slot="icon"></mdui-icon-edit>
      </mdui-fab>
    </div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  height: calc(100dvh - 56px);
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.editor-wrapper.ai-open {
  padding-top: 380px;
}
@media (max-width: 767px) {
  .editor-wrapper.ai-open {
    padding-top: 400px;
  }
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

/* Basic Markdown Styling */
.preview-container :deep(h1), .preview-container :deep(h2), .preview-container :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #CDDC39;
}
.preview-container :deep(p) {
  margin-bottom: 1em;
}
.preview-container :deep(ul), .preview-container :deep(ol) {
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
.preview-container :deep(th), .preview-container :deep(td) {
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
}
.top-divider {
  width: 1px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0 4px;
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

.reading-mode-fab {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 100;
}

.native-textarea {
  flex-grow: 1;
  width: 100%;
  border: none;
  resize: none;
  padding: 12px;
  font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 14px;
  background-color: transparent;
  color: transparent;
  caret-color: #CDDC39;
  outline: none;
  line-height: 1.5;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  height: 100%;
  display: block;
}

.native-editor-container {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  background-color: rgb(var(--mdui-color-surface-container));
}
</style>
