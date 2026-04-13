import { computed } from 'vue'
import { useDatas } from '../../service/http-service'

export const useCoverageData = () => {
  const http = useDatas()
  return computed(() => http.getCoverageData())
}
