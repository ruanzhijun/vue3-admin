<template>
  <div class="main">
    <div class="login-box">
      <h2>vue3-admin-antdv管理后台</h2>
      <div class="login-form-container">
        <Form :rules="rules" :model="form">
          <FormItem ref="username" name="username" v-bind="validateInfos.username">
            <Input placeholder="请输入登录帐号" v-model:value="form.username" style="width:320px">
              <template v-slot:prefix>
                <UserOutlined style="color:rgba(0,0,0,.25)"/>
              </template>
            </Input>
          </FormItem>
          <FormItem ref="password" name="password" v-bind="validateInfos.password">
            <InputPassword placeholder="请输入登录密码" v-model:value="form.password" style="width:320px">
              <template v-slot:prefix>
                <LockOutlined style="color:rgba(0,0,0,.25)"/>
              </template>
            </InputPassword>
          </FormItem>
          <FormItem>
            <Button type="primary" :loading="loading" @click="login">登录</Button>
          </FormItem>
        </Form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {LockOutlined, UserOutlined} from '@ant-design/icons-vue'
import {Button, Form, Input, message} from 'ant-design-vue'
import {reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {AccountApi} from '../../api'
import {TokenKey} from '../../constant'
import {AdminStore} from '../../store'

const FormItem = Form.Item
const InputPassword = Input.Password
const store = AdminStore()
const route = useRoute()
const router = useRouter()
const {currentRoute} = router

const rules = reactive({
  username: [{required: true, message: '请输入登录帐号', trigger: ['change', 'blur']}],
  password: [{required: true, message: '请输入登录密码', trigger: ['change', 'blur']}]
})

const form = reactive({username: '', password: ''})
const loading = ref(false)
const {validate, validateInfos} = Form.useForm(form, rules)

const login = (e: any) => {
  e.preventDefault()
  validate().then(async (values) => {
    loading.value = true
    const data = await AccountApi.login(values.username, values.password)
    loading.value = false
    if (!data) {
      return
    }
    message.success('登录成功')
    store.$patch({authority: data.authority})
    store.$patch({adminInfo: {username: data.username}})
    localStorage.setItem(TokenKey, data.token)
    const redirect = String(route.query.redirect || '')
    if (!!redirect) {
      // 绝对地址
      if (redirect.includes('http://') || redirect.includes('https://')) {
        window.location.href = redirect
        return
      }
      // 相对地址
      router.push({path: redirect})
    } else {
      router.push({name: 'index'})
    }
  }).catch(err => err)
}

// 监听回车键
document.onkeydown = function (e) {
  if (e.code === 'Enter' && currentRoute.value.path === '/login') {
    login(e)
  }
}
</script>

<style scoped>
.main {
  float: left;
  width: 100%;
  height: 100vh;
  overflow-y: hidden;
  font-family: sans-serif;
  background-size: cover;
  background: linear-gradient(#141e30, #243b55);
}

.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  padding: 40px;
  transform: translate(-50%, 80%);
  background: rgba(0, 0, 0, .5);
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, .6);
  border-radius: 10px;
}

.login-box h2 {
  margin: 0 0 30px;
  padding: 0;
  color: #fff;
  text-align: center;
}
</style>
