import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'path': 'path-browserify'
    }
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: [
      'pinia',
      'codemirror',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/commands',
      '@codemirror/lang-html',
      '@codemirror/lang-css',
      '@codemirror/lang-javascript',
      '@codemirror/theme-one-dark'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/pinia/, /codemirror/, /node_modules/]
    }
  }
})