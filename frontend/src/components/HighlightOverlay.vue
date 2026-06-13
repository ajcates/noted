<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
}>();

const highlightedHtml = computed(() => {
  if (!props.text) return '';
  
  // Escape HTML first to prevent XSS and broken rendering
  let escaped = props.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.split('\n').map(line => {
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
    
    // Bold/Italic
    styled = styled.replace(/\*\*(.*?)\*\*/g, '<span class="md-bold">**$1**</span>');
    styled = styled.replace(/__(.*?)__/g, '<span class="md-bold">__$1__</span>');
    styled = styled.replace(/\*(.*?)\*/g, '<span class="md-italic">*$1*</span>');
    
    // Highlights
    styled = styled.replace(/==(.*?)==/g, '<span class="md-mark">==$1==</span>');
    
    return styled || '<br>';
  }).join('\n');
});
</script>

<template>
  <div class="highlight-overlay" v-html="highlightedHtml"></div>
</template>

<style scoped>
.highlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  pointer-events: none;
  color: rgb(var(--mdui-color-on-surface));
  z-index: 1;
  box-sizing: border-box;
}

:deep(.md-h1) {
  font-size: 1.5em;
  color: #CDDC39;
  font-weight: bold;
}

:deep(.md-h2) {
  font-size: 1.25em;
  color: #CDDC39;
  font-weight: bold;
}

:deep(.md-h3) {
  font-size: 1.1em;
  color: #CDDC39;
  font-weight: bold;
}

:deep(.md-bold) {
  font-weight: bold;
  color: #81C784;
}

:deep(.md-italic) {
  font-style: italic;
  color: #81C784;
}

:deep(.md-mark) {
  background-color: #CDDC39;
  color: black;
  border-radius: 2px;
}

:deep(.md-li) {
  color: #CDDC39;
  font-weight: bold;
}
</style>
