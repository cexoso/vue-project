import mustache from 'mustache'
import serialize from 'serialize-javascript'
import { getHtmlTemplate, getAssetsDir } from '../get-html-template'
import { writeFileSync, cpSync, existsSync, rmdirSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
interface Options {
  outDir: string
  diff: string
  coverageData: Record<string, any>
  metaInfo: Record<string, unknown>
}

export const renderHtml = (opts: Pick<Options, 'diff' | 'coverageData' | 'metaInfo'>) => {
  const template = getHtmlTemplate()
  const snapshotJSON = serialize(opts, { isJSON: true })
  return mustache.render(template, {
    snapshotJSON,
  })
}

const makeDirExist = (filePath: string) => {
  const dir = dirname(filePath)
  if (existsSync(dir)) {
    return
  }
  mkdirSync(dir, { recursive: true })
}

export const renderReport = (opts: Options) => {
  const htmlFile = join(opts.outDir, 'index.html')
  makeDirExist(htmlFile)
  writeFileSync(
    htmlFile,
    renderHtml({ diff: opts.diff, coverageData: opts.coverageData, metaInfo: opts.metaInfo })
  )

  const assetsDir = join(opts.outDir, './assets')
  if (existsSync(assetsDir)) {
    rmdirSync(assetsDir, { recursive: true })
  }

  cpSync(getAssetsDir(), join(opts.outDir, './assets'), {
    recursive: true,
  })
  return
}
