<template>
  <Layout id="components-layout-demo-fixed-sider">
    <SideBar/>
    <Layout>
      <div class="top">
        <div class="user">
          <Dropdown :trigger="['click']">
            <a class="ant-dropdown-link" @click="e => e.preventDefault()">{{ username }}
              <CaretDownOutlined/>
            </a>
            <template v-slot:overlay>
              <Menu>
                <MenuItem key="logout">
                  <a @click="onModifyPassword">修改密码</a>
                </MenuItem>
                <MenuItem key="logout">
                  <a @click="logout">退出登录</a>
                </MenuItem>
              </Menu>
            </template>
          </Dropdown>
        </div>
      </div>
      <div class="tabs">
        <Tabs v-model:activeKey="tabsStore.current" hide-add type="editable-card" @edit="tabsEdit" @tabClick="tabsClick">
          <TabPane v-for="tab in tabsStore.tabList" :key="tab.name" :tab="tab.meta?.name" :closable="tab.meta?.closable">
          </TabPane>
        </Tabs>
      </div>
      <div class="main-container">
        <div class="sub-container">
          <router-view/>
        </div>
      </div>
    </Layout>
  </Layout>
  <Modal v-model:visible="modifyPasswordModalVisible" :title="modifyPasswordModalTitle" :closable="true" :keyboard="false" :maskClosable="false" :footer="null" :destroyOnClose="true" @cancel="onCancel">
    <Form :model="modifyPasswordForm" :rules="modifyPasswordRules" :label-col="{span:4}" :wrapper-col="{span:16}">
      <FormItem ref="password" label="登录密码" name="password" v-bind="validateInfos.password">
        <InputPassword placeholder="请输入要修改的登录密码" v-model:value="modifyPasswordForm.password"/>
      </FormItem>
      <FormItem ref="password2" label="再来一次" name="password2" v-bind="validateInfos.password2">
        <InputPassword placeholder="请再次输入要修改的登录密码" v-model:value="modifyPasswordForm.password2"/>
      </FormItem>
      <div id="password-not-equals" style="display:none;color:#f5222d;position:relative;left:80px">两次输入的密码不一致</div>
      <FormItem :wrapper-col="{span:14,offset:4}">
        <Space>
          <Button type="primary" :loading="submitLoading" @click="onSubmit">提交</Button>
          <Button @click="onCancel">取消</Button>
        </Space>
      </FormItem>
    </Form>
  </Modal>
</template>

<script lang="ts" setup>
import {CaretDownOutlined} from '@ant-design/icons-vue'
import {Button, Dropdown, Form, Input, Layout, Menu, message, Modal, Space, Tabs} from 'ant-design-vue'
import {onMounted, reactive, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {AccountApi} from '../api'
import {TokenKey} from '../constant'
import {getRouters} from '../router'
import {AdminStore, TabsStore} from '../store'
import {logout} from '../util'
import SideBar from './SideBar.vue'

const FormItem = Form.Item
const MenuItem = Menu.Item
const TabPane = Tabs.TabPane
const InputPassword = Input.Password

const tabsStore = TabsStore()
const adminStore = AdminStore()
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

const {validate, resetFields, validateInfos} = Form.useForm(modifyPasswordForm, modifyPasswordRules)

// 监听
watch(currentRoute, () => updateBreadCrumb())

// 生命周期
onMounted(() => updateBreadCrumb())

// 获取管理员登录名
const {username} = adminStore.adminInfo

// 方法定义
const tabsEdit = (activeKey: string) => {
  tabsStore.tabList = tabsStore.tabList.filter(e => e.name !== activeKey)
  tabsClick(String(tabsStore.tabList[tabsStore.tabList.length - 1].name))
}

const tabsClick = (activeKey: string) => {
  tabsStore.current = activeKey
  router.push({name: activeKey})
}

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


.top, .tabs {
  margin: 0 0 0 200px;
  background: #fff;
  position: relative;
  z-index: 5;
  max-width: 100%;
}

.tabs {
  padding-top: 5px;
}


.top .user a {
  float: right;
  padding: 15px;
}

.tabs {
  padding-left: 20px;
  padding-right: 20px;
}

.main-container {
  height: 100%;
  margin: 0 0 0 200px;
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
