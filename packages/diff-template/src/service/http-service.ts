import { define } from '@cexoso/vue-singleton'
import type { CoverageData } from '../type'
const getInitialState = (): unknown => {
  return (window as any)._initialState
}
export const useDatas = define(() => {
  const state = getInitialState() as {
    diff: string
    coverageData: CoverageData
    metaInfo: { projectInfo: string }
  }
  const getCoverageData = () => state.coverageData

  const getGitDiffLog = () => state.diff

  const getMetaInfo = () => state.metaInfo

  return {
    getCoverageData,
    getGitDiffLog,
    getMetaInfo,
  }
})
