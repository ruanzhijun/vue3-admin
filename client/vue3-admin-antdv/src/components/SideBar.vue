<template>
  <LayoutSider :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }">
    <router-link to="/index">
      <div class="logo">vue3-admin-antdv</div>
    </router-link>
    <Menu theme="dark" mode="inline" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys">
      <MenuSubMenu v-for="router in routers" :key="router.name">
        <template v-slot:title>
          <component :is="router.meta.icon"/>
          {{ router.meta.name }}
        </template>
        <MenuItem v-for="route in router.children" :key="route.name">
          <router-link :to="route.path">{{ route.meta.name }}</router-link>
        </MenuItem>
      </MenuSubMenu>
    </Menu>
  </LayoutSider>
</template>

<script lang="ts" setup>
import {Layout, Menu} from 'ant-design-vue'
import {onMounted, ref, watch} from 'vue'
import {RouteRecordRaw, useRouter} from 'vue-router'
import {GetAuthority} from '../constant'
import {getModuleByPageName, getRouters} from '../router'
import store from '../store'

const LayoutSider = Layout.Sider
const MenuItem = Menu.Item
const MenuSubMenu = Menu.SubMenu

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
</script>
<style>
.ant-layout-sider-children .logo {
  height: 32px;
  margin: 16px;
  color: #FFFFFF;
}
</style>
