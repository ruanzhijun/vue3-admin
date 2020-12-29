import {createStore} from 'vuex'
import {GetAdminInfo, GetAuthority, SaveAdminInfo, SaveAuthority} from '../constant'

const store = createStore({
  state: {
    adminInfo: {
      username: ''
    },
    authority: {
      init: false,
      pages: [],
      components: []
    }
  },
  getters: {
    [GetAuthority](state) {
      return state.authority
    },
    [GetAdminInfo](state) {
      return state.adminInfo
    }
  },
  mutations: {
    [SaveAuthority](state, authority) {
      Object.assign(authority, {init: true})
      state.authority = authority
    },
    [SaveAdminInfo](state, adminInfo) {
      state.adminInfo = adminInfo
    }
  }
})
export default store
