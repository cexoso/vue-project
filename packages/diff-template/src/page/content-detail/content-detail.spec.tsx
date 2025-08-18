import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../render-app/render-test'
import { mockBase, mockGitDiff, mockSingleDirMode } from '../../mock/base'
import { useRouter } from 'vue-router'
import Panel from './panel.vue'
import { findByText } from '@testing-library/dom'
import dedent from 'ts-dedent'

describe('源码页', () => {
  describe('全量覆盖率', () => {
    const render = async () => {
      return await renderTestApp({
        component: Panel,
        async play() {
          mockBase()
          useRouter().replace({
            name: 'content-detail',
            query: {
              file: 'src/context.ts',
            },
          })
        },
      })
    }
    it('指令覆盖率', async () => {
      const { findByRole } = await render()
      const x = await findByRole('panel', { name: 'Statements' })
      await findByText(x, '85.71%')
      await findByText(x, '24/28')
    })
    it('分支覆盖率', async () => {
      const { findByRole } = await render()
      const x = await findByRole('panel', { name: 'Branches' })
      await findByText(x, '83.33%')
      await findByText(x, '5/6')
    })
    it('函数覆盖率', async () => {
      const { findByRole } = await render()
      const x = await findByRole('panel', { name: 'Functions' })
      await findByText(x, '100%')
      await findByText(x, '4/4')
    })
    it('行覆盖率', async () => {
      const { findByRole } = await render()
      const x = await findByRole('panel', { name: 'Lines' })
      await findByText(x, '85.71%')
      await findByText(x, '24/28')
    })
  })
  describe('增量覆盖率', () => {
    const render = async () => {
      return await renderTestApp({
        async play() {
          mockGitDiff()
          useRouter().replace({
            name: 'content-detail',
            query: {
              file: 'src/context.ts',
            },
          })
        },
      })
    }
    it('指令覆盖率', async () => {
      const screen = await render()
      const x = await screen.findByRole('panel', { name: 'Statements' })
      await findByText(x, '0%')
      await findByText(x, '0/2')
    })
    it('分支覆盖率', async () => {
      const screen = await render()
      const x = await screen.findByRole('panel', { name: 'Branches' })
      await findByText(x, '50%')
      await findByText(x, '1/2')
    })
    it('函数覆盖率', async () => {
      const screen = await render()
      const x = await screen.findByRole('panel', { name: 'Functions' })
      await findByText(x, '100%')
      await findByText(x, '1/1')
    })
    it('source file 行覆盖率', async () => {
      const screen = await render()
      const x = await screen.findByRole('panel', { name: 'Lines' })
      await findByText(x, '0%')
      await findByText(x, '0/2')
    })
  })
  describe('单层目录模式', () => {
    it('单层目录模式，可以展示源码', async () => {
      const screen = await renderTestApp({
        async play() {
          mockSingleDirMode()
          useRouter().replace({
            name: 'content-detail',
            query: {
              file: './with-resolves.ts',
            },
          })
        },
      })
      const dom = await screen.findByRole('source-display')
      const code = dom.querySelector('code')!
      expect(code.textContent).eq(dedent`
        export const withResolvers = <T>() => {
          if (typeof Promise.withResolvers === 'function') {
            return Promise.withResolvers()
          }
          let resolve: (value: T | PromiseLike<T>) => void
          let reject: (reason: any) => void
          const promise = new Promise<T>((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
          })
          return {
            promise,
            // @ts-ignore
            resolve,
            // @ts-ignore
            reject,
          }
        }
      `)
    })
  })
})
