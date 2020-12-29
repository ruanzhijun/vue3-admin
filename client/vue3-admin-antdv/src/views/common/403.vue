<template>
  <a-result status="403" title="403" sub-title="没有权限">
    <template v-slot:extra>
      <a-button type="primary" @click="$router.push({name:'index'})">
        Back Home
      </a-button>
    </template>
  </a-result>
</template>

<script lang="ts">
import {Button, Result} from 'ant-design-vue'
import {defineComponent} from 'vue'

export default defineComponent({
  components: {
    'a-button': Button,
    'a-result': Result
  }
})
</script>
