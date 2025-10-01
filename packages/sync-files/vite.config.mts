import { defineConfig, type PluginOption } from 'vite'

export default defineConfig(() => {
  const plugins: PluginOption[] = []

  return {
    plugins,
    test: {
      environment: 'happy-dom',
    },
  }
})
