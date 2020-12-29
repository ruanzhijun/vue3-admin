import {TokenKey} from '../constant'
import router from '../router'
import {stripEmptyValue} from './'

/**
 * 退出
 */
export function logout(): void {
  localStorage.removeItem(TokenKey)
  router.push({name: 'login'})
}

/**
 * 没有权限
 */
export function noPermission(): void {
  router.push({name: '403'})
}

/**
 * 根据浏览器url获取参数
 */
export function queryString(): any {
  return stripEmptyValue(router.currentRoute.value && router.currentRoute.value.query ? router.currentRoute.value.query : {})
}

/**
 * 更新路由
 * @param data 要更新到路由里面的数据
 */
export function updateRouter(data?: any): void {
  router.push(stripEmptyValue({path: router.currentRoute.value.path, query: stripEmptyValue(data)}))
}
