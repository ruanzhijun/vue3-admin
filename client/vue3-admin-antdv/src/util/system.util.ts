import {Ref, UnwrapRef} from '@vue/reactivity'
import {ref} from 'vue'
import {stripEmptyValue} from '.'
import {DefaultPageSize, MaxPageSize, PageSizeOptions, TokenKey} from '../constant'
import router from '../router'
import {TabsStore} from '../store'

/**
 * 退出
 */
export function logout(): void {
  TabsStore().tabList = []
  localStorage.removeItem(TokenKey)
  router.push({name: 'login'})
}

/**
 * 拒绝请求
 */
export function forbidden(): void {
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

/**
 * 返回一个分页对象
 * @param func 页码、页面大小发生改变时的处理函数
 */
export function usePagination(func?: Function): Ref<UnwrapRef<{current: number, total: number, pageSize: number, showSizeChanger: boolean, pageSizeOptions: string[], extends: any, showTotal: Function, onChange: Function, onShowSizeChange: Function}>> {
  const query = queryString()
  const current = ref(parseInt(query && query.page ? query.page.toString() : '0') || 1)
  const total = ref(-1)
  const pageSize = ref(parseInt(query && query.pageSize ? query.pageSize.toString() : '0') || DefaultPageSize)

  const pagination = ref({
    current,
    total,
    pageSize,
    extends: {} as any,
    showSizeChanger: true,
    pageSizeOptions: PageSizeOptions,
    showTotal: (totalNum: number) => `共 ${totalNum} 条`,
    onChange: (page: number): void => {
      current.value = page
      pagination.value.current = page
      /* eslint no-use-before-define: "off" */
      run()
    },
    onShowSizeChange: (currentNum: number, size: number): void => {
      pagination.value.current = 1
      pageSize.value = size
      pagination.value.pageSize = size
      /* eslint no-use-before-define: "off" */
      run()
    }
  })

  function run(): void {
    pagination.value.current = pagination.value.current || parseInt(query && query.page ? query.page.toString() : '0')
    pagination.value.pageSize = pagination.value.pageSize || parseInt(query && query.pageSize ? query.pageSize.toString() : '0')
    pagination.value.pageSize = pagination.value.pageSize > MaxPageSize ? MaxPageSize : pagination.value.pageSize
    if (!!func && typeof func === 'function') {
      func()
    }
  }

  return pagination
}
