import { defineConfig, type PluginOption } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default defineConfig(() => {
  const plugins: PluginOption[] = [vueJsx()]

  return {
    plugins,
    test: {
      environment: 'happy-dom',
      coverage: {
        reporter: [require.resolve('@cexoso/git-diff-report')],
      },
    },
  }
})
