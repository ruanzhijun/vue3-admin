<template>
  <ConfigProvider :locale="locale">
    <RouterView/>
  </ConfigProvider>
  <BackTop :visibility-height="10"/>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue'
import {ConfigProvider, FloatButton} from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {AdminStore} from "@/store";

const locale = zhCN
const BackTop = FloatButton.BackTop

onMounted(() => {
  const adminStore = AdminStore()
  adminStore.$patch({authority: {init: false}})

  // 非本地开发环境禁止网页右键功能
  if (import.meta.env.VITE_ENV != 'dev') {
    document.addEventListener('selectstart', event => event.preventDefault())
    document.addEventListener('contextmenu', event => event.preventDefault())
  }
})

</script>
