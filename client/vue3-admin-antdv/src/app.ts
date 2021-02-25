import 'ant-design-vue/dist/antd.min.css'
import 'babel-polyfill'
import {createApp} from 'vue'
import App from './app.vue'
import './css/base.css'
import directive from './directive'
import router from './router'
import store from './store'

const app = createApp(App)

// 加载自定义指令
directive.forEach(v => app.directive(v.name, v.directive))

// 加载store
app.use(store)

// 加载路由
app.use(router)

// 挂载到div#app中
app.mount('#app')
