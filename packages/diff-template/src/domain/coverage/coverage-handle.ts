import { computed } from 'vue'
import { useCoverageData } from './data'
import { useGitChangeLineSet } from '../git-diff/git-changeset'
import type {
  BranchBlock,
  CodeRanger,
  CoverageItem,
  MaybeCodeRanger,
  OptionalColumnPosition,
} from '../../type'
import { useDatas } from '../../service/http-service'

const useMetaInfo = () => {
  const data = useDatas()
  return data.getMetaInfo()
}

interface CoverageDataDeatil {
  count: number
  coverageCount: number
}

export interface AllCoverageDataDeatil {
  statements: CoverageDataDeatil
  branchs: CoverageDataDeatil
  functions: CoverageDataDeatil
  lines: CoverageDataDeatil
}

export const initAllCoverageData = (): AllCoverageDataDeatil => {
  return {
    statements: { count: 0, coverageCount: 0 },
    branchs: { count: 0, coverageCount: 0 },
    functions: { count: 0, coverageCount: 0 },
    lines: { count: 0, coverageCount: 0 },
  }
}

export const useProjectInfo = () => {
  const data = useMetaInfo()
  return computed(() => {
    return data.projectInfo ?? ''
  })
}

export const useIsBlockHasChange = () => {
  const gitDiffData = useGitChangeLineSet()
  const projectInfo = useProjectInfo()
  return (block: CodeRanger, filePath: string) => {
    if (projectInfo === undefined) {
      return true
    }
    const diffData = gitDiffData.value
    if (diffData === undefined) {
      // undefined 表示没有 git diff 的情况，这种情况需要全量统计
      return true
    }

    const changeLines = diffData[filePath]
    if (changeLines === undefined) {
      // 没有 changeLiens 就直接不纳入统计
      return false
    }

    for (let i = block.start.line; i <= block.end.line; i++) {
      if (changeLines.has(i)) {
        return true
      }
    }
    return false
  }
}

export function isCodeRanger(codeRanger: MaybeCodeRanger): codeRanger is CodeRanger {
  return codeRanger.end.line !== undefined
}
export function isPositionEqual(a: OptionalColumnPosition, b: OptionalColumnPosition) {
  return a.line === b.line && a.column === b.column
}

export const useGetBranchHasChange = () => {
  const gitDiffData = useGitChangeLineSet()
  return (block: BranchBlock, filePath: string) => {
    const diffData = gitDiffData.value
    if (diffData === undefined) {
      return block.locations.map(() => true)
    }
    const changeLines = diffData[filePath]
    if (changeLines === undefined) {
      // 没有 changeLiens 就直接不纳入统计
      return block.locations.map(() => false)
    }
    const hasChange = (line: number | undefined) => (line === undefined ? false : changeLines.has(line))

    return block.locations.map((locationBlock) => {
      if (isCodeRanger(locationBlock)) {
        const {
          start: { line: startLine },
          end: { line: endLine },
        } = locationBlock
        for (let i = startLine; i <= endLine; i++) {
          if (hasChange(i)) {
            return true
          }
        }
        return false
      }
      return false
    })
  }
}

const useComputeCoverageDataByFile = () => {
  type coverageDataComputer = (coverageItem: CoverageItem, result: CoverageDataDeatil) => void
  const coverageData = useCoverageData()
  return computed(() => {
    const cdata = coverageData.value
    return (filePath: string, computer: coverageDataComputer) => {
      const result = { coverageCount: 0, count: 0 }
      const coverageItem = cdata?.[filePath]
      if (coverageItem === undefined) {
        return result
      }
      computer(coverageItem, result)
      return result
    }
  })
}

export const useGetStatementsCoverageDataByFilepath = () => {
  const isBlockHasChange = useIsBlockHasChange()
  const computeCoverageDataByFile = useComputeCoverageDataByFile()
  return computed(
    () => (filePath: string) =>
      computeCoverageDataByFile.value(filePath, (v, result) => {
        const { s, statementMap } = v.coverage
        for (const [id, c] of Object.entries(s)) {
          const block = statementMap[id]
          if (isBlockHasChange(block, filePath)) {
            if (c !== 0) {
              result.coverageCount += 1
            }
            result.count += 1
          }
        }
      })
  )
}

export const useGetBranchCoverageDataByFilepath = () => {
  const getBranchHasChange = useGetBranchHasChange()
  const computeCoverageDataByFile = useComputeCoverageDataByFile()
  return computed(() => (filePath: string) => {
    return computeCoverageDataByFile.value(filePath, (v, result) => {
      const { b, branchMap } = v.coverage
      for (const [id, branches] of Object.entries(b)) {
        const block = branchMap[id]
        const changes = getBranchHasChange(block, filePath)
        // 仅保留修改过的分支
        const chanegedBranches = branches.filter((_, key) => changes[key])

        result.coverageCount += chanegedBranches.reduce((acc, item) => acc + (item !== 0 ? 1 : 0), 0)
        result.count += chanegedBranches.length
      }
    })
  })
}

export const useGetLinesCoverageDataByFilepath = () => {
  // 行覆盖率就是指令覆盖率，只是要排除掉同行的两条指令
  const isBlockHasChange = useIsBlockHasChange()
  const computeCoverageDataByFile = useComputeCoverageDataByFile()
  return computed(() => (filePath: string) => {
    return computeCoverageDataByFile.value(filePath, (v, result) => {
      const { s, statementMap } = v.coverage
      const alllines = new Set()
      const clines = new Set()
      for (const [id, c] of Object.entries(s)) {
        const block = statementMap[id]
        if (isBlockHasChange(block, filePath)) {
          const i = block.start.line
          if (c !== 0) {
            clines.add(i)
          }
          alllines.add(i)
        }
      }
      result.coverageCount += clines.size
      result.count += alllines.size
    })
  })
}

export const useGetFunctionCoverageDataByFilepath = () => {
  const isBlockHasChange = useIsBlockHasChange()
  const computeCoverageDataByFile = useComputeCoverageDataByFile()
  return computed(() => (filePath: string) => {
    return computeCoverageDataByFile.value(filePath, (v, result) => {
      const { f, fnMap } = v.coverage
      for (const [id, c] of Object.entries(f)) {
        if (isBlockHasChange(fnMap[id].loc, filePath)) {
          if (c !== 0) {
            result.coverageCount += 1
          }
          result.count += 1
        }
      }
    })
  })
}
