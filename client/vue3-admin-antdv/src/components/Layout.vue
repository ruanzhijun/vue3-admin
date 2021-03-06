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
            <a class="ant-dropdown-link" @click="e => e.preventDefault()">{{ username }}
              <a-caret-down-icon/>
            </a>
            <template v-slot:overlay>
              <a-menu>
                <a-menu-item key="logout">
                  <a @click="onModifyPassword">修改密码</a>
                </a-menu-item>
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
  <a-modal v-model:visible="modifyPasswordModalVisible" :title="modifyPasswordModalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" @cancel="onCancel">
    <a-form :model="modifyPasswordForm" :rules="modifyPasswordRules" :label-col="{span:4}" :wrapper-col="{span:16}">
      <a-form-item ref="password" label="登录密码" name="password" v-bind="validateInfos.password">
        <a-input-password placeholder="请输入要修改的登录密码" v-model:value="modifyPasswordForm.password"/>
      </a-form-item>
      <a-form-item ref="password2" label="再来一次" name="password2" v-bind="validateInfos.password2">
        <a-input-password placeholder="请再次输入要修改的登录密码" v-model:value="modifyPasswordForm.password2"/>
      </a-form-item>
      <div id="password-not-equals" style="display:none;color:#f5222d;position:relative;left:80px">两次输入的密码不一致</div>
      <a-form-item :wrapper-col="{span:14,offset:4}">
        <a-space>
          <a-button type="primary" :loading="submitLoading" @click="onSubmit">提交</a-button>
          <a-button @click="onCancel">取消</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import {useForm} from '@ant-design-vue/use'
import {CaretDownOutlined} from '@ant-design/icons-vue'
import {Breadcrumb, Button, Dropdown, Form, Input, Layout, Menu, Modal, Space, message} from 'ant-design-vue'
import {defineComponent, onMounted, reactive, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {GetAdminInfo, TokenKey} from '../constant'
import {getRouters} from '../router'
import store from '../store'
import {AccountApi} from '../api'
import {logout} from '../util'
import SideBar from './SideBar.vue'

export default defineComponent({
  components: {
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input-password': Input.Password,
    'a-button': Button,
    'a-space': Space,
    'a-caret-down-icon': CaretDownOutlined,
    'a-dropdown': Dropdown,
    'a-breadcrumb': Breadcrumb,
    'a-modal': Modal,
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    'a-breadcrumb-item': Breadcrumb.Item,
    'a-layout': Layout,
    'a-sideBar': SideBar
  },
  setup() {
    // 变量
    const router = useRouter()
    const {currentRoute} = router
    const moduleName = ref('')
    const pageName = ref('')
    const submitLoading = ref(false)
    const modifyPasswordModalVisible = ref(false)
    const modifyPasswordModalTitle = ref('')
    const modifyPasswordForm = reactive({password: '', password2: '', equals: ''})
    const modifyPasswordRules = reactive({
      password: [{required: true, message: '请输入要修改的登录密码', trigger: ['change', 'blur']}],
      password2: [{required: true, message: '请再次输入要修改的登录密码', trigger: ['change', 'blur']}]
    })
    const {validate, resetFields, validateInfos} = useForm(modifyPasswordForm, modifyPasswordRules)

    // 监听
    watch(currentRoute, () => updateBreadCrumb())

    // 生命周期
    onMounted(() => updateBreadCrumb())

    // 方法定义
    const updateBreadCrumb = () => {
      pageName.value = String(currentRoute.value.meta.name)
      moduleName.value = findFather(currentRoute.value)
    }

    const onModifyPassword = () => {
      resetFields()
      modifyPasswordModalVisible.value = true
      modifyPasswordModalTitle.value = '修改我的登录密码'
    }

    const onSubmit = (e: any) => {
      e.preventDefault()
      validate().then(async (values) => {
        let result = 0
        submitLoading.value = true
        const {password, password2} = values
        const tooltip = document.getElementById('password-not-equals') as any
        if (password !== password2) {
          tooltip.style.display = 'block'
        } else {
          tooltip.style.display = 'none'
          result = await AccountApi.modifyMyPassword(password)
        }
        submitLoading.value = false
        if (result) {
          message.success('密码修改成功')
          localStorage.removeItem(TokenKey)
          router.push({name: 'login'})
        }
      }).catch(err => err)
    }

    const onCancel = () => {
      modifyPasswordModalVisible.value = false
      resetFields()
    }

    // 获取管理员登录名
    const {username} = store.getters[GetAdminInfo]

    const findFather = (currentRoute: any): string => {
      for (const router of getRouters()) {
        if (!router.children) {
          continue
        }
        for (const child of router.children) {
          if (child.name === currentRoute.name) {
            return router.meta ? String(router.meta.name).toString() : ''
          }
        }
      }

      return ''
    }

    return {
      logout, moduleName, pageName, username, submitLoading,
      modifyPasswordForm, modifyPasswordRules, validateInfos,
      onModifyPassword, onCancel, onSubmit, modifyPasswordModalVisible, modifyPasswordModalTitle
    }
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
