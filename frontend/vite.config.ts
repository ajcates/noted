import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../version.json'), 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_NUMBER__: JSON.stringify(version.version),
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: (tag) => tag.startsWith('mdui-')
        }
      }
    }),
    {
      name: 'force-exit',
      apply: 'build',
      closeBundle() {
        console.log('Build finished, forcing exit...');
        setTimeout(() => process.exit(0), 1000);
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6767',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../server/dist/public',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mdui') || id.includes('@mdui')) return 'mdui-vendor';
            if (id.includes('vue') || id.includes('pinia')) return 'vue-vendor';
            if (id.includes('marked')) return 'markdown';
            return 'vendor';
          }
        }
      }
    }
  },
})