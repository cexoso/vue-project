import { computed } from 'vue'
import { useCoverageData } from './data'
import { useGitChangeLineSet } from '../git-diff/git-changeset'
import type { BranchBlock, CodeRanger, MaybeCodeRanger, Position } from '../../type'
import { useDatas } from '../../service/http-service'
import { defineResource } from '@cexoso/vue-singleton'
import { join } from '../../utils/path-join'

const useMetaInfo = defineResource(() => {
  const http = useDatas()
  return async () => http.getMetaInfo()
})

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
  const { data } = useMetaInfo()
  return computed(() => {
    return data.value?.projectInfo ?? ''
  })
}

export const useIsCodeRangerHasChange = () => {
  const gitDiffData = useGitChangeLineSet()
  const { data } = useMetaInfo()
  return (block: CodeRanger, filePath: string) => {
    const projectInfo = data.value?.projectInfo
    if (projectInfo === undefined) {
      return true
    }
    const diffData = gitDiffData.value
    if (diffData === undefined) {
      // undefined 表示没有拉取 git diff 的情况，这种情况需要全量统计
      return true
    }

    const changeLines = diffData[filePath]
    if (changeLines === undefined) {
      // 没有 changeLiens 就直接不纳入统计
      return false
    }

    const {
      start: { line: startLine },
      end: { line: endLine },
    } = block
    for (let i = startLine; i <= endLine; i++) {
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
export function isPositionEqual(a: Position, b: Position) {
  return a.line === b.line && a.column === b.column
}

export const useGetBranchHasChange = () => {
  const gitDiffData = useGitChangeLineSet()
  const getBranchHasChange = (block: BranchBlock, filePath: string) => {
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
  return getBranchHasChange
}

export const useGetStatementsCoverageDataByFilepath = () => {
  const coverageData = useCoverageData()
  const isBlockHasChange = useIsCodeRangerHasChange()
  return computed(() => (filePath: string) => {
    const cdata = coverageData.value
    if (cdata === undefined) {
      return { count: 0, coverageCount: 0 }
    }
    let count = 0
    let coverageCount = 0
    const v = cdata[filePath]
    if (v === undefined) {
      return {
        coverageCount: 0,
        count: 0,
      }
    }
    const { s, statementMap } = v.coverage
    for (const [id, c] of Object.entries(s)) {
      const block = statementMap[id]
      if (isBlockHasChange(block, filePath)) {
        if (c !== 0) {
          coverageCount += 1
        }
        count += 1
      }
    }
    return {
      coverageCount,
      count,
    }
  })
}

export const useGetBranchCoverageDataByFilepath = () => {
  const coverageData = useCoverageData()
  const getBranchHasChange = useGetBranchHasChange()
  return computed(() => (filePath: string) => {
    const cdata = coverageData.value
    if (cdata === undefined) {
      return { count: 0, coverageCount: 0 }
    }
    let count = 0
    let coverageCount = 0
    const v = cdata[filePath]
    if (v === undefined) {
      return {
        coverageCount: 0,
        count: 0,
      }
    }
    const { b, branchMap } = v.coverage
    for (const [id, branches] of Object.entries(b)) {
      const block = branchMap[id]
      const changes = getBranchHasChange(block, filePath)
      // 仅保留修改过的分支
      const chanegedBranches = branches.filter((_, key) => changes[key])

      coverageCount += chanegedBranches.reduce((acc, item) => acc + (item !== 0 ? 1 : 0), 0)
      count += chanegedBranches.length
    }
    return {
      coverageCount,
      count,
    }
  })
}

export const useGetLinesCoverageDataByFilepath = () => {
  // 行覆盖率就是指令覆盖率，只是要排除掉同行的两条指令
  const coverageData = useCoverageData()
  const isBlockHasChange = useIsCodeRangerHasChange()
  return computed(() => (filePath: string) => {
    const cdata = coverageData.value
    if (cdata === undefined) {
      return { count: 0, coverageCount: 0 }
    }
    let count = 0
    let coverageCount = 0
    const v = cdata[filePath]
    if (v === undefined) {
      return {
        coverageCount: 0,
        count: 0,
      }
    }

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
    coverageCount += clines.size
    count += alllines.size
    return {
      coverageCount,
      count,
    }
  })
}

export const useGetFunctionCoverageDataByFilepath = () => {
  const coverageData = useCoverageData()
  const isBlockHasChange = useIsCodeRangerHasChange()
  return computed(() => (filePath: string) => {
    const cdata = coverageData.value
    if (cdata === undefined) {
      return { count: 0, coverageCount: 0 }
    }
    let count = 0
    let coverageCount = 0
    const v = cdata[filePath]
    if (v === undefined) {
      return {
        coverageCount: 0,
        count: 0,
      }
    }
    const { f, fnMap } = v.coverage
    for (const [id, c] of Object.entries(f)) {
      if (isBlockHasChange(fnMap[id].loc, filePath)) {
        if (c !== 0) {
          coverageCount += 1
        }
        count += 1
      }
    }
    return {
      coverageCount,
      count,
    }
  })
}
