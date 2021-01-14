<template>
  <div class="main">
    <div class="login-box">
      <h2>vue3-admin-antdv管理后台</h2>
      <div class="login-form-container">
        <a-form :rules="rules" :model="form">
          <a-form-item ref="username" name="username" v-bind="validateInfos.username">
            <a-input placeholder="请输入登录帐号" v-model:value="form.username" style="width:320px">
              <template v-slot:prefix>
                <a-user-outlined-icon style="color:rgba(0,0,0,.25)"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item ref="password" name="password" v-bind="validateInfos.password">
            <a-input type="password" placeholder="请输入登录密码" v-model:value="form.password" style="width:320px">
              <template v-slot:prefix>
                <a-lock-outlined-icon style="color:rgba(0,0,0,.25)"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" :loading="loading" @click="onSubmit">登录</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {useForm} from '@ant-design-vue/use'
import {LockOutlined, UserOutlined} from '@ant-design/icons-vue'
import {Button, Form, Input, message} from 'ant-design-vue'
import {defineComponent, reactive, ref} from 'vue'
import {useStore} from 'vuex'
import {useRoute} from 'vue-router'
import {AccountApi} from '../../api'
import {SaveAuthority, SaveAdminInfo, TokenKey} from '../../constant'
import router from '../../router'

export default defineComponent({
  components: {
    'a-user-outlined-icon': UserOutlined,
    'a-lock-outlined-icon': LockOutlined,
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input': Input,
    'a-button': Button
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    const rules = reactive({
      username: [{required: true, message: '请输入登录帐号', trigger: ['change', 'blur']}],
      password: [{required: true, message: '请输入登录密码', trigger: ['change', 'blur']}]
    })

    const form = reactive({
      username: '',
      password: ''
    })

    const loading = ref(false)

    const {validate, validateInfos} = useForm(form, rules)
    const onSubmit = (e: any) => {
      e.preventDefault()
      validate().then(async (values) => {
        loading.value = true
        const data = await AccountApi.login(values.username, values.password)
        loading.value = false
        if (!data) {
          return
        }
        message.success('登录成功')
        store.commit(SaveAuthority, data.authority)
        store.commit(SaveAdminInfo, {username: data.username})
        localStorage.setItem(TokenKey, data.token)
        const redirect = String(route.query.redirect || '')
        if (redirect) {
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
      if (e.code === 'Enter') {
        onSubmit(e)
      }
    }

    return {loading, rules, form, validateInfos, onSubmit}
  }
})
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
  transform: translate(-50%, -50%);
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
