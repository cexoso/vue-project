import { define, defineResource } from '@cexoso/vue-singleton'
import { computed, shallowRef } from 'vue'
import { useDatas } from '../../service/http-service'

const useGitDiffDataSource = defineResource(() => {
  const http = useDatas()
  return async () => http.getGitDiffLog()
})

export const useGitDiffData = () => {
  const gitDiffDataSource = useGitDiffDataSource()
  const openGitDiffFeature = useOpenGitDiffFeature()
  return computed(() => {
    if (openGitDiffFeature.value) {
      return gitDiffDataSource.data.value
    }
    return ''
  })
}

// 表示是否启用 git diff 查看增量覆盖率特性
const useOpenGitDiffFeature = define(() => {
  return shallowRef(true)
})

export const useToggleGitDiffFeature = () => {
  const openGitDiff = useOpenGitDiffFeature()
  return () => {
    openGitDiff.value = !openGitDiff.value
  }
}
