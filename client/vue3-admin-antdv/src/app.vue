<template>
  <ConfigProvider :locale="locale">
    <RouterView/>
  </ConfigProvider>
</template>

<script lang="ts" setup>
import {Watermark} from '@pansy/watermark'
import {ConfigProvider} from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

new Watermark({text: 'vue3-admin-antdv', zIndex: 99999, container: 'app'}).show()

const visible = true
const locale = zhCN
</script>
