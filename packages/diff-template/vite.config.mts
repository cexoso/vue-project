import { defineConfig, type PluginOption } from 'vite'
// @ts-ignore TestProjectConfiguration is used in satisfies expressions
import type { TestProjectConfiguration } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import tailwindcss from '@tailwindcss/vite'
import { join } from 'node:path'

export default defineConfig(() => {
  const plugins: PluginOption[] = [
    // @ts-ignore plugin-vue 依赖了 vite 导致安装到了多版本 vite，造成类型冲突，但实际运行不会有问题
    vue(),
    vueJsx(),
    legacy(),
    tailwindcss(),
  ]
  return {
    plugins,
    base: './',
    server: {
      allowedHosts: true as const,
    },
    build: {
      outDir: join(__dirname, './dist'),
    },
    test: {
      coverage: {
        exclude: ['**/*.stories.tsx'],
      },
      workspace: [
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['src/**/*.spec.tsx', 'src/**/*.spec.ts'],
            browser: {
              ui: false,
              enabled: true,
              isolate: false,
              screenshotFailures: false,
              provider: 'playwright',
              instances: [{ browser: 'chromium' }],
              testerScripts: [{ src: './setup-for-test.ts' }],
            },
          },
        } satisfies TestProjectConfiguration,
        {
          extends: true,
          test: {
            name: 'node',
            include: ['src/**/*.node.spec.ts'],
            environment: 'node',
            browser: {
              enabled: false,
            },
          },
        } satisfies TestProjectConfiguration,
      ],
    },
  }
})
