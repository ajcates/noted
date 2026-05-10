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
    --mdui-color-surface-container: 10, 10, 10;
    --mdui-color-surface-container-low: 5, 5, 5;
    --mdui-color-surface-container-high: 20, 20, 20;
    --mdui-color-surface-container-highest: 30, 30, 30;
  }
  body {
    background-color: rgb(var(--mdui-color-background));
    color: rgb(var(--mdui-color-on-background));
    margin: 0;
    font-family: Roboto, sans-serif;
  }
`
document.head.appendChild(style)

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
