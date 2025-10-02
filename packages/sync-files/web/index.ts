import { createApp } from 'vue'
import Index from './index.vue'

const container = document.createElement('div')
document.body.appendChild(container)

const app = createApp(Index)

app.mount(container)
