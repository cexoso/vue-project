import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  const plugins: PluginOption[] = [vue(), vueJsx(), legacy(), tailwindcss()]

  return {
    plugins,
    test: {
      environment: 'happy-dom',
    },
    server: {
      proxy: {
        '/api': 'http://127.0.0.1:9394',
      },
    },
  }
})
