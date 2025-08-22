import { computed } from 'vue'
import { useCoverageData } from '../../../../model/coverage-data'
import { useFilePath } from '../../controller'
import { SourceHelper } from '../source'

export const useSourceHelper = () => {
  const coverageData = useCoverageData()
  const file = useFilePath()
  return computed(() => {
    const cdata = coverageData.value
    if (cdata === undefined || file === undefined) {
      return null
    }
    const { source: rawSource } = cdata[file] ?? {}
    if (rawSource === undefined) {
      return null
    }
    const source = new SourceHelper(rawSource)
    return source
  })
}
