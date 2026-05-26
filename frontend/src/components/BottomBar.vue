<script setup lang="ts">
import '@mdui/icons/border-color.js';
import '@mdui/icons/format-color-reset.js';
import '@mdui/icons/smart-toy.js';
import '@mdui/icons/play-arrow.js';
import '@mdui/icons/undo.js';
import '@mdui/icons/spellcheck.js';
import '@mdui/icons/title.js';
import '@mdui/icons/format-list-bulleted.js';
import '@mdui/icons/link.js';
import '@mdui/icons/text-fields.js';
import '@mdui/icons/data-object.js';

const props = defineProps<{
  isHighlighted: boolean;
  canUndo: boolean;
  isProcessing: boolean;
}>();

const emit = defineEmits(['highlight', 'run-prompt', 'undo', 'format', 'select-prompt', 'header', 'list', 'link', 'escape']);

const prompts = [
  { id: 'summarize', name: 'Summarize' },
  { id: 'fix_grammar', name: 'Fix Grammar' },
  { id: 'professional', name: 'Professional' },
  { id: 'creative', name: 'Creative' }
];

const handlePromptSelect = (id: string) => {
  emit('select-prompt', id);
};
</script>

<template>
  <mdui-bottom-app-bar class="bottom-bar" style="height: 56px;">
    <slot name="extra-start"></slot>
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
        <mdui-menu-item :disabled="!canUndo" @click="emit('undo')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
          <mdui-icon-undo slot="icon"></mdui-icon-undo>
          Undo
        </mdui-menu-item>
        <mdui-menu-item @click="emit('format')" @pointerdown.prevent @mousedown.prevent tabindex="-1" style="color: #CDDC39; --mdui-menu-item-height: 40px; font-size: 14px;">
          <mdui-icon-spellcheck slot="icon"></mdui-icon-spellcheck>
          Auto-format
        </mdui-menu-item>
      </mdui-menu>
    </mdui-dropdown>

    <div class="spacer"></div>

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
      <mdui-menu @change="(e: any) => handlePromptSelect(e.target.value)" @pointerdown.prevent @mousedown.prevent tabindex="-1">
        <mdui-menu-item 
          v-for="p in prompts" 
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

    <mdui-fab 
      size="small" 
      class="run-fab"
      :loading="isProcessing"
      @click="emit('run-prompt')"
      @pointerdown.prevent
      @mousedown.prevent
      tabindex="-1"
      tooltip="Run AI Prompt"
      style="background-color: #CDDC39; color: black; width: 40px; height: 40px;"
    >
      <mdui-icon-play-arrow slot="icon"></mdui-icon-play-arrow>
    </mdui-fab>
    <slot name="extra-end"></slot>
  </mdui-bottom-app-bar>
</template>

<style scoped>
.bottom-bar {
  padding: 0 8px;
  gap: 8px;
}
.spacer {
  flex-grow: 1;
}
.run-fab {
  margin-left: 8px;
}
</style>
