<template>
  <div class="flex">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">
      <span @click="handleAllFileClick" :class="allFilesClass"> All files </span>
      <span class="ml-4" v-if="isDirMode"> {{ dir }} </span>
    </h1>
  </div>
  <div class="text-gray-500 mb-2" v-if="hasGitDiff">你可以使用 m 键来切换全量/增量覆盖率</div>
  <CoveragePanel :coverage-data="coverageData" />
</template>

<script lang="ts" setup>
import CoveragePanel from '../components/coverage-panel.vue'
import { computed } from 'vue'
import { useDir, useIsDirMode, useStatisticsCoverageData } from '../../core/index-page/controller'
import { usePush } from '../../utils/use-router'
import { useHasGitDiff } from '../../domain/git-diff/data'
const dir = useDir()

const isDirMode = useIsDirMode()

const allFilesClass = computed(() => {
  if (isDirMode.value) {
    return ['text-blue-500', 'hover:cursor-pointer']
  }
  return []
})

const coverageData = useStatisticsCoverageData()

const push = usePush()
const handleAllFileClick = () => {
  push({ name: 'index' })
}
const hasGitDiff = useHasGitDiff()
</script>
