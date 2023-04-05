import {defineStore} from 'pinia'
import {GetAdminInfo, GetAuthority, SaveAdminInfo, SaveAuthority} from '../constant'

export const AdminStore = defineStore({
  id: 'admin',
  persist: true,
  state: () => ({
    adminInfo: {username: ''},
    authority: {
      init: false,
      pages: [],
      components: []
    }
  }),
  getters: {
    [GetAuthority](state) {
      return state.authority
    },
    [GetAdminInfo](state) {
      return state.adminInfo
    }
  },
  actions: {
    [SaveAuthority](state: any, authority: any) {
      Object.assign(authority, {init: true})
      state.authority = authority
    },
    [SaveAdminInfo](state: any, adminInfo: any) {
      state.adminInfo = adminInfo
    }
  }
})
