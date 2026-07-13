import { defineStore } from 'pinia';
import { settingsApi } from '@/api';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    aiInstructions: localStorage.getItem('ai_instructions') || '',
    theme: (localStorage.getItem('theme') || 'auto') as 'light' | 'dark' | 'auto',
  }),
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
