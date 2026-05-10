<script setup lang="ts">
import { computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';

const fileStore = useFileStore();

const breadcrumbs = computed(() => {
  const parts = fileStore.currentPath.split('/').filter((p: string) => p && p !== '.');
  const result = [{ name: 'Root', path: '.' }];
  
  let current = '';
  parts.forEach((part: string) => {
    current = current ? `${current}/${part}` : part;
    result.push({ name: part, path: current });
  });
  
  return result;
});

const navigate = (path: string) => {
  fileStore.navigate(path);
};
</script>

<template>
  <div class="breadcrumbs">
    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
      <span 
        class="crumb" 
        @click="navigate(crumb.path)"
        :class="{ last: index === breadcrumbs.length - 1 }"
      >
        {{ crumb.name }}
      </span>
      <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
    </template>
  </div>
</template>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  font-size: 18px;
  overflow-x: auto;
  white-space: nowrap;
  padding: 0 8px;
}
.crumb {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.crumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
.crumb.last {
  font-weight: bold;
  cursor: default;
}
.crumb.last:hover {
  background: transparent;
}
.separator {
  margin: 0 4px;
  opacity: 0.5;
}
</style>
