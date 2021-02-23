<template>
  <a-config-provider :locale="locale">
    <router-view/>
  </a-config-provider>
</template>

<script lang="ts">
import {ConfigProvider} from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {defineComponent} from 'vue'

export default defineComponent({
  components: {
    'a-config-provider': ConfigProvider
  },
  setup() {
    return {locale: zhCN}
  }
})
</script>
