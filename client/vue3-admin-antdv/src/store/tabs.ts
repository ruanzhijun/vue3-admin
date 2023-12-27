import {defineStore} from 'pinia'
import {RouteLocationNormalized} from 'vue-router'

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
    addTabs(route: RouteLocationNormalized) {
      if (!route.meta || !route.meta?.name) {
        return
      }

      this.current = String(route.name)
      for (const tab of this.tabList) {
        if (tab.meta?.name === route.meta?.name) {
          return
        }
      }
      this.tabList.push(route)
    }
  }
})