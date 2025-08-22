import { describe, expect, it } from 'vitest'
import { EmptyPlayground, renderTestApp } from '../../../render-app/render-test'
import { codeRender, mockBase, mockGitDiff } from '../../../mock/base'
import { useRouter } from 'vue-router'
import { PrismRender } from './prism-render'
import { useSourceHelper } from './controller'
import { fireEvent, waitFor } from '@testing-library/dom'

describe('usePrismTokens 集成', () => {
  it('usePrismTokens 无 git diff', async () => {
    await renderTestApp({
      component: PrismRender,
      async play() {
        mockBase()
        useRouter().replace({
          name: 'content-detail',
          query: {
            file: 'server/controller/index.ts',
          },
        })
      },
    })
  })
  it('source helper', async () => {
    const { play } = await renderTestApp({
      component: EmptyPlayground,
      async play() {
        mockBase()
        useRouter().replace({
          name: 'content-detail',
          query: { file: 'src/context.ts' },
        })
      },
    })
    await waitFor(() => {
      expect(play(() => useSourceHelper().value)).not.null
    })
    const source = play(() => useSourceHelper().value!)
    expect(
      source.getSnippet({
        end: { column: 1, line: 1 },
        start: { column: 1, line: 1 },
      })
    ).eq('i') // 应该返回第一个字符

    expect(
      source.getSnippet({
        end: {
          column: 7,
          line: 2,
        },
        start: {
          column: 2,
          line: 2,
        },
      })
    ).eq('export')
  })
})

describe('源码渲染', () => {
  it('重复渲染后 ranger 的覆盖范围依然是那一块', async () => {
    const screen = await renderTestApp({
      async play() {
        mockBase()
      },
    })
    fireEvent.click(await screen.findByText('src'))
    fireEvent.click(await screen.findByText('with-resolves.ts'))
    await screen.findByRole('source-display')
    fireEvent.click(screen.getByText('All files'))
    await waitFor(() => {
      expect(screen.queryByRole('source-display')).null
    })
    // // // 重复进入两次，可能存在一个标记失真的问题
    fireEvent.click(await screen.findByText('src'))
    fireEvent.click(await screen.findByText('with-resolves.ts'))
    const dom = await screen.findByTitle('function not covered')
    expect(dom.innerText).deep.eq(`<T`)
  })

  it('增加覆盖率时，function 应该被过滤', async () => {
    const screen = await renderTestApp({
      async play() {
        mockGitDiff()
      },
    })
    fireEvent.click(await screen.findByText('src'))
    fireEvent.click(await screen.findByText('with-resolves.ts'))
    await screen.findByRole('source-display')
  })
})
