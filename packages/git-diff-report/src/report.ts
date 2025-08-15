import type { FileContentWriter } from 'istanbul-lib-report'
import { ReportBase, type ReportNode, type Context } from 'istanbul-lib-report'
import { join } from 'node:path'

const getRelativePath = (node: ReportNode) => {
  // @ts-ignore
  const result = node.path.v.join('/')
  return result
}

export class GitDiffReport extends ReportBase {
  indexFile = 'index.json'
  indexWriter: FileContentWriter | undefined
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

  onEnd() {
    const cw = this.indexWriter!
    cw.write(JSON.stringify(this.indexJSON, undefined, 2))
  }
}
