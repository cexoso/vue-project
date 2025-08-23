import { define } from '@cexoso/vue-singleton'
import { computed, shallowRef } from 'vue'
import { useDatas } from '../../service/http-service'

export const useRawGitDiffData = () => {
  const http = useDatas()
  return http.getGitDiffLog()
}

export const useGitDiffData = () => {
  const gitDiffDataSource = useRawGitDiffData()
  const openGitDiffFeature = useOpenGitDiffFeature()
  return computed(() => {
    if (openGitDiffFeature.value) {
      return gitDiffDataSource
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
