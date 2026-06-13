<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string;
  readonly?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const editorRef = ref<HTMLDivElement | null>(null);

// Highlight Markdown syntax in the contenteditable div
const highlight = (text: string) => {
  if (!text) return '';
  
  // Basic line-by-line highlighting
  return text.split('\n').map(line => {
    let styled = line;
    
    // Headers
    if (line.startsWith('# ')) {
      styled = `<span class="md-h1"># ${line.substring(2)}</span>`;
    } else if (line.startsWith('## ')) {
      styled = `<span class="md-h2">## ${line.substring(3)}</span>`;
    } else if (line.startsWith('### ')) {
      styled = `<span class="md-h3">### ${line.substring(4)}</span>`;
    }
    
    // Lists
    if (line.startsWith('- ')) {
      styled = `<span class="md-li">- </span>${line.substring(2)}`;
    }
    
    // Bold/Italic (very basic)
    styled = styled.replace(/\*\*(.*?)\*\*/g, '<span class="md-bold">**$1**</span>');
    styled = styled.replace(/__(.*?)__/g, '<span class="md-bold">__$1__</span>');
    styled = styled.replace(/\*(.*?)\*/g, '<span class="md-italic">*$1*</span>');
    
    // Highlights
    styled = styled.replace(/==(.*?)==/g, '<span class="md-mark">==$1==</span>');
    
    return styled || '<br>';
  }).join('\n');
};

const updateInternal = () => {
  if (!editorRef.value) return;
  const markdown = editorRef.value.innerText;
  emit('update:modelValue', markdown);
};

// Selection management to prevent losing cursor
const saveSelection = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(editorRef.value!);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;

  return {
    start: start,
    end: start + range.toString().length
  };
};

const restoreSelection = (savedSel: { start: number, end: number } | null) => {
  if (!savedSel || !editorRef.value) return;
  
  const sel = window.getSelection();
  const range = document.createRange();
  let charCount = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const nextCharCount = charCount + node.textContent!.length;
      if (!startNode && savedSel!.start >= charCount && savedSel!.start <= nextCharCount) {
        startNode = node;
        startOffset = savedSel!.start - charCount;
      }
      if (!endNode && savedSel!.end >= charCount && savedSel!.end <= nextCharCount) {
        endNode = node;
        endOffset = savedSel!.end - charCount;
      }
      charCount = nextCharCount;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
      }
    }
  }

  traverse(editorRef.value);

  if (startNode && endNode) {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
};

const handleInput = () => {
  const sel = saveSelection();
  updateInternal();
  // We don't re-render immediately on input to avoid flickering
  // But we need to apply styles eventually.
};

const syncContent = () => {
  if (!editorRef.value) return;
  const sel = saveSelection();
  editorRef.value.innerHTML = highlight(props.modelValue);
  restoreSelection(sel);
};

watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerText !== newVal) {
    syncContent();
  }
});

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = highlight(props.modelValue);
  }
});

defineExpose({
  focus: () => editorRef.value?.focus()
});
</script>

<template>
  <div
    ref="editorRef"
    class="rich-editor"
    :contenteditable="!readonly"
    @input="handleInput"
    @blur="syncContent"
    spellcheck="false"
  ></div>
</template>

<style scoped>
.rich-editor {
  flex-grow: 1;
  width: 100%;
  padding: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  background-color: rgb(var(--mdui-color-surface-container));
  color: rgb(var(--mdui-color-on-surface));
  outline: none;
  line-height: 1.5;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.rich-editor :deep(.md-h1) {
  font-size: 1.5em;
  color: #CDDC39;
  font-weight: bold;
}

.rich-editor :deep(.md-h2) {
  font-size: 1.25em;
  color: #CDDC39;
  font-weight: bold;
}

.rich-editor :deep(.md-h3) {
  font-size: 1.1em;
  color: #CDDC39;
  font-weight: bold;
}

.rich-editor :deep(.md-bold) {
  font-weight: bold;
  color: #81C784;
}

.rich-editor :deep(.md-italic) {
  font-style: italic;
  color: #81C784;
}

.rich-editor :deep(.md-mark) {
  background-color: #CDDC39;
  color: black;
  border-radius: 2px;
}

.rich-editor :deep(.md-li) {
  color: #CDDC39;
  font-weight: bold;
}
</style>
