<template>
  <a-layout id="components-layout-demo-fixed-sider">
    <a-sideBar/>
    <a-layout>
      <div class="top">
        <a-breadcrumb>
          <a-breadcrumb-item>后台首页</a-breadcrumb-item>
          <a-breadcrumb-item v-if="moduleName && pageName">{{ moduleName }}</a-breadcrumb-item>
          <a-breadcrumb-item v-if="moduleName && pageName">{{ pageName }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="user">
          <a-dropdown :trigger="['click']">
            <a class="ant-dropdown-link" @click="e => e.preventDefault()">小丸子
              <a-caret-down-icon/>
            </a>
            <template v-slot:overlay>
              <a-menu>
                <a-menu-item key="logout">
                  <a @click="logout">退出登录</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>

      <div class="main-container">
        <div class="sub-container">
          <router-view/>
        </div>
      </div>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import {CaretDownOutlined} from '@ant-design/icons-vue'
import {Breadcrumb, Dropdown, Layout as AntLayout, Menu} from 'ant-design-vue'
import SideBar from './SideBar.vue'
import {getRouters} from '../router'
import {logout} from '../util'
import {defineComponent, watch, ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'

export default defineComponent({
  components: {
    'a-caret-down-icon': CaretDownOutlined,
    'a-dropdown': Dropdown,
    'a-breadcrumb': Breadcrumb,
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    'a-breadcrumb-item': Breadcrumb.Item,
    'a-layout': AntLayout,
    'a-sideBar': SideBar
  },
  setup() {
    // 变量
    const router = useRouter()
    const {currentRoute} = router
    const moduleName = ref('')
    const pageName = ref('')

    // 监听
    watch(currentRoute, () => updateBreadCrumb())

    // 生命周期
    onMounted(() => updateBreadCrumb())

    // 方法定义
    const updateBreadCrumb = () => {
      pageName.value = currentRoute.value.meta.name
      moduleName.value = findFather(currentRoute.value)
    }

    const findFather = (currentRoute: any): string => {
      for (const router of getRouters()) {
        if (!router.children) {
          continue
        }
        for (const child of router.children) {
          if (child.name === currentRoute.name) {
            return router.meta ? router.meta.name.toString() : ''
          }
        }
      }

      return ''
    }

    return {logout, moduleName, pageName}
  }
})
</script>
<style>
body {
  background: #F0F0F0;
}

#components-layout-demo-fixed-sider .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}


.top {
  margin: 0 0 0 200px;
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 1px 1px rgba(100, 100, 100, 0.2);
  position: relative;
  z-index: 5;
  max-width: 100%;
}

.top .ant-breadcrumb {
  width: 300px;
  margin: 15px 0 0 15px;
  float: left;
}

.top .user a {
  float: right;
  margin-right: 200px;
  padding: 15px;
}

.main-container {
  height: 100%;
  margin: 0 0 0 200px;
  padding: 10px;
  max-height: 100%;
  background: #F0F0F0;
}

.main-container .sub-container {
  background-color: #FFF;
  transition: left .3s;
  z-index: 999;
  padding: 10px;
  border-radius: 3px;
  border: 1px solid #F0F0F0;
  box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
  -webkit-transition: .5s ease-in-out;
  -moz-transition: .5s ease-in-out;
  -o-transition: .5s ease-in-out;
}
</style>
