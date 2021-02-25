import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import {defineConfig} from 'vite'
import html from 'vite-plugin-html'

module.exports = defineConfig({
  publicDir: path.join(__dirname, 'public'),
  plugins: [
    vue(),
    html({minify: true})
  ],
  optimizeDeps: {
    include: ['axios', 'ant-design-vue', 'vue', 'vue-router', 'vuex']
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    brotliSize: false,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      ecma: 2015,
      sourceMap: false,
      output: {
        beautify: false,
        comments: false
      },
      compress: {
        booleans: true,
        drop_console: true,
        drop_debugger: true,
        reduce_vars: true
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3002'
    }
  }
})
