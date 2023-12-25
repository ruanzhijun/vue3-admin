import {defineStore} from 'pinia'
import {RouteLocationNormalized} from 'vue-router'

// const panes = ref<{title: string; content: string; key: string; closable?: boolean}[]>([{title: '后台首页', content: `后台首页`, key: '1'}, {title: '管理日志', content: `管理日志`, key: '2'}])
export const TabsStore = defineStore({
  id: 'tab',
  persist: false,
  state: () => ({
    current: '',
    tabList: [] as RouteLocationNormalized[]
  }),
  getters: {
    getTabs(state): RouteLocationNormalized[] {
      return state.tabList
    }
  },
  actions: {
    addTabs(route: RouteLocationNormalized){
      for(const tab of this.tabList) {
        if (tab.meta?.name === route.meta?.name) {
          return
        }
      }
      this.tabList.push(route)
      this.current = String(route.name)
    }
  }
})