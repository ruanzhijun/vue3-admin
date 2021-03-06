import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from 'vue-router'
import {AccountApi} from '../api'
import Layout from '../components/Layout.vue'
import {GetAuthority, SaveAdminInfo, SaveAuthority, TokenKey} from '../constant'
import store from '../store'
import {OperateRoute} from './operate'
import {SystemRoute} from './system'

const whiteList = ['login', 'index', '404', '403'] as string[]
const pageMapping = {} as any
const moduleMapping = {} as any
const componentMapping = {} as any
const descriptionMapping = {} as any

export const routes: RouteRecordRaw[] = [
  {path: '/login', name: 'login', component: () => import('../views/common/login.vue')},
  {path: '/404', name: '404', component: () => import('../views/common/404.vue')},
  {path: '/403', name: '403', component: () => import('../views/common/403.vue')},
  {
    path: '/',
    redirect: '/index',
    component: Layout,
    children: [{
      path: '/index',
      name: 'index',
      component: () => import('../views/common/index.vue')
    }]
  },
  ...SystemRoute,
  ...OperateRoute
]

for (const route of routes.filter(v => whiteList.indexOf(String(v.name)) === -1)) {
  descriptionMapping[String(route.name)] = route.meta?.name
  for (const child of route.children || []) {
    moduleMapping[String(child.name)] = route.name
    descriptionMapping[String(child.name)] = child.meta?.name
    for (const {name, url, desc} of (child.meta?.authority || []) as {name: string, url: string, desc: string}[]) {
      componentMapping[name] = url
      pageMapping[name] = child.name
      descriptionMapping[name] = desc
    }
  }
}

const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior: (): any => ({y: 0})
})

export function getRouters() {
  return routes.filter(v => v.path !== '/').filter(v => v.children && v.children.length > 0)
}

export function getUrlByComponentName(name: string): string[] {
  return componentMapping[name]
}

export function getPageByComponentName(name: string): string {
  return pageMapping[name]
}

export function getModuleByPageName(name: string): string {
  return moduleMapping[name]
}

export function getDescriptionByName(name: string): string {
  return descriptionMapping[name]
}

export function hasPermission(page: string): boolean {
  if (whiteList.indexOf(page) > -1) {
    return true
  }
  const pages = store.getters[GetAuthority].pages || []
  if (pages.length <= 0) {
    getRouters().forEach(module => module.children?.forEach(page => pages.push(page.name)))
  }
  return pages.indexOf(page) > -1
}

// 路由钩子
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.matched.length <= 0) {
    return next({name: '404'})
  }

  const token = localStorage.getItem(TokenKey)
  if (token) {
    if (!hasPermission(String(to.name).toString())) {
      return next({name: '403'})
    }

    if (!store.getters[GetAuthority].init) {
      const data = await AccountApi.adminInfo()
      store.commit(SaveAuthority, data.authority)
      store.commit(SaveAdminInfo, {username: data.username})
    }

    return next()
  } else {
    if (String(to.name).toString() === 'login') {
      return next()
    }

    const query = {redirect: `${location.pathname}${location.search}`}
    return next({name: 'login', query})
  }
})

export default router
