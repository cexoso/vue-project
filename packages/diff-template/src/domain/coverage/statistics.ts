import { computed } from 'vue'
import {
  initAllCoverageData,
  useCoverageData,
  useGetBranchCoverageDataByFilepath,
  useGetFunctionCoverageDataByFilepath,
  useGetLinesCoverageDataByFilepath,
  useGetStatementsCoverageDataByFilepath,
  type AllCoverageDataDeatil,
} from './index'
import { getDir, getFilename } from '../../utils'
import type { ComputedRef } from 'vue'
import type { CoverageData, CoverageItem, CodeRanger, BranchBlock } from '../../type'
import { handleDiff } from '../git-diff/git-diff-parse'
import { relative } from '../../utils/path-relative'
import { isCodeRanger } from './coverage-handle'

const useGetCoverageUtils = () => {
  const getStatementsCoverageDataByFilepathRef = useGetStatementsCoverageDataByFilepath()
  const getBranchCoverageDataByFilepathRef = useGetBranchCoverageDataByFilepath()
  const getLinesCoverageDataByFilepathRef = useGetLinesCoverageDataByFilepath()
  const getFunctionCoverageDataByFilepathRef = useGetFunctionCoverageDataByFilepath()
  return computed(() => {
    return {
      getStatementsCoverageDataByFilepath: getStatementsCoverageDataByFilepathRef.value,
      getBranchCoverageDataByFilepath: getBranchCoverageDataByFilepathRef.value,
      getLinesCoverageDataByFilepath: getLinesCoverageDataByFilepathRef.value,
      getFunctionCoverageDataByFilepath: getFunctionCoverageDataByFilepathRef.value,
    }
  })
}

export const useGetDirModeFiles = () => {
  const coverageDataRef = useCoverageData()
  const getCoverageUtilsRef = useGetCoverageUtils()
  return computed(() => (dir: string) => {
    const getCoverageUtils = getCoverageUtilsRef.value
    const coverageData = coverageDataRef.value
    if (coverageData === undefined) {
      return []
    }
    const filepaths = Object.keys(coverageData)
    const result: Array<[string, AllCoverageDataDeatil]> = []
    for (const filepath of filepaths) {
      if (dir !== getDir(filepath)) {
        continue
      }
      result.push([
        getFilename(filepath),
        {
          statements: getCoverageUtils.getStatementsCoverageDataByFilepath(filepath),
          branchs: getCoverageUtils.getBranchCoverageDataByFilepath(filepath),
          lines: getCoverageUtils.getLinesCoverageDataByFilepath(filepath),
          functions: getCoverageUtils.getFunctionCoverageDataByFilepath(filepath),
        },
      ])
    }
    return result.sort(([a], [b]) => String(a).localeCompare(String(b)))
  })
}

export const useGetAllModeFiles = () => {
  const coverageDataRef = useCoverageData()
  const getCoverageUtilsRef = useGetCoverageUtils()
  return computed(() => () => {
    const getCoverageUtils = getCoverageUtilsRef.value
    const coverageData = coverageDataRef.value
    if (coverageData === undefined) {
      return []
    }
    const filepaths = Object.keys(coverageData)
    const result: Record<string, AllCoverageDataDeatil> = {}
    for (const filepath of filepaths) {
      const dir = getDir(filepath)
      result[dir] = result[dir] || initAllCoverageData()
      const statementCoverage = getCoverageUtils.getStatementsCoverageDataByFilepath(filepath)
      result[dir].statements.count += statementCoverage.count
      result[dir].statements.coverageCount += statementCoverage.coverageCount

      const branchCoverage = getCoverageUtils.getBranchCoverageDataByFilepath(filepath)
      result[dir].branchs.count += branchCoverage.count
      result[dir].branchs.coverageCount += branchCoverage.coverageCount

      const linesCoverage = getCoverageUtils.getLinesCoverageDataByFilepath(filepath)
      result[dir].lines.count += linesCoverage.count
      result[dir].lines.coverageCount += linesCoverage.coverageCount

      const functionsCoverage = getCoverageUtils.getFunctionCoverageDataByFilepath(filepath)
      result[dir].functions.count += functionsCoverage.count
      result[dir].functions.coverageCount += functionsCoverage.coverageCount
    }
    return Object.entries(result).sort(([a], [b]) => String(a).localeCompare(String(b)))
  })
}

export const useFiles = (dirRef: ComputedRef<string>) => {
  const getDirModeFiles = useGetDirModeFiles()
  const getAllModeFiles = useGetAllModeFiles()
  return computed(() => {
    const dir = dirRef.value
    if (dir !== '') {
      return getDirModeFiles.value(dir)
    }
    return getAllModeFiles.value()
  })
}

export const useStatisticsCoverageData = (dirRef: ComputedRef<string>) => {
  const files = useFiles(dirRef)
  return computed(() =>
    files.value.reduce((acc, [_, cdata]) => {
      return {
        statements: {
          count: cdata.statements.count + acc.statements.count,
          coverageCount: cdata.statements.coverageCount + acc.statements.coverageCount,
        },
        branchs: {
          count: cdata.branchs.count + acc.branchs.count,
          coverageCount: cdata.branchs.coverageCount + acc.branchs.coverageCount,
        },
        functions: {
          count: cdata.functions.count + acc.functions.count,
          coverageCount: cdata.functions.coverageCount + acc.functions.coverageCount,
        },
        lines: {
          count: cdata.lines.count + acc.lines.count,
          coverageCount: cdata.lines.coverageCount + acc.lines.coverageCount,
        },
      }
    }, initAllCoverageData())
  )
}

// Pure function for CLI usage — no Vue reactivity, no singletons
export function computeStatistics(opts: {
  coverageData: CoverageData
  diff: string
  metaInfo: { projectInfo: string }
}): AllCoverageDataDeatil {
  const { coverageData, diff, metaInfo } = opts
  const projectInfo = metaInfo.projectInfo

  // Build git diff change line set (filepath → Set<lineNumber>)
  let gitChangeLineSet: Record<string, Set<number>> | undefined
  if (diff) {
    const originMap = handleDiff(diff)
    const diffMap: Record<string, Set<number>> = {}
    for (const [key, lines] of Object.entries(originMap)) {
      const relPath = relative(projectInfo, key)
      diffMap[relPath] = new Set(lines)
    }
    gitChangeLineSet = diffMap
  }

  const isBlockHasChange = (block: CodeRanger, filePath: string): boolean => {
    if (gitChangeLineSet === undefined) {
      // No diff = all changes
      return true
    }
    const changeLines = gitChangeLineSet[filePath]
    if (changeLines === undefined) {
      return false
    }
    for (let i = block.start.line; i <= block.end.line; i++) {
      if (changeLines.has(i)) {
        return true
      }
    }
    return false
  }

  const getBranchHasChange = (block: BranchBlock, filePath: string): boolean[] => {
    if (gitChangeLineSet === undefined) {
      return block.locations.map(() => true)
    }
    const changeLines = gitChangeLineSet[filePath]
    if (changeLines === undefined) {
      return block.locations.map(() => false)
    }
    const hasChange = (line: number | undefined) => (line === undefined ? false : changeLines.has(line))
    return block.locations.map((loc) => {
      if (isCodeRanger(loc)) {
        for (let i = loc.start.line; i <= loc.end.line; i++) {
          if (hasChange(i)) return true
        }
        return false
      }
      return false
    })
  }

  const computeForFile = (filePath: string, item: CoverageItem) => {
    const { coverage } = item
    const result = initAllCoverageData()

    // Statements
    for (const [id, c] of Object.entries(coverage.s)) {
      const block = coverage.statementMap[id]
      if (isBlockHasChange(block, filePath)) {
        if (c !== 0) result.statements.coverageCount += 1
        result.statements.count += 1
      }
    }

    // Branches
    for (const [id, branches] of Object.entries(coverage.b)) {
      const block = coverage.branchMap[id]
      const changes = getBranchHasChange(block, filePath)
      const changedBranches = (branches as number[]).filter((_, key) => changes[key])
      result.branchs.coverageCount += changedBranches.reduce((acc, item) => acc + (item !== 0 ? 1 : 0), 0)
      result.branchs.count += changedBranches.length
    }

    // Lines (unique lines of statements)
    const allLines = new Set<number>()
    const coveredLines = new Set<number>()
    for (const [id, c] of Object.entries(coverage.s)) {
      const block = coverage.statementMap[id]
      if (isBlockHasChange(block, filePath)) {
        const line = block.start.line
        if (c !== 0) coveredLines.add(line)
        allLines.add(line)
      }
    }
    result.lines.count = allLines.size
    result.lines.coverageCount = coveredLines.size

    // Functions
    for (const [id, c] of Object.entries(coverage.f)) {
      const fnBlock = coverage.fnMap[id]
      if (isBlockHasChange(fnBlock.loc, filePath)) {
        if (c !== 0) result.functions.coverageCount += 1
        result.functions.count += 1
      }
    }

    return result
  }

  const total = initAllCoverageData()
  for (const [filePath, item] of Object.entries(coverageData)) {
    const fileResult = computeForFile(filePath, item)
    total.statements.count += fileResult.statements.count
    total.statements.coverageCount += fileResult.statements.coverageCount
    total.branchs.count += fileResult.branchs.count
    total.branchs.coverageCount += fileResult.branchs.coverageCount
    total.lines.count += fileResult.lines.count
    total.lines.coverageCount += fileResult.lines.coverageCount
    total.functions.count += fileResult.functions.count
    total.functions.coverageCount += fileResult.functions.coverageCount
  }
  return total
}
