import { useRoute } from 'vue-router'
import type { CodeRanger } from '../../type'
import { computed } from 'vue'
import {
  useGetBranchCoverageDataByFilepath,
  useGetFunctionCoverageDataByFilepath,
  useGetLinesCoverageDataByFilepath,
  useGetStatementsCoverageDataByFilepath,
  useIsBlockHasChange,
} from '../../model/coverage-data/coverage-handle'

export const useFilePath = () => {
  const route = useRoute()
  const file = route.query['file'] as string
  return file.replace(/^\.\//, '')
}

export const useHasChange = () => {
  const file = useFilePath()
  const isCodeRangerHasChange = useIsBlockHasChange()
  return (codeRanger: CodeRanger) => isCodeRangerHasChange(codeRanger, file)
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
