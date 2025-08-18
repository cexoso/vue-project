import { describe, expect, it } from 'vitest'
import { renderTestApp } from '../../render-app/render-test'
import { mockBase, mockGitDiff, mockSingleDirMode } from '../../mock/base'
import { getByRole, fireEvent, waitFor, findByText } from '@testing-library/dom'
import { useRoute } from 'vue-router'

describe('覆盖率', () => {
  describe('增量覆盖率', () => {
    it('首页文件展示', async () => {
      const screen = await renderTestApp({
        async play() {
          mockGitDiff()
        },
      })

      const statements = await screen.findByRole('panel', { name: 'Statements' })
      await findByText(statements, '33.33%')
      await findByText(statements, '1/3')

      const branches = await screen.findByRole('panel', { name: 'Branches' })
      await findByText(branches, '50%')
      await findByText(branches, '1/2')

      const functions = await screen.findByRole('panel', { name: 'Functions' })
      await findByText(functions, '100%')
      await findByText(functions, '1/1')

      const lines = await screen.findByRole('panel', { name: 'Lines' })
      await findByText(lines, '33.33%')
      await findByText(lines, '1/3')

      const server = screen.getByRole('coverage-data', {
        name: 'src',
      })

      expect(getByRole(server, 'statements-percent').innerText).eq('0%')
      expect(getByRole(server, 'statements-fraction').innerText).eq('0/2')

      expect(getByRole(server, 'branchs-percent').innerText).eq('50%')
      expect(getByRole(server, 'branchs-fraction').innerText).eq('1/2')

      expect(getByRole(server, 'functions-percent').innerText).eq('100%')
      expect(getByRole(server, 'functions-fraction').innerText).eq('1/1')

      expect(getByRole(server, 'lines-percent').innerText).eq('0%')
      expect(getByRole(server, 'lines-fraction').innerText).eq('0/2')
    })
    it('当用户点击了一个目录时，只展示相关文件的数据', async () => {
      const screen = await renderTestApp({
        async play() {
          mockGitDiff()
        },
      })

      fireEvent.click(await screen.findByText('src'))
      await waitFor(
        () => {
          expect(screen.play(() => useRoute().query)).has.property('dir', 'src')
        },
        { timeout: 100 }
      )

      const statements = await screen.findByRole('panel', { name: 'Statements' })
      await findByText(statements, '0%')
      await findByText(statements, '0/2')

      const branches = await screen.findByRole('panel', { name: 'Branches' })
      await findByText(branches, '50%')
      await findByText(branches, '1/2')

      const functions = await screen.findByRole('panel', { name: 'Functions' })
      await findByText(functions, '100%')
      await findByText(functions, '1/1')

      const lines = await screen.findByRole('panel', { name: 'Lines' })
      await findByText(lines, '0%')
      await findByText(lines, '0/2')

      const context = screen.getByRole('coverage-data', {
        name: 'context.ts',
      })

      expect(getByRole(context, 'statements-percent').innerText).eq('0%')
      expect(getByRole(context, 'statements-fraction').innerText).eq('0/2')

      expect(getByRole(context, 'branchs-percent').innerText).eq('50%')
      expect(getByRole(context, 'branchs-fraction').innerText).eq('1/2')

      expect(getByRole(context, 'functions-percent').innerText).eq('100%')
      expect(getByRole(context, 'functions-fraction').innerText).eq('1/1')

      expect(getByRole(context, 'lines-percent').innerText).eq('0%')
      expect(getByRole(context, 'lines-fraction').innerText).eq('0/2')
    })
  })

  describe('全量覆盖率', () => {
    it('首页文件展示', async () => {
      const screen = await renderTestApp({
        async play() {
          mockBase()
        },
      })

      const statements = await screen.findByRole('panel', { name: 'Statements' })
      await findByText(statements, '89.44%')
      await findByText(statements, '161/180')

      const branches = await screen.findByRole('panel', { name: 'Branches' })
      await findByText(branches, '98.03%')
      await findByText(branches, '50/51')

      const functions = await screen.findByRole('panel', { name: 'Functions' })
      await findByText(functions, '94.11%')
      await findByText(functions, '16/17')

      const lines = await screen.findByRole('panel', { name: 'Lines' })
      await findByText(lines, '89.44%')
      await findByText(lines, '161/180')

      const server = screen.getByRole('coverage-data', {
        name: 'src',
      })

      expect(getByRole(server, 'statements-percent').innerText).eq('68.85%')
      expect(getByRole(server, 'statements-fraction').innerText).eq('42/61')

      expect(getByRole(server, 'branchs-percent').innerText).eq('90%')
      expect(getByRole(server, 'branchs-fraction').innerText).eq('9/10')

      expect(getByRole(server, 'functions-percent').innerText).eq('85.71%')
      expect(getByRole(server, 'functions-fraction').innerText).eq('6/7')

      expect(getByRole(server, 'lines-percent').innerText).eq('68.85%')
      expect(getByRole(server, 'lines-fraction').innerText).eq('42/61')
    })
    it('当用户点击了一个目录时，只展示相关文件的数据', async () => {
      const screen = await renderTestApp({
        async play() {
          mockBase()
        },
      })

      fireEvent.click(await screen.findByText('src'))
      await waitFor(
        () => {
          expect(screen.play(() => useRoute().query)).has.property('dir', 'src')
        },
        { timeout: 100 }
      )

      const context = screen.getByRole('coverage-data', {
        name: 'context.ts',
      })

      const statements = await screen.findByRole('panel', { name: 'Statements' })
      await findByText(statements, '68.85%')
      await findByText(statements, '42/61')

      const branches = await screen.findByRole('panel', { name: 'Branches' })
      await findByText(branches, '90%')
      await findByText(branches, '9/10')

      const functions = await screen.findByRole('panel', { name: 'Functions' })
      await findByText(functions, '85.71%')
      await findByText(functions, '6/7')

      const lines = await screen.findByRole('panel', { name: 'Lines' })
      await findByText(lines, '68.85%')
      await findByText(lines, '42/61')

      expect(getByRole(context, 'statements-percent').innerText).eq('85.71%')
      expect(getByRole(context, 'statements-fraction').innerText).eq('24/28')

      expect(getByRole(context, 'branchs-percent').innerText).eq('83.33%')
      expect(getByRole(context, 'branchs-fraction').innerText).eq('5/6')

      expect(getByRole(context, 'functions-percent').innerText).eq('100%')
      expect(getByRole(context, 'functions-fraction').innerText).eq('4/4')

      expect(getByRole(context, 'lines-percent').innerText).eq('85.71%')
      expect(getByRole(context, 'lines-fraction').innerText).eq('24/28')
    })
  })
  describe('单层目录模式', () => {
    it('首页进入时不用展示没有必要存在的目录页，而是展示文件详情页', async () => {
      const screen = await renderTestApp({
        async play() {
          mockSingleDirMode()
        },
      })
      expect(await screen.findAllByRole('coverage-data')).lengthOf(5, '直接展示文件，而不是一个 . 目录')
    })
  })
})

describe('交互相关', () => {
  it.todo('添加用户瞎输入 url 的页面展示')
  it('可以通过点击一个具体的文件进入到具体的源码页', async () => {
    const screen = await renderTestApp({
      async play() {
        mockBase()
      },
    })

    fireEvent.click(await screen.findByText('src'))
    const indexColumn = await screen.findByRole('coverage-data', {
      name: 'index.ts',
    })

    fireEvent.click(await findByText(indexColumn, 'index.ts')) // 这里是点击了具体的某个文件
    await screen.findByRole('source-display')
    screen.getByText('src')
    screen.getByText('index.ts')
  })
  it('在源码页时，可以通过点击目录返回', async () => {
    const screen = await renderTestApp({
      async play() {
        mockBase()
      },
    })

    fireEvent.click(await screen.findByText('src'))
    const indexColumn = await screen.findByRole('coverage-data', { name: 'index.ts' })
    fireEvent.click(await findByText(indexColumn, 'index.ts'))
    await screen.findByRole('source-display')
    const dirname = screen.getByText('src')
    fireEvent.click(dirname)
    await screen.findByRole('coverage-data', { name: 'index.ts' })
  })
  it('在源码页时，可以通过点击 All files 返回', async () => {
    const screen = await renderTestApp({
      async play() {
        mockBase()
      },
    })

    fireEvent.click(await screen.findByText('src'))
    const indexColumn = await screen.findByRole('coverage-data', { name: 'index.ts' })
    fireEvent.click(await findByText(indexColumn, 'index.ts'))
    await screen.findByRole('source-display')
    const dirname = screen.getByText('All files')
    fireEvent.click(dirname)
    await screen.findByRole('coverage-data', { name: 'src' })
  })
  it('在目录页，通过点击 All files 返回', async () => {
    const screen = await renderTestApp({
      async play() {
        mockBase()
      },
    })

    fireEvent.click(await screen.findByText('src'))
    await screen.findByRole('coverage-data', { name: 'index.ts' })
    const dirname = screen.getByText('All files')
    fireEvent.click(dirname)
    await screen.findByRole('coverage-data', { name: 'src' })
  })
})
