<template>
  <div class="main">
    <div class="login-box">
      <h2>vue3-admin-antdv管理后台</h2>
      <div class="login-form-container">
        <Form :rules="rules" :model="form">
          <FormItem ref="email" name="email" v-bind="validateInfos.email">
            <Input size="large" placeholder="请输入登录邮箱" v-model:value="form.email" style="width:320px" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);">
              <template v-slot:prefix>
                <MailOutlined style="color:rgba(0,0,0,.25)"/>
              </template>
            </Input>
          </FormItem>
          <FormItem ref="password" name="password" v-bind="validateInfos.password">
            <InputPassword size="large" placeholder="请输入登录密码" v-model:value="form.password" style="width:320px" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);">
              <template v-slot:prefix>
                <LockOutlined style="color:rgba(0,0,0,.25)"/>
              </template>
            </InputPassword>
          </FormItem>
          <FormItem ref="captcha" name="captcha" v-bind="validateInfos.captcha">
            <Input size="large" placeholder="请输入图片验证码" v-model:value="form.captcha" style="width:160px" readonly onfocus="this.removeAttribute('readonly');" onblur="this.setAttribute('readonly',true);"/>
          </FormItem>
          <Tooltip placement="right" title="点击刷新图片验证码">
          <div class="captcha">
            <img width="150" :src="captchaImg" @click="getCaptcha"/>
          </div></Tooltip>
          <FormItem>
            <Button size="large" type="primary" :loading="loading" @click="login">登录</Button>
          </FormItem>
        </Form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {LockOutlined, MailOutlined} from '@ant-design/icons-vue'
import {Button, Form, Input, message, Tooltip} from 'ant-design-vue'
import {onMounted, reactive, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {AccountApi, SystemApi} from '../../api'
import {TokenKey} from '../../constant'
import {AdminStore} from '../../store'

const FormItem = Form.Item
const InputPassword = Input.Password
const store = AdminStore()
const route = useRoute()
const router = useRouter()
const {currentRoute} = router

const rules = reactive({
  email: [{required: true, message: '请输入登录邮箱', trigger: ['change', 'blur']}],
  password: [{required: true, message: '请输入登录密码', trigger: ['change', 'blur']}],
  captcha: [{required: true, message: '请输入图片验证码', trigger: ['change', 'blur']}]
})

const form = reactive({email: '', password: '', captcha: '', uuid: ''})
const captchaImg = ref('')
const loading = ref(false)
const {validate, validateInfos} = Form.useForm(form, rules)

const login = (e: any) => {
  e.preventDefault()
  validate().then(async (values) => {
    loading.value = true
    const data = await AccountApi.login(values.email, values.password, form.uuid, values.captcha)
    loading.value = false
    if (!data) {
      return getCaptcha()
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

const getCaptcha = async () => {
  const result = await SystemApi.getCaptcha()
  captchaImg.value = `data:image/png;base64,${result.captcha}`
  form.uuid = result.uuid
  console.log(form)
}

// 生命周期
onMounted(() => getCaptcha())

// 监听回车键
document.onkeydown = function (e) {
  if (e.code === 'Enter' && currentRoute.value.path === '/login') {
    login(e)
  }
}
</script>

<style scoped>

.main {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
  object-fit: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url("../../assets/images/login-background.jpg");
}

.login-box {
  position: absolute;
  top: 0vh;
  left: 50vw;
  padding: 40px;
  transform: translate(-50%, 80%);
  background: rgba(0, 0, 0, .5);
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, .6);
  border-radius: 10px;
}

.login-box h2 {
  padding: 0;
  color: #fff;
  text-align: center;
}

.captcha {
  position: absolute;
  right: 42px;
  top: 200px;
  cursor: pointer;
}

</style>
