<template>
  <Result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
    <template v-slot:extra>
      <Button type="primary" @click="$router.push({name:'index'})">
        Back Home
      </Button>
    </template>
  </Result>
</template>

<script lang="ts" setup>
import {Button, Result} from 'ant-design-vue'
</script>
