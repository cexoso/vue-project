import { useDatas } from '../service/http-service'
import { getOrCreateStub } from '@cexoso/test-utils'
import json from './coverage.json'
import DirModeJSON from './dir-mode-coverage.json'
import dirModeGitLog from './dir-mode-diff.log?raw'
import metaInfo from './meta-info.json'
import type { CoverageData } from '../type'
import { useRouter } from 'vue-router'
import { GCMMock } from './gcm-mock-data'

export const mockGCMExample = () => {
  const http = useDatas()
  const mock = GCMMock()
  const getCoverageDataStub = getOrCreateStub(http, 'getCoverageData')
  getCoverageDataStub.resolves(mock.coverageData)
  const getGitDiffLogStub = getOrCreateStub(http, 'getGitDiffLog')
  getGitDiffLogStub.resolves(mock.diff)
  const getMetaInfoStub = getOrCreateStub(http, 'getMetaInfo')
  getMetaInfoStub.resolves(mock.metaInfo)
}

export const mockBase = () => {
  const http = useDatas()
  const getCoverageDataStub = getOrCreateStub(http, 'getCoverageData')
  getCoverageDataStub.resolves(DirModeJSON as unknown as CoverageData)
  const getGitDiffLogStub = getOrCreateStub(http, 'getGitDiffLog')
  getGitDiffLogStub.resolves('')
  const getMetaInfoStub = getOrCreateStub(http, 'getMetaInfo')
  getMetaInfoStub.resolves(metaInfo)
}

export const mockSingleDirMode = () => {
  mockBase()
  const http = useDatas()
  const getCoverageDataStub = getOrCreateStub(http, 'getCoverageData')
  getCoverageDataStub.resolves(json as unknown as CoverageData)
}

export const mockGitDiff = () => {
  const http = useDatas()
  mockBase()
  const getGitDiffLogStub = getOrCreateStub(http, 'getGitDiffLog')
  getGitDiffLogStub.resolves(dirModeGitLog)
}

export const mockContentDetail = () => {
  mockGitDiff()
  useRouter().replace({
    name: 'content-detail',
    query: {
      file: 'src/with-resolves.ts',
    },
  })
}
