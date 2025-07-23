import { defineConfig, type PluginOption } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig(() => {
  const plugins: PluginOption[] = [vueJsx()]

  return {
    plugins,
    test: {
      environment: 'happy-dom',
    },
  }
})
