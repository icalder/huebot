import {
  createRouter as _createRouter,
  createMemoryHistory,
  createWebHistory,
  RouteRecordRaw
} from 'vue-router'

// Auto generates routes from vue files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
const pages = import.meta.glob('./pages/*.vue')

const routes: RouteRecordRaw[] = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages(.*)\.vue$/)![1].toLowerCase()
  return {
    path: name === '/lights' ? '/' : name,
    component: pages[path] // () => import('./pages/*.vue')
  }
})

routes.push({
  path: '/sensors/:id/graphs',
  component: () => import('./pages/sensors/Graphs.vue'),
  props: true
})

export function createRouter() {
  return _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite.
    history: import.meta.env.SSR
      ? createMemoryHistory('/')
      : createWebHistory('/'),
    routes
  })
}
