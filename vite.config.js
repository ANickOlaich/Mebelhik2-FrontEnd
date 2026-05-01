import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    nodePolyfills({
      include: ['stream', 'util']
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 🔥 ВАЖНО ДЛЯ TINYMCE
  optimizeDeps: {
    include: ['tinymce', '@tinymce/tinymce-vue']
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },

      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})