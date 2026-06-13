import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'mdui/mdui.css'
import 'mdui'
import { setTheme } from 'mdui'
import App from './App.vue'

// Set AMOLED Dark Theme
setTheme('dark')
document.documentElement.classList.add('mdui-theme-dark')

// Custom AMOLED background
const style = document.createElement('style')
style.textContent = `
  :root.mdui-theme-dark {
    --mdui-color-background: 0, 0, 0;
    --mdui-color-surface: 0, 0, 0;
    --mdui-color-surface-container: 15, 15, 15;
    --mdui-color-surface-container-low: 10, 10, 10;
    --mdui-color-surface-container-high: 25, 25, 25;
    --mdui-color-surface-container-highest: 45, 45, 45;
  }
  body {
    background-color: rgb(var(--mdui-color-background));
    color: rgb(var(--mdui-color-on-background));
    margin: 0;
    font-family: Roboto, sans-serif;
  }
  mdui-snackbar {
    --mdui-color-inverse-surface: 30, 30, 30;
    --mdui-color-inverse-on-surface: 240, 240, 240;
  }
`
document.head.appendChild(style)

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
