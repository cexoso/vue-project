import type { RouterHistory } from 'vue-router'
import { createRouter as innerCreateRouter } from 'vue-router'
import Index from './page/index/index.vue'
import contentDetail from './page/content-detail/content-detail.vue'

export function createRouter(opts: { history: RouterHistory }) {
  return innerCreateRouter({
    history: opts.history,
    routes: [
      {
        path: '/',
        name: 'index',
        component: Index,
      },
      {
        path: '/content-detail',
        name: 'content-detail',
        component: contentDetail,
      },
    ],
  })
}
