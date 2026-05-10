<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import debounce from 'lodash/debounce';

const fileStore = useFileStore();
const editorContainer = ref<HTMLElement | null>(null);
let view: EditorView | null = null;

const getLanguage = (filename: string) => {
  if (filename.endsWith('.js') || filename.endsWith('.ts')) return javascript();
  if (filename.endsWith('.md')) return markdown();
  return [];
};

const debouncedSave = debounce((content: string) => {
  fileStore.saveFile(content);
}, 2000);

onMounted(() => {
  if (editorContainer.value) {
    const startState = EditorState.create({
      doc: fileStore.currentContent,
      extensions: [
        basicSetup,
        oneDark,
        getLanguage(fileStore.currentFile?.name || ''),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            debouncedSave(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' }
        })
      ],
    });

    view = new EditorView({
      state: startState,
      parent: editorContainer.value,
    });
  }
});

onBeforeUnmount(() => {
  if (view) {
    view.destroy();
  }
});

// Sync store content if changed externally (though rare in this setup)
watch(() => fileStore.currentContent, (newContent) => {
  if (view && newContent !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newContent }
    });
  }
});
</script>

<template>
  <div class="editor-wrapper">
    <div ref="editorContainer" class="codemirror-editor"></div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  height: calc(100vh - 64px);
  width: 100%;
  display: flex;
  flex-direction: column;
}
.codemirror-editor {
  flex-grow: 1;
  height: 100%;
}
:deep(.cm-editor) {
  height: 100%;
}
</style>
