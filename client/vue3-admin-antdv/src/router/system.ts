import {SettingOutlined} from '@ant-design/icons-vue'
import {RouteRecordRaw} from 'vue-router'
import Layout from '../components/Layout.vue'

export const SystemRoute: RouteRecordRaw[] = [{
  path: '/system',
  name: 'system',
  meta: {name: '系统管理', icon: SettingOutlined},
  component: Layout,
  children: [{
    path: '/system/global/config',
    name: 'global-config',
    component: () => import('../views/system/global-config.vue'),
    meta: {
      keep: true,
      name: '全局配置',
      authority: [
        {name: 'config-list', desc: '查看配置', url: ['/system/global/config']},
        {name: 'create-config', desc: '新增配置', url: ['/system/global/config/save']},
        {name: 'modify-config', desc: '修改配置', url: ['/system/global/config/update']},
        {name: 'delete-config', desc: '删除配置', url: ['/system/global/config/delete']}
      ]
    }
  }, {
    path: '/system/role/manage',
    name: 'role-manage',
    component: () => import('../views/system/role-manage.vue'),
    meta: {
      keep: true,
      name: '角色管理',
      authority: [
        {name: 'role-list', desc: '查看角色', url: ['/account/role/list']},
        {name: 'create-role', desc: '新增角色', url: ['/account/role/add']},
        {name: 'modify-role', desc: '修改角色', url: ['/account/role/edit']},
        {name: 'delete-role', desc: '删除角色', url: ['/account/role/delete']}
      ]
    }
  }, {
    path: '/system/user/manage',
    name: 'user-manage',
    component: () => import('../views/system/user-manage.vue'),
    meta: {
      keep: true,
      name: '人员管理',
      authority: [
        {name: 'admin-list', desc: '查看管理员', url: ['/account/admin/list']},
        {name: 'create-admin', desc: '新增管理员', url: ['/account/admin/add', '/account/role/all']},
        {name: 'modify-admin', desc: '修改管理员', url: ['/account/admin/edit', '/account/admin/detail', '/account/role/all']},
        {name: 'delete-admin', desc: '删除管理员', url: ['/account/admin/delete']}
      ]
    }
  }, {
    path: '/system/manage/log',
    name: 'manage-log',
    component: () => import('../views/system/manage-log.vue'),
    meta: {
      keep: true,
      name: '管理日志',
      authority: [
        {name: 'log-list', desc: '查看管理日志', url: ['/system/log', '/system/urls']}
      ]
    }
  }]
}]
