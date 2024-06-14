import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import dynamicImportVariables from 'rollup-plugin-dynamic-import-variables'
import {visualizer} from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import {AntDesignVueResolver} from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import {defineConfig} from 'vite'
import {createHtmlPlugin} from 'vite-plugin-html'

module.exports = defineConfig({
  plugins: [
    vue(),
    AutoImport({resolvers: [AntDesignVueResolver()]}),
    Components({resolvers: [AntDesignVueResolver()]}),
    createHtmlPlugin({minify: true, verbose: false}),
    legacy({
      targets: ['Chrome 100'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true
    }),
    visualizer()
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
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      plugins: [dynamicImportVariables()]
    },
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
