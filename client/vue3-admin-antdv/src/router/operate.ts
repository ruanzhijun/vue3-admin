import {PieChartOutlined} from '@ant-design/icons-vue'
import {RouteRecordRaw} from 'vue-router'
import Layout from '../components/Layout.vue'

export const OperateRoute: RouteRecordRaw[] = [{
  path: '/operate',
  name: 'operate',
  meta: {name: '运营管理', icon: PieChartOutlined},
  component: Layout,
  children: [{
    path: '/operate/activity/signin',
    name: 'sign-in',
    component: () => import('../views/operate/sign-in.vue'),
    meta: {
      name: '签到管理',
      authority: []
    }
  }]
}]
