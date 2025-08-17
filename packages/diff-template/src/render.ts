import mustache from 'mustache'
import serialize from 'serialize-javascript'
import { getHtmlTemplate, getAssetsDir } from '../get-html-template'
import { writeFileSync, cpSync, existsSync, rmdirSync } from 'fs'
import { join } from 'path'
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

export const renderReport = (opts: Options) => {
  writeFileSync(
    join(opts.outDir, 'index.html'),
    renderHtml({ diff: opts.diff, coverageData: opts.coverageData, metaInfo: opts.metaInfo })
  )

  const assetsDir = join(opts.outDir, './assets')
  if (existsSync(assetsDir)) {
    rmdirSync(assetsDir)
  }

  cpSync(getAssetsDir(), join(opts.outDir, './assets'), {
    recursive: true,
  })
  return
}
