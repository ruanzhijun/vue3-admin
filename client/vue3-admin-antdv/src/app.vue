<template>
  <ConfigProvider :locale="locale">
    <RouterView/>
  </ConfigProvider>
</template>

<script lang="ts" setup>
import {ConfigProvider} from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const locale = zhCN
</script>
