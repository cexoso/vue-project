import { computed } from 'vue'
import { useCoverageData } from '../../../../model/coverage-data'
import { useFilePath, useHasChange } from '../../controller'
import { isCodeRanger, useGetBranchHasChange } from '../../../../model/coverage-data/coverage-handle'
import { useSourceHelper } from './use-source-helper'
import type { AllBlock } from './type'

export const useUncoverBlock = () => {
  const coverageData = useCoverageData()
  const hasChange = useHasChange()
  const file = useFilePath()
  const getBranchHasChange = useGetBranchHasChange()
  const sourceHelperRef = useSourceHelper()

  return computed(() => {
    const sourceHelper = sourceHelperRef.value
    const cdata = coverageData.value
    if (cdata === undefined || file === undefined || sourceHelper === null) {
      return []
    }
    const { source, coverage } = cdata[file] ?? {}
    if (source === undefined) {
      // 如果没有越用 sourcemap 功能，会导致没有源码
      return []
    }

    const uncoverStatementBlock: AllBlock[] = []

    for (const [s, count] of Object.entries(coverage.s)) {
      const record = coverage.statementMap[s]
      if (hasChange(record) && count === 0) {
        uncoverStatementBlock.push({
          block: record,
          type: 'ranger',
          rangerType: 'statement-tag',
          title: 'statement not covered',
        })
      }
    }

    for (const [b, counts] of Object.entries(coverage.b)) {
      const branchBlocks = coverage.branchMap[b]
      const changes = getBranchHasChange(branchBlocks, file)
      if (branchBlocks.type === 'if') {
        const cData = branchBlocks.locations.map((_, key) => counts[key])
        const hasUncoverBranch = cData.includes(0)
        const hasChange = branchBlocks.locations.some((_, key) => changes[key])
        if (hasChange && hasUncoverBranch) {
          const isIfPathNotCover = counts[0] === 0
          uncoverStatementBlock.push({
            block: branchBlocks.loc,
            type: 'branch',
            branchType: branchBlocks.type,
            coverageData: cData,
            title: isIfPathNotCover ? 'if path not taken' : 'else path not taken',
            label: isIfPathNotCover ? 'I' : 'E',
          })
        }
      } else if (branchBlocks.type === 'cond-expr' || branchBlocks.type === 'binary-expr') {
        branchBlocks.locations.forEach((loc, key) => {
          if (changes[key] && counts[key] === 0 && isCodeRanger(loc)) {
            uncoverStatementBlock.push({
              block: loc,
              type: 'ranger',
              rangerType: 'branch-expr-tag',
              title: 'branch not covered',
            })
          }
        })
      }
    }

    for (const [f, counts] of Object.entries(coverage.f)) {
      const record = coverage.fnMap[f]
      if (hasChange(record.loc) && counts === 0) {
        const decl = record.decl || record.loc
        uncoverStatementBlock.push({
          block: {
            start: {
              line: decl.start.line,
              column: decl.start.column,
            },
            end: {
              line: decl.start.line,
              column: decl.start.column + 2,
            },
          },
          type: 'function',
          title: 'function not covered',
        })
      }
    }

    uncoverStatementBlock.sort((a, b) => {
      return (
        sourceHelper.getIndexOf(a.block.start.line, a.block.start.column) -
        sourceHelper.getIndexOf(b.block.start.line, b.block.start.column)
      )
    })

    let lastEndPosition = -1
    const x = uncoverStatementBlock.filter((a) => {
      const start = a.block.start
      let compareTo = lastEndPosition
      const end = sourceHelper.fillPosition(a.block.end)
      const result = sourceHelper.getIndexOf(start.line, start.column) > compareTo
      if (result) {
        lastEndPosition = sourceHelper.getIndexOf(end.line, end.column)
      }
      return result
    })
    return x
  })
}
