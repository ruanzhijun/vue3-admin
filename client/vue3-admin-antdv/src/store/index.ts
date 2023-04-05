import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type {App} from 'vue'

const store = createPinia()

// 数据持久化
store.use(piniaPluginPersistedstate)

function setupStore(app: App<Element>) {
  app.use(store)
}

const pinia = {
  install: (app: App) => {
    app.use(store)
  }
}

export * from './admin'
export {store, setupStore, pinia}
