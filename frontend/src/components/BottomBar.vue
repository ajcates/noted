<script setup lang="ts">
import '@mdui/icons/border-color.js';
import '@mdui/icons/format-color-reset.js';
import '@mdui/icons/undo.js';
import '@mdui/icons/spellcheck.js';
import '@mdui/icons/title.js';
import '@mdui/icons/format-list-bulleted.js';
import '@mdui/icons/link.js';
import '@mdui/icons/text-fields.js';
import '@mdui/icons/data-object.js';
import '@mdui/icons/visibility.js';
import '@mdui/icons/history.js';
import '@mdui/icons/search.js';

const props = defineProps<{
  isHighlighted: boolean;
  canUndo: boolean;
  wordCount: number;
  readingTime: number;
}>();

const emit = defineEmits([
  'highlight', 
  'undo', 
  'format', 
  'header', 
  'list', 
  'link', 
  'escape',
  'preview',
  'history',
  'search'
]);
</script>

<template>
  <mdui-bottom-app-bar class="bottom-bar" style="height: 56px;">
    <!-- Standalone Undo button all the way to the left -->
    <mdui-button-icon
      :disabled="!canUndo"
      tooltip="Undo"
      style="color: #CDDC39; --mdui-button-icon-size: 40px;"
      tabindex="-1"
      @click="emit('undo')"
      @pointerdown.prevent
      @mousedown.prevent
    >
      <mdui-icon-undo></mdui-icon-undo>
    </mdui-button-icon>

    <!-- Spacer & Metrics in the middle -->
    <div class="spacer">
      <div class="metrics">
        <span>{{ wordCount }} words</span>
        <span class="metrics-divider">|</span>
        <span>{{ readingTime }} min</span>
      </div>
    </div>

    <!-- Text editing group all the way to the right -->
    <div class="text-editing-group">
      <!-- Text Actions Dropdown -->
      <mdui-dropdown @pointerdown.prevent @mousedown.prevent>
        <mdui-button-icon 
          slot="trigger" 
          tooltip="Format Options" 
          style="color: #CDDC39; --mdui-button-icon-size: 40px;"
          tabindex="-1"
          @pointerdown.prevent 
          @mousedown.prevent
        >
          <mdui-icon-text-fields></mdui-icon-text-fields>
        </mdui-button-icon>
        <mdui-menu @pointerdown.prevent @mousedown.prevent tabindex="-1">
          <mdui-menu-item @click="emit('highlight')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
            <mdui-icon-format-color-reset v-if="isHighlighted" slot="icon"></mdui-icon-format-color-reset>
            <mdui-icon-border-color v-else slot="icon"></mdui-icon-border-color>
            Highlight
          </mdui-menu-item>
          <mdui-menu-item @click="emit('header')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
            <mdui-icon-title slot="icon"></mdui-icon-title>
            Header
          </mdui-menu-item>
          <mdui-menu-item @click="emit('list')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
            <mdui-icon-format-list-bulleted slot="icon"></mdui-icon-format-list-bulleted>
            List
          </mdui-menu-item>
          <mdui-menu-item @click="emit('link')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
            <mdui-icon-link slot="icon"></mdui-icon-link>
            Link
          </mdui-menu-item>
          <mdui-menu-item @click="emit('escape')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
            <mdui-icon-data-object slot="icon"></mdui-icon-data-object>
            Escape MD
          </mdui-menu-item>
          <mdui-divider></mdui-divider>
          <mdui-menu-item @click="emit('format')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
            <mdui-icon-spellcheck slot="icon"></mdui-icon-spellcheck>
            Auto-format
          </mdui-menu-item>
        </mdui-menu>
      </mdui-dropdown>

      <!-- Preview Button -->
      <mdui-button-icon
        tooltip="Preview"
        style="color: #CDDC39; --mdui-button-icon-size: 40px;"
        tabindex="-1"
        @click="emit('preview')"
        @pointerdown.prevent
        @mousedown.prevent
      >
        <mdui-icon-visibility></mdui-icon-visibility>
      </mdui-button-icon>

      <!-- History Button -->
      <mdui-button-icon
        tooltip="History"
        style="color: #CDDC39; --mdui-button-icon-size: 40px;"
        tabindex="-1"
        @click="emit('history')"
        @pointerdown.prevent
        @mousedown.prevent
      >
        <mdui-icon-history></mdui-icon-history>
      </mdui-button-icon>

      <!-- Search button (all the way to the right) -->
      <mdui-button-icon
        tooltip="Search & Replace"
        style="color: #CDDC39; --mdui-button-icon-size: 40px;"
        tabindex="-1"
        @click="emit('search')"
        @pointerdown.prevent
        @mousedown.prevent
      >
        <mdui-icon-search></mdui-icon-search>
      </mdui-button-icon>
    </div>
  </mdui-bottom-app-bar>
</template>

<style scoped>
.bottom-bar {
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.spacer {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.metrics {
  font-size: 11px;
  opacity: 0.7;
  display: flex;
  align-items: center;
}
.metrics-divider {
  margin: 0 4px;
  opacity: 0.5;
}
.text-editing-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
