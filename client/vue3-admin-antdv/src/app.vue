<template>
  <a-config-provider :locale="locale">
    <router-view/>
  </a-config-provider>
</template>

<script lang="ts">
import {ConfigProvider} from 'ant-design-vue'
import {defineComponent} from 'vue'

export default defineComponent({
  components: {
    'a-config-provider': ConfigProvider
  }
})
</script>
