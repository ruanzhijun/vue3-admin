import 'ant-design-vue/dist/antd.css'
import './css/base.css'
import 'babel-polyfill'
import {createApp} from 'vue'
import App from './app.vue'
import directive from './directive'
import router from './router'
import store from './store'

const app = createApp(App)
directive.forEach(v => app.directive(v.name, v.directive))
app.use(store)
app.use(router)
app.mount('#app')
