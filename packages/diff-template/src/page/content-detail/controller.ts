import { useRoute } from 'vue-router'
import type { CodeRanger } from '../../type'
import { useGitChangeset } from '../../model/git-diff/git-changeset'
import { computed } from 'vue'
import {
  useGetBranchCoverageDataByFilepath,
  useGetFunctionCoverageDataByFilepath,
  useGetLinesCoverageDataByFilepath,
  useGetStatementsCoverageDataByFilepath,
} from '../../model/coverage-data/coverage-handle'

export const useFilePath = () => {
  const route = useRoute()
  const file = route.query['file'] as string
  return file.replace(/^\.\//, '')
}

export const useHasChange = () => {
  const gitChangesetRef = useGitChangeset()
  const file = useFilePath()
  function hasChange(codeRanger: CodeRanger) {
    const gitChangeset = gitChangesetRef.value
    if (gitChangeset === undefined) {
      return true // 当不存在 gitChangeset 数据时，当成全更新处理（全量）
    }
    const fileChange = gitChangeset?.[file]
    if (fileChange === undefined) {
      return false
    }
    return (
      // 这里可以考虑二分
      fileChange.findIndex((line) => {
        if (line < codeRanger.start.line) {
          return false
        }
        if (line > codeRanger.end.line) {
          return false
        }
        return true
      }) !== -1
    )
  }
  return hasChange
}

export const useCurrentStatementsCoverageData = () => {
  const getCoverageDataByFilepath = useGetStatementsCoverageDataByFilepath()
  const file = useFilePath()
  return computed(() => getCoverageDataByFilepath.value(file))
}

export const useCurrentBranchCoverageData = () => {
  const getCoverageDataByFilepath = useGetBranchCoverageDataByFilepath()

  const file = useFilePath()
  return computed(() => getCoverageDataByFilepath.value(file))
}

export const useCurrentFunctionsCoverageData = () => {
  const getCoverageDataByFilepath = useGetFunctionCoverageDataByFilepath()

  const file = useFilePath()
  return computed(() => getCoverageDataByFilepath.value(file))
}

export const useCurrentLinesCoverageData = () => {
  const getCoverageDataByFilepath = useGetLinesCoverageDataByFilepath()

  const file = useFilePath()
  return computed(() => getCoverageDataByFilepath.value(file))
}
