<template>
  <div class="flex">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">
      <span @click="handleAllFileClick" :class="allFilesClass"> All files </span>
      <span class="ml-4" v-if="isDirMode"> {{ dir }} </span>
    </h1>
  </div>
  <CoveragePanel :coverage-data="coverageData" />
</template>

<script lang="ts" setup>
import CoveragePanel from '../../components/coverage-panel.vue'
import { computed } from 'vue'
import { useDir, useFiles, useIsDirMode } from './controller'
import { initAllCoverageData } from '../../model/coverage-data/coverage-handle'
import { usePush } from '../../utils/use-router'
const dir = useDir()

const isDirMode = useIsDirMode()
const files = useFiles()

const allFilesClass = computed(() => {
  if (isDirMode.value) {
    return ['text-blue-500', 'hover:cursor-pointer']
  }
  return []
})

const coverageData = computed(() => {
  return files.value.reduce((acc, [_, cdata]) => {
    return {
      statements: {
        count: cdata.statements.count + acc.statements.count,
        coverageCount: cdata.statements.coverageCount + acc.statements.coverageCount,
      },
      branchs: {
        count: cdata.branchs.count + acc.branchs.count,
        coverageCount: cdata.branchs.coverageCount + acc.branchs.coverageCount,
      },
      functions: {
        count: cdata.functions.count + acc.functions.count,
        coverageCount: cdata.functions.coverageCount + acc.functions.coverageCount,
      },
      lines: {
        count: cdata.lines.count + acc.lines.count,
        coverageCount: cdata.lines.coverageCount + acc.lines.coverageCount,
      },
    }
  }, initAllCoverageData())
})

const push = usePush()
const handleAllFileClick = () => {
  push({ name: 'index' })
}
</script>
