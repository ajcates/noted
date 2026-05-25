import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'

const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../version.json'), 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_NUMBER__: version.build,
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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'noted',
        short_name: 'noted',
        description: 'A mobile-optimized note editor',
        theme_color: '#2196F3',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woof,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
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
  },
})
