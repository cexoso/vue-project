import { computed } from 'vue'
import {
  initAllCoverageData,
  useCoverageData,
  useGetBranchCoverageDataByFilepath,
  useGetFunctionCoverageDataByFilepath,
  useGetLinesCoverageDataByFilepath,
  useGetStatementsCoverageDataByFilepath,
  type AllCoverageDataDeatil,
} from '../../model/coverage-data'
import { useRoute } from 'vue-router'
import { getDir, getFilename } from '../../utils'

const useIsAllFileInOneDir = () => {
  const coverageDataRef = useCoverageData()
  return computed(() => {
    const coverageData = coverageDataRef.value
    if (coverageData === undefined) {
      return []
    }
    const filepaths = Object.keys(coverageData)
    let dir = null
    let count = 0
    for (const filepath of filepaths) {
      const currentDir = getDir(filepath)
      if (dir !== currentDir) {
        dir = currentDir
        count += 1
        if (count === 2) {
          return false
        }
      }
    }
    return true
  })
}

// 明确选择了某个目录
export const useDir = () => {
  const route = useRoute()
  const isAllFileInOneDir = useIsAllFileInOneDir()
  return computed(() => {
    if (isAllFileInOneDir.value) {
      return '.'
    }
    const dir = route.query['dir']
    if (dir !== undefined) {
      return String(dir)
    }
    return ''
  })
}

export const useIsDirMode = () => {
  const dir = useDir()
  return computed(() => {
    return dir.value !== '' && dir.value !== '.'
  })
}

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

const useGetDirModeFiles = () => {
  const coverageDataRef = useCoverageData()
  const getCoverageUtilsRef = useGetCoverageUtils()
  const dirRef = useDir()
  return computed(() => () => {
    const dir = dirRef.value
    const getCoverageUtils = getCoverageUtilsRef.value

    const coverageData = coverageDataRef.value
    if (coverageData === undefined) {
      return []
    }

    const filepaths = Object.keys(coverageData)
    const result: Array<[string, AllCoverageDataDeatil]> = []
    // 详情文件模式
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

const useGetAllModeFiles = () => {
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
    return Object.entries(result).sort(([a], [b]) => String(a).localeCompare(String(b))) // 字典序
  })
}

export const useFiles = () => {
  const dirRef = useDir()
  const getDirModeFiles = useGetDirModeFiles()
  const getAllModeFiles = useGetAllModeFiles()
  return computed(() => {
    const dir = dirRef.value
    if (dir !== '') {
      return getDirModeFiles.value()
    }
    return getAllModeFiles.value()
  })
}
