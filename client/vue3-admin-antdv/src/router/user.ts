import {UserOutlined} from '@ant-design/icons-vue'
import {RouteRecordRaw} from 'vue-router'
import Layout from '../components/Layout.vue'

export const UserRoute: RouteRecordRaw[] = [{
  path: '/user',
  name: 'user',
  meta: {name: '用户管理', icon: UserOutlined},
  component: Layout,
  children: [{
    path: '/user/list',
    name: 'user-list',
    component: () => import('../views/user/user-list.vue'),
    meta: {
      keep: true,
      name: '用户列表',
      authority: [
        {name: 'user-list', desc: '查看列表', url: ['/user/list']}
      ]
    }
  }]
}]
