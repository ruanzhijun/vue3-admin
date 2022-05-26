<template>
  <Result status="403" title="403" sub-title="没有权限">
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
