import { createSSRApp } from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { useHueStore } from './services/HueStore'
import { InitialDataKey } from './util/InjectionKeys'

declare global {
  interface Window { INITIAL_DATA: Record<string, any>; }
}

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App)
  const hueStore = useHueStore()
  if (!import.meta.env.SSR) {
    // client
    app.provide(InitialDataKey, window.INITIAL_DATA)
    hueStore.loadState(window.INITIAL_DATA)
  }
  const router = createRouter()
  app.use(router)
  return { app, router }
}
