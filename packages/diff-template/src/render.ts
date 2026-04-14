import mustache from 'mustache'
import serialize from 'serialize-javascript'
import { getHtmlTemplate, getAssetsDir } from '../get-html-template'
import { writeFileSync, cpSync, existsSync, rmdirSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { computeStatistics } from './domain/coverage/statistics'
import type { CoverageData } from './type'
import type { AllCoverageDataDeatil } from './domain/coverage'

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

const formatPercent = (count: number, total: number): string => {
  if (total === 0) return '100%'
  return `${((count / total) * 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

const printCoverageStats = (stats: AllCoverageDataDeatil) => {
  const pad = (label: string) => label.padEnd(11)
  const { statements, branchs, functions, lines } = stats
  console.log(
    pad('Statements') +
      ': ' +
      formatPercent(statements.coverageCount, statements.count) +
      ' ( ' +
      statements.coverageCount +
      '/' +
      statements.count +
      ' )'
  )
  console.log(
    pad('Branches') +
      ': ' +
      formatPercent(branchs.coverageCount, branchs.count) +
      ' ( ' +
      branchs.coverageCount +
      '/' +
      branchs.count +
      ' )'
  )
  console.log(
    pad('Functions') +
      ': ' +
      formatPercent(functions.coverageCount, functions.count) +
      ' ( ' +
      functions.coverageCount +
      '/' +
      functions.count +
      ' )'
  )
  console.log(
    pad('Lines') +
      ': ' +
      formatPercent(lines.coverageCount, lines.count) +
      ' ( ' +
      lines.coverageCount +
      '/' +
      lines.count +
      ' )'
  )
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

  const stats = computeStatistics({
    coverageData: opts.coverageData as CoverageData,
    diff: opts.diff,
    metaInfo: opts.metaInfo as { projectInfo: string },
  })
  printCoverageStats(stats)
}
