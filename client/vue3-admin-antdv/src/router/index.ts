import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from 'vue-router'
import {AccountApi} from '../api'
import Layout from '../components/Layout.vue'
import {TokenKey} from '../constant'
import {AdminStore, TabsStore} from '../store'
import {SystemRoute} from './system'
import {UserRoute} from './user'

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
    meta: {name: '后台首页', closable: false},
    component: Layout,
    children: [{
      path: '/index',
      name: 'index',
      component: () => import('../views/common/index.vue')
    }]
  },
  ...UserRoute,
  ...SystemRoute
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

  const adminStore = AdminStore()
  const {pages} = adminStore.authority as {init: boolean, pages: string[], components: string[]}
  if (!pages || pages.length <= 0) {
    getRouters().forEach(module => module.children?.forEach(p => pages.push(String(p.name))))
  }
  return pages.indexOf(page) > -1
}

// 路由钩子
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.matched.length <= 0) {
    return next({name: '404'})
  }

  const tabsStore = TabsStore()
  const adminStore = AdminStore()
  if (tabsStore.tabList.length <= 0) {
    tabsStore.addTabs({name: 'index', meta: {name: '后台首页', closable: false}} as any)
  }
  tabsStore.addTabs(to)
  const token = localStorage.getItem(TokenKey)
  if (token) {
    if (!hasPermission(String(to.name).toString())) {
      return next({name: '403'})
    }

    if (!adminStore.authority.init) {
      const data = await AccountApi.adminInfo()
      adminStore.$patch({authority: {init: true, components: data.authority.components, pages: data.authority.pages}})
      adminStore.$patch({adminInfo: {username: data.username}})
    }

    return next()
  }
  if (String(to.name).toString() === 'login') {
    return next()
  }

  const query = {redirect: `${location.pathname}${location.search}`}
  return next({name: 'login', query})
})

export default router
