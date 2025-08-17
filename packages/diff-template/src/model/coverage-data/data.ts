import { defineResource } from '@cexoso/vue-singleton'
import { computed } from 'vue'
import { useDatas } from '../../service/http-service'

const useCoverageDataSource = defineResource(() => {
  const http = useDatas()
  return () => http.getCoverageData()
})

export const useCoverageData = () => {
  const coverageDataSource = useCoverageDataSource()
  return computed(() => coverageDataSource.data.value)
}
