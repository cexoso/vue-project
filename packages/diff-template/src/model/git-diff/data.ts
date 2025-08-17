import { defineResource } from '@cexoso/vue-singleton'
import { computed } from 'vue'
import { useDatas } from '../../service/http-service'

const useGitDiffDataSource = defineResource(() => {
  const http = useDatas()
  return async () => http.getGitDiffLog()
})

export const useGitDiffData = () => {
  const gitDiffDataSource = useGitDiffDataSource()
  return computed(() => gitDiffDataSource.data.value)
}
