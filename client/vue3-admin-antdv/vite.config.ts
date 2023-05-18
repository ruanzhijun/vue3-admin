import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import {defineConfig} from 'vite'
import {createHtmlPlugin} from 'vite-plugin-html'
import legacy from '@vitejs/plugin-legacy'

module.exports = defineConfig({
  plugins: [
    vue(),
    createHtmlPlugin({minify: true, verbose: false}),
    legacy({
      targets: ['Chrome 100'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true
    })
  ],
  optimizeDeps: {
    include: ['axios', 'ant-design-vue', 'vue', 'vue-router', 'pinia', 'crypto-js']
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      ecma: 2020,
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
    port: 3001,
    proxy: {
      '/api': 'http://127.0.0.1:3002'
    }
  }
})
