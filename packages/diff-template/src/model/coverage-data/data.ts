import { computed } from 'vue'
import { useDatas } from '../../service/http-service'

const useCoverageDataSource = () => {
  const http = useDatas()
  return http.getCoverageData()
}

export const useCoverageData = () => {
  const coverageDataSource = useCoverageDataSource()
  return computed(() => {
    return coverageDataSource
  })
}
