import type { FileContentWriter } from 'istanbul-lib-report'
import { ReportBase, type ReportNode, type Context } from 'istanbul-lib-report'
import { join, relative, dirname } from 'node:path'
import { getGitDiff, getProjectRoot } from './get-git-diff'
import { renderReport } from '@cexoso/diff-template'

const getRelativePath = (node: ReportNode) => {
  // @ts-ignore
  const result = node.path.v.join('/')
  return result
}

export class GitDiffReport extends ReportBase {
  projectRoot = ''
  hasUpdateProjectRoot = false
  updateProjectRootIfNeed(node: ReportNode, _context: Context) {
    const path = getRelativePath(node)
    let dir = dirname(node.fileCoverage.path)
    if (this.hasUpdateProjectRoot) {
      return
    }

    this.hasUpdateProjectRoot = true
    while (dir !== '/') {
      if (join(dir, path) === node.fileCoverage.path) {
        this.projectRoot = dir
        return
      }
      dir = dirname(dir)
    }
  }
  indexJSON: Record<string, any> = {}
  getWriterByPath(context: Context, path: string): FileContentWriter {
    return context.writer.writeFile(path) as FileContentWriter
  }
  getWriter(context: Context, node: ReportNode, prefix: string) {
    return this.getWriterByPath(context, join(prefix, getRelativePath(node)))
  }
  constructor(opts: any) {
    super(opts)
    this.projectRoot = opts.projectRoot
  }

  onStart(_node: ReportNode, _context: Context) {}

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
    this.updateProjectRootIfNeed(node, context)
    this.indexJSON[path] = {
      coverage: this.getCoverageData(node, context),
      source: this.getSource(node, context),
    }
  }

  getDiff() {
    const gitDiffTarget = process.env['git_diff_target']
    if (gitDiffTarget) {
      const content = getGitDiff(gitDiffTarget)
      return content
    }
    return ''
  }
  getMetaInfo(_node: ReportNode) {
    const gitDiffTarget = process.env['git_diff_target']
    if (gitDiffTarget) {
      return { projectInfo: relative(getProjectRoot(), this.projectRoot) }
    }
    return {}
  }

  onEnd(_node: ReportNode, context: Context) {
    renderReport({
      outDir: context.dir,
      diff: this.getDiff(),
      coverageData: this.indexJSON,
      metaInfo: { projectInfo: relative(getProjectRoot(), this.projectRoot) },
    })
  }
}
