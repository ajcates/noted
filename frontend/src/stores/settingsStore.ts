import { defineStore } from 'pinia';
import { settingsApi } from '@/api';

const clampFontSize = (size: number) => Math.min(24, Math.max(12, Math.round(size)));

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const storedFontSizeValue = localStorage.getItem('editor_font_size');
    const storedFontSize = storedFontSizeValue === null ? Number.NaN : Number(storedFontSizeValue);
    return {
      aiInstructions: localStorage.getItem('ai_instructions') || '',
      theme: (localStorage.getItem('theme') || 'auto') as 'light' | 'dark' | 'auto',
      editorFontSize: Number.isFinite(storedFontSize) ? clampFontSize(storedFontSize) : 15,
      wordWrap: localStorage.getItem('editor_word_wrap') !== 'false',
    };
  },
  actions: {
    async loadSettings() {
      try {
        const settings = await settingsApi.get();
        if (settings) {
          if (settings.aiInstructions !== undefined) {
            this.aiInstructions = settings.aiInstructions;
            localStorage.setItem('ai_instructions', settings.aiInstructions);
          }
          if (settings.theme !== undefined) {
            this.theme = settings.theme;
            localStorage.setItem('theme', settings.theme);
          }
          if (
            settings.editorFontSize !== undefined &&
            settings.editorFontSize !== null &&
            Number.isFinite(Number(settings.editorFontSize))
          ) {
            this.editorFontSize = clampFontSize(Number(settings.editorFontSize));
            localStorage.setItem('editor_font_size', String(this.editorFontSize));
          }
          if (typeof settings.wordWrap === 'boolean') {
            this.wordWrap = settings.wordWrap;
            localStorage.setItem('editor_word_wrap', String(settings.wordWrap));
          }
        }
      } catch (err) {
        console.error('Failed to load settings from server, using local defaults:', err);
      }
    },
    async setAiInstructions(instructions: string) {
      this.aiInstructions = instructions;
      localStorage.setItem('ai_instructions', instructions);
      try {
        await settingsApi.save({
          aiInstructions: this.aiInstructions,
          theme: this.theme,
          editorFontSize: this.editorFontSize,
          wordWrap: this.wordWrap,
        });
      } catch (err) {
        console.error('Failed to save settings to server:', err);
      }
    },
    async setTheme(theme: 'light' | 'dark' | 'auto') {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      this.applyTheme();
      try {
        await settingsApi.save({
          aiInstructions: this.aiInstructions,
          theme: this.theme,
          editorFontSize: this.editorFontSize,
          wordWrap: this.wordWrap,
        });
      } catch (err) {
        console.error('Failed to save settings to server:', err);
      }
    },
    async setEditorFontSize(size: number) {
      this.editorFontSize = clampFontSize(size);
      localStorage.setItem('editor_font_size', String(this.editorFontSize));
      try {
        await settingsApi.save({
          aiInstructions: this.aiInstructions,
          theme: this.theme,
          editorFontSize: this.editorFontSize,
          wordWrap: this.wordWrap,
        });
      } catch (err) {
        console.error('Failed to save settings to server:', err);
      }
    },
    async setWordWrap(enabled: boolean) {
      this.wordWrap = enabled;
      localStorage.setItem('editor_word_wrap', String(enabled));
      try {
        await settingsApi.save({
          aiInstructions: this.aiInstructions,
          theme: this.theme,
          editorFontSize: this.editorFontSize,
          wordWrap: this.wordWrap,
        });
      } catch (err) {
        console.error('Failed to save settings to server:', err);
      }
    },
    applyTheme() {
      const isDark = this.theme === 'dark' || (this.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('mdui-theme-dark', isDark);
      document.documentElement.classList.toggle('mdui-theme-light', !isDark);
      document.body.setAttribute('mdui-theme', isDark ? 'dark' : 'light');
    }
  }
});
