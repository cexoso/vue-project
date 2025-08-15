import type { FileContentWriter } from 'istanbul-lib-report'
import { ReportBase, type ReportNode, type Context } from 'istanbul-lib-report'
import { join } from 'node:path'
import { getGitDiff } from './get-git-diff'

const getRelativePath = (node: ReportNode) => {
  // @ts-ignore
  const result = node.path.v.join('/')
  return result
}

export class GitDiffReport extends ReportBase {
  indexFile = 'api/coverage-data'
  diffFile = 'api/diff'
  indexWriter: FileContentWriter | undefined
  gitDiffWriter: FileContentWriter | undefined
  indexJSON: Record<string, any> = {}
  getWriterByPath(context: Context, path: string): FileContentWriter {
    return context.writer.writeFile(path) as FileContentWriter
  }
  getWriter(context: Context, node: ReportNode, prefix: string) {
    return this.getWriterByPath(context, join(prefix, getRelativePath(node)))
  }
  constructor() {
    super()
  }

  onStart(_node: ReportNode, context: Context) {
    this.indexWriter = this.getWriterByPath(context, this.indexFile)
    this.gitDiffWriter = this.getWriterByPath(context, this.diffFile)
  }

  getSource(node: ReportNode, context: Context) {
    const fc = node.getFileCoverage()
    return context.getSource(fc.path)
  }

  getCoverageData(node: ReportNode, _context: Context) {
    const fc = node.getFileCoverage()
    return fc.toJSON()
  }

  onDetail(node: ReportNode, context: Context) {
    const path = getRelativePath(node)
    this.indexJSON[path] = {
      coverage: this.getCoverageData(node, context),
      source: this.getSource(node, context),
    }
  }

  writeDiffFile() {
    const cw = this.gitDiffWriter!
    const gitDiffTarget = process.env['git-diff-target']
    if (gitDiffTarget) {
      const content = getGitDiff(gitDiffTarget)
      cw.write(content)
    }
  }

  onEnd() {
    const cw = this.indexWriter!
    this.writeDiffFile()
    cw.write(JSON.stringify(this.indexJSON, undefined, 2))
  }
}
