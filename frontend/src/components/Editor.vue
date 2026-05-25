<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import debounce from 'lodash/debounce';
import { marked } from 'marked';
import BottomBar from './BottomBar.vue';
import { aiApi } from '@/api';

import '@mdui/icons/close.js';
import '@mdui/icons/search.js';
import '@mdui/icons/find-replace.js';
import '@mdui/icons/keyboard-arrow-up.js';
import '@mdui/icons/keyboard-arrow-down.js';
import '@mdui/icons/visibility.js';
import '@mdui/icons/description.js';
import '@mdui/icons/text-fields.js';
import '@mdui/icons/format-color-reset.js';
import '@mdui/icons/border-color.js';
import '@mdui/icons/title.js';
import '@mdui/icons/format-list-bulleted.js';
import '@mdui/icons/link.js';
import '@mdui/icons/data-object.js';
import '@mdui/icons/undo.js';
import '@mdui/icons/spellcheck.js';
import '@mdui/icons/smart-toy.js';
import '@mdui/icons/play-arrow.js';
import '@mdui/icons/edit.js';

const fileStore = useFileStore();
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Local state for the textarea
const localContent = ref(fileStore.currentContent);
const isProcessingAI = ref(false);
const selectedPrompt = ref('summarize');
const readingMode = ref(false);
const previewMode = ref(false);

// Search & Replace state
const searchOpen = ref(false);
const searchQuery = ref('');
const replaceQuery = ref('');
const searchResults = ref<number[]>([]);
const currentResultIndex = ref(-1);

// Selection state for highlight detection
const selectionStart = ref(0);
const selectionEnd = ref(0);

const debouncedSave = debounce((content: string) => {
  fileStore.saveFile(content);
}, 1000);

// Computed for rendered HTML
const renderedHtml = computed(() => {
  const content = localContent.value.replace(/==(.*?)==/g, '<mark>$1</mark>');
  return marked.parse(content);
});

// Detect if the caret is currently inside a ==highlight== block
const isHighlighted = computed(() => {
  const content = localContent.value;
  const pos = selectionStart.value;
  
  // Find all == ranges in the current content
  const regex = /==(.*?)==/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const start = match.index;
    const end = match.index + match[0].length;
    if (pos >= start && pos <= end) {
      return true;
    }
  }
  return false;
});

const updateSelection = () => {
  if (textareaRef.value) {
    selectionStart.value = textareaRef.value.selectionStart;
    selectionEnd.value = textareaRef.value.selectionEnd;
  }
};

// --- Action Handlers ---

const handleHighlight = () => {
  if (!textareaRef.value) return;
  const start = textareaRef.value.selectionStart;
  const end = textareaRef.value.selectionEnd;
  const content = localContent.value;

  if (isHighlighted.value) {
    // Logic to REMOVE highlight (find the surrounding ==)
    const regex = /==/g;
    let match;
    let markers: number[] = [];
    while ((match = regex.exec(content)) !== null) {
      markers.push(match.index);
    }
    
    // Find the pair surrounding the cursor
    for (let i = 0; i < markers.length; i += 2) {
      const mStart = markers[i];
      const mEnd = (markers[i+1] || 0) + 2;
      if (start >= mStart && start <= mEnd) {
        localContent.value = content.slice(0, mStart) + content.slice(mStart + 2, markers[i+1]) + content.slice(mEnd);
        break;
      }
    }
  } else {
    // Logic to ADD highlight
    if (start === end) {
      localContent.value = content.slice(0, start) + '====' + content.slice(end);
      setTimeout(() => {
        if (textareaRef.value) textareaRef.value.setSelectionRange(start + 2, start + 2);
      }, 0);
    } else {
      localContent.value = content.slice(0, start) + '==' + content.slice(start, end) + '==' + content.slice(end);
    }
  }
  textareaRef.value.focus();
};

const handleUndo = () => {
  document.execCommand('undo');
  textareaRef.value?.focus();
};

const handleFormat = () => {
  const lines = localContent.value.split('\n');
  const formatted = lines
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  localContent.value = formatted;
  textareaRef.value?.focus();
};

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value;
  if (!searchOpen.value) {
    searchResults.value = [];
    currentResultIndex.value = -1;
  }
};

const performSearch = () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  const content = localContent.value;
  try {
    const regex = new RegExp(searchQuery.value, 'gi');
    let match;
    const indices: number[] = [];
    while ((match = regex.exec(content)) !== null) {
      indices.push(match.index);
    }
    searchResults.value = indices;
    if (indices.length > 0) {
      currentResultIndex.value = 0;
      highlightSearchResult();
    }
  } catch (e) {
    // Invalid regex
    searchResults.value = [];
  }
};

const nextSearchResult = () => {
  if (searchResults.value.length === 0) return;
  currentResultIndex.value = (currentResultIndex.value + 1) % searchResults.value.length;
  highlightSearchResult();
};

const prevSearchResult = () => {
  if (searchResults.value.length === 0) return;
  currentResultIndex.value = (currentResultIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
  highlightSearchResult();
};

const highlightSearchResult = () => {
  if (textareaRef.value && currentResultIndex.value !== -1) {
    const start = searchResults.value[currentResultIndex.value];
    textareaRef.value.setSelectionRange(start, start + searchQuery.value.length);
    textareaRef.value.focus();
    
    // Scroll calculation
    const lineHeight = 1.5 * 14; 
    const line = localContent.value.substring(0, start).split('\n').length;
    textareaRef.value.scrollTop = (line - 5) * lineHeight;
  }
};

const performReplace = () => {
  if (!searchQuery.value || currentResultIndex.value === -1) return;
  const content = localContent.value;
  const s = textareaRef.value?.selectionStart || 0;
  const e = textareaRef.value?.selectionEnd || 0;
  localContent.value = content.slice(0, s) + replaceQuery.value + content.slice(e);
  performSearch();
};

const replaceAll = () => {
  if (!searchQuery.value) return;
  const regex = new RegExp(searchQuery.value, 'gi');
  localContent.value = localContent.value.replace(regex, replaceQuery.value);
  toggleSearch();
};

const handleRunPrompt = async () => {
  if (!localContent.value) return;
  
  isProcessingAI.value = true;
  try {
    // Determine the text to process: selection or whole line/content
    let textToProcess = '';
    const start = textareaRef.value?.selectionStart || 0;
    const end = textareaRef.value?.selectionEnd || 0;
    
    if (start !== end) {
      textToProcess = localContent.value.substring(start, end);
    } else {
      // Find the current line if no selection
      const content = localContent.value;
      const lastNewline = content.lastIndexOf('\n', start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const nextNewline = content.indexOf('\n', start);
      const lineEnd = nextNewline === -1 ? content.length : nextNewline;
      textToProcess = content.substring(lineStart, lineEnd);
    }

    const { result } = await aiApi.process(selectedPrompt.value, textToProcess);
    
    // Replace the text
    if (start !== end) {
      localContent.value = localContent.value.slice(0, start) + result + localContent.value.slice(end);
    } else {
      // If it was a line, replace the line
      const content = localContent.value;
      const lastNewline = content.lastIndexOf('\n', start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const nextNewline = content.indexOf('\n', start);
      const lineEnd = nextNewline === -1 ? content.length : nextNewline;
      localContent.value = content.slice(0, lineStart) + result + content.slice(lineEnd);
    }
  } catch (e: any) {
    console.error('AI processing failed', e);
  } finally {
    isProcessingAI.value = false;
    textareaRef.value?.focus();
  }
};

const handleEscape = () => {
  if (!textareaRef.value) return;
  const start = textareaRef.value.selectionStart;
  const end = textareaRef.value.selectionEnd;
  const content = localContent.value;
  const selectedText = content.substring(start, end);
  
  // Escape Markdown characters
  const escaped = selectedText.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
  
  localContent.value = content.slice(0, start) + escaped + content.slice(end);
  textareaRef.value.focus();
};

const handleHeader = () => {
  if (!textareaRef.value) return;
  const start = textareaRef.value.selectionStart;
  const content = localContent.value;
  
  // Find start of current line
  const lastNewline = content.lastIndexOf('\n', start - 1);
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  
  const line = content.substring(lineStart, content.indexOf('\n', lineStart) === -1 ? content.length : content.indexOf('\n', lineStart));
  
  if (line.startsWith('# ')) {
    localContent.value = content.slice(0, lineStart) + line.substring(2) + content.slice(lineStart + line.length);
  } else {
    localContent.value = content.slice(0, lineStart) + '# ' + line + content.slice(lineStart + line.length);
  }
  textareaRef.value.focus();
};

const handleList = () => {
  if (!textareaRef.value) return;
  const start = textareaRef.value.selectionStart;
  const end = textareaRef.value.selectionEnd;
  const content = localContent.value;
  
  // Find the lines covered by the selection
  const lastNewlineBefore = content.lastIndexOf('\n', start - 1);
  const startPos = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
  const endPos = content.indexOf('\n', end) === -1 ? content.length : content.indexOf('\n', end);
  
  const selectedText = content.substring(startPos, endPos);
  const lines = selectedText.split('\n');
  
  const allList = lines.every(line => line.startsWith('- '));
  const newLines = allList 
    ? lines.map(line => line.substring(2))
    : lines.map(line => line.startsWith('- ') ? line : '- ' + line);
    
  localContent.value = content.slice(0, startPos) + newLines.join('\n') + content.slice(endPos);
  textareaRef.value.focus();
};

const handleLink = () => {
  if (!textareaRef.value) return;
  const start = textareaRef.value.selectionStart;
  const end = textareaRef.value.selectionEnd;
  const content = localContent.value;
  const selectedText = content.substring(start, end);
  
  const linkTemplate = `[${selectedText}](url)`;
  localContent.value = content.slice(0, start) + linkTemplate + content.slice(end);
  
  setTimeout(() => {
    if (textareaRef.value) {
      const newStart = start + linkTemplate.length - 4; // Inside (url)
      textareaRef.value.setSelectionRange(newStart, newStart + 3);
      textareaRef.value.focus();
    }
  }, 0);
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
</script>

<template>
  <div class="editor-wrapper" :class="{ 'reading-mode': readingMode }">
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

    <div v-if="previewMode" class="preview-container" v-html="renderedHtml"></div>
    <textarea
      v-else
      ref="textareaRef"
      v-model="localContent"
      :readonly="fileStore.readonly || readingMode"
      class="native-textarea"
      placeholder="Start typing..."
      spellcheck="false"
      @keyup="updateSelection"
      @click="updateSelection"
      @select="updateSelection"
    ></textarea>
    
    <Teleport v-if="!readingMode && !previewMode" to="#top-bar-actions">
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
          <mdui-icon-description></mdui-icon-description>
        </mdui-button-icon>

        <div class="top-divider"></div>

        <!-- Reading Mode -->
        <mdui-button-icon 
          @click="readingMode = true"
          tooltip="Reading Mode"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @pointerdown.prevent
          @mousedown.prevent
        >
          <mdui-icon-visibility></mdui-icon-visibility>
        </mdui-button-icon>

        <div class="top-divider"></div>

        <!-- Consolidated Text Actions -->
        <mdui-dropdown @pointerdown.prevent @mousedown.prevent>
          <mdui-button-icon 
            slot="trigger" 
            tooltip="Text Actions" 
            style="color: #CDDC39; --mdui-button-icon-size: 40px;"
            tabindex="-1"
            @pointerdown.prevent 
            @mousedown.prevent
          >
            <mdui-icon-text-fields></mdui-icon-text-fields>
          </mdui-button-icon>
          <mdui-menu @pointerdown.prevent @mousedown.prevent tabindex="-1">
            <mdui-menu-item @click="handleHighlight" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-format-color-reset v-if="isHighlighted" slot="icon"></mdui-icon-format-color-reset>
              <mdui-icon-border-color v-else slot="icon"></mdui-icon-border-color>
              Highlight
            </mdui-menu-item>
            <mdui-menu-item @click="handleHeader" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-title slot="icon"></mdui-icon-title>
              Header
            </mdui-menu-item>
            <mdui-menu-item @click="handleList" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-format-list-bulleted slot="icon"></mdui-icon-format-list-bulleted>
              List
            </mdui-menu-item>
            <mdui-menu-item @click="handleLink" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-link slot="icon"></mdui-icon-link>
              Link
            </mdui-menu-item>
            <mdui-menu-item @click="handleEscape" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-data-object slot="icon"></mdui-icon-data-object>
              Escape MD
            </mdui-menu-item>
            <mdui-divider></mdui-divider>
            <mdui-menu-item @click="handleUndo" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-undo slot="icon"></mdui-icon-undo>
              Undo
            </mdui-menu-item>
            <mdui-menu-item @click="handleFormat" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
              <mdui-icon-spellcheck slot="icon"></mdui-icon-spellcheck>
              Auto-format
            </mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>

        <div class="top-divider"></div>

        <!-- AI Prompts -->
        <mdui-dropdown @pointerdown.prevent @mousedown.prevent>
          <mdui-button-icon 
            slot="trigger" 
            tooltip="AI Prompts" 
            style="color: #CDDC39; --mdui-button-icon-size: 40px;"
            tabindex="-1"
            @pointerdown.prevent 
            @mousedown.prevent
          >
            <mdui-icon-smart-toy></mdui-icon-smart-toy>
          </mdui-button-icon>
          <mdui-menu @change="(e: any) => selectedPrompt = e.target.value" @pointerdown.prevent @mousedown.prevent tabindex="-1">
            <mdui-menu-item 
              v-for="p in [
                { id: 'summarize', name: 'Summarize' },
                { id: 'fix_grammar', name: 'Fix Grammar' },
                { id: 'professional', name: 'Professional' },
                { id: 'creative', name: 'Creative' }
              ]" 
              :key="p.id" 
              :value="p.id" 
              style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;"
              tabindex="-1"
              @pointerdown.prevent
              @mousedown.prevent
            >
              {{ p.name }}
            </mdui-menu-item>
          </mdui-menu>
        </mdui-dropdown>

        <mdui-button-icon 
          :loading="isProcessingAI"
          @click="handleRunPrompt"
          @pointerdown.prevent
          @mousedown.prevent
          tabindex="-1"
          tooltip="Run AI Prompt"
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
        >
          <mdui-icon-play-arrow></mdui-icon-play-arrow>
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
      </div>
    </Teleport>

    <div v-if="readingMode || previewMode" class="reading-mode-fab">
      <mdui-fab @click="readingMode = false; previewMode = false" size="small" style="background-color: #CDDC39; color: black;">
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
  transition: padding 0.3s;
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
.preview-container :deep(blockquote) {
  border-left: 4px solid #CDDC39;
  margin: 0;
  padding-left: 16px;
  opacity: 0.8;
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

.reading-mode .native-textarea {
  padding-bottom: 16px;
  background-color: rgb(var(--mdui-color-background));
}

.native-textarea {
  flex-grow: 1;
  width: 100%;
  border: none;
  resize: none;
  padding: 12px;
  font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 14px;
  background-color: rgb(var(--mdui-color-surface-container));
  color: rgb(var(--mdui-color-on-surface));
  outline: none;
  line-height: 1.5;
  box-sizing: border-box;
}
</style>
