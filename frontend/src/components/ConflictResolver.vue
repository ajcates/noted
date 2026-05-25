<script setup lang="ts">
import { computed } from 'vue';
import * as diff from 'diff';

const props = defineProps<{
  localContent: string;
  serverContent: string;
  fileName: string;
}>();

const emit = defineEmits(['resolve']);

const diffResult = computed(() => {
  return diff.diffLines(props.serverContent, props.localContent);
});

const resolveWithLocal = () => {
  emit('resolve', props.localContent);
};

const resolveWithServer = () => {
  emit('resolve', props.serverContent);
};
</script>

<template>
  <mdui-dialog class="conflict-dialog" headline="Conflict Detected" open>
    <div class="conflict-info">
      <p>The file <strong>{{ fileName }}</strong> was modified on the server while you were editing it.</p>
    </div>

    <div class="diff-container mdui-prose">
      <div v-for="(part, index) in diffResult" :key="index" :class="['diff-part', part.added ? 'added' : part.removed ? 'removed' : '']">
        {{ part.value }}
      </div>
    </div>

    <mdui-button slot="action" variant="text" @click="resolveWithServer">Use Server Version</mdui-button>
    <mdui-button slot="action" variant="tonal" @click="resolveWithLocal">Keep My Changes</mdui-button>
  </mdui-dialog>
</template>

<style scoped>
.conflict-dialog {
  --mdui-dialog-width: 90vw;
  --mdui-dialog-max-width: 800px;
}
.diff-container {
  max-height: 400px;
  overflow-y: auto;
  background-color: #1e1e1e;
  padding: 16px;
  font-family: monospace;
  white-space: pre-wrap;
  border-radius: 8px;
  margin-top: 16px;
}
.diff-part.added {
  background-color: rgba(76, 175, 80, 0.2);
  color: #81c784;
}
.diff-part.removed {
  background-color: rgba(244, 67, 54, 0.2);
  color: #e57373;
  text-decoration: line-through;
}
</style>
