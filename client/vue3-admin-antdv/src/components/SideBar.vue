<template>
  <a-layout-sider :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }">
    <router-link to="/index">
      <div class="logo">vue3-admin-antdv</div>
    </router-link>
    <a-menu theme="dark" mode="inline" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys">
      <a-sub-menu v-for="router in routers" :key="router.name">
        <template v-slot:title>
          <component :is="router.meta.icon"/>
          {{ router.meta.name }}
        </template>
        <a-menu-item v-for="route in router.children" :key="route.name">
          <router-link :to="route.path">{{ route.meta.name }}</router-link>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </a-layout-sider>
</template>
<script lang="ts">
import {Button, Layout, Menu} from 'ant-design-vue'
import {defineComponent, onMounted, ref, watch} from 'vue'
import {RouteRecordRaw, useRouter} from 'vue-router'
import {GetAuthority} from '../constant'
import {getRouters, getModuleByPageName} from '../router'
import store from '../store'

export default defineComponent({
  components: {
    'a-layout-sider': Layout.Sider,
    'a-menu': Menu,
    'a-button': Button,
    'a-menu-item': Menu.Item,
    'a-sub-menu': Menu.SubMenu
  },
  setup() {
    // 变量
    const {currentRoute} = useRouter()
    const routers = ref<RouteRecordRaw[]>([])
    const openKeys = ref([''])
    const selectedKeys = ref([''])

    // 监听
    watch(currentRoute, () => updateMenuKey())

    // 生命周期
    onMounted(() => {
      updateMenuKey()
      routers.value = filterAsyncRoutes()
    })

    // 方法定义
    const updateMenuKey = () => {
      selectedKeys.value = [String(currentRoute.value.name).toString()]
      openKeys.value = [getModuleByPageName(selectedKeys.value[0])]
    }

    const filterAsyncRoutes = (): RouteRecordRaw[] => {
      const routers = getRouters()
      const {pages} = store.getters[GetAuthority] as {urls: string[], pages: string[], components: string[]}
      if (!pages) {
        return routers
      }

      const modules = new Set<string>()
      pages.forEach(page => modules.add(getModuleByPageName(page)))
      const router: RouteRecordRaw[] = []
      for (const r of routers) {
        if (!modules.has(String(r.name))) {
          continue
        }

        const tmp = r.children || []
        r.children = []
        for (const child of tmp || []) {
          if (pages.indexOf(String(child.name)) <= -1) {
            continue
          }
          r.children.push(child)
        }

        router.push(r)
      }

      return router
    }

    return {routers, openKeys, selectedKeys}
  }
})
</script>
<style>
.ant-layout-sider-children .logo {
  height: 32px;
  margin: 16px;
  color: #FFFFFF;
}
</style>
