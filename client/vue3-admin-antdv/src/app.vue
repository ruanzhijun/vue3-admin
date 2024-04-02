<template>
  <ConfigProvider :locale="locale">
    <RouterView/>
  </ConfigProvider>
</template>

<script lang="ts" setup>
import {Watermark} from '@pansy/watermark'
import {ConfigProvider} from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {onMounted} from 'vue'

new Watermark({text: 'vue3-admin-antdv', zIndex: 99999, container: 'app', blindOpacity: 1}).show()
const visible = true
const locale = zhCN
onMounted(() => {
  // 禁止网页复制和右键功能
  // document.addEventListener('selectstart', event => event.preventDefault())
  // document.addEventListener('contextmenu', event => event.preventDefault())
})
</script>
