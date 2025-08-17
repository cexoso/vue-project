import { createWebHashHistory } from 'vue-router'
import { renderContainer } from './render-base'
import App from '../app.vue'

export async function renderProd() {
  // 因为 report 是占用了 admin 的域名展示的，所以需要在 admin 下使用 hash 来模拟单页
  const hashHistory = createWebHashHistory()
  const container = document.createElement('div')
  const app = await renderContainer({
    component: App,
    history: hashHistory,
    container,
  })
  document.body.appendChild(container)
  return app
}
