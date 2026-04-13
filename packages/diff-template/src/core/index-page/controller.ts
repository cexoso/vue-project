import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCoverageData } from '../../domain/coverage/data'
import { getDir } from '../../utils'
import {
  useFiles as useDomainFiles,
  useStatisticsCoverageData as useDomainStatisticsCoverageData,
} from '../../domain/coverage/statistics'

const useIsAllFileInOneDir = () => {
  const coverageDataRef = useCoverageData()
  return computed(() => {
    const coverageData = coverageDataRef.value
    if (coverageData === undefined) {
      return false
    }
    const filepaths = Object.keys(coverageData)
    let dir: string | null = null
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

export const useFiles = () => {
  const dir = useDir()
  return useDomainFiles(dir)
}

export const useStatisticsCoverageData = () => {
  const dir = useDir()
  return useDomainStatisticsCoverageData(dir)
}
