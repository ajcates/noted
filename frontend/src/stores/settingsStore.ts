import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    aiInstructions: localStorage.getItem('ai_instructions') || '',
    theme: (localStorage.getItem('theme') || 'auto') as 'light' | 'dark' | 'auto',
  }),
  actions: {
    setAiInstructions(instructions: string) {
      this.aiInstructions = instructions;
      localStorage.setItem('ai_instructions', instructions);
    },
    setTheme(theme: 'light' | 'dark' | 'auto') {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      this.applyTheme();
    },
    applyTheme() {
      const isDark = this.theme === 'dark' || (this.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('mdui-theme-dark', isDark);
      document.documentElement.classList.toggle('mdui-theme-light', !isDark);
      // MDUI v2 uses the mdui-theme-mode attribute or classes on html/body
      document.body.setAttribute('mdui-theme', isDark ? 'dark' : 'light');
    }
  }
});
