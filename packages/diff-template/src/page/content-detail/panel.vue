<template>
  <div class="mx-auto bg-white rounded-lg overflow-hidden">
    <div class="p-6">
      <div class="flex mb-4 items-center">
        <h1 class="text-2xl font-bold">
          <span @click="handleAllfileClick" class="text-blue-600 hover:cursor-pointer">All files</span>
          <span
            v-if="getDir(filepath) !== '.'"
            @click="handleDirClick"
            class="text-blue-600 hover:cursor-pointer ml-4"
          >
            {{ getDir(filepath) }}
          </span>
          <span class="ml-4 text-gray-700">
            {{ getFilename(filepath) }}
          </span>
        </h1>
      </div>

      <CoveragePanel :coverage-data="coverageData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import CoveragePanel from '../../components/coverage-panel.vue'
import { getDir, getFilename } from '../../utils'
import {
  useFilePath,
  useCurrentStatementsCoverageData,
  useCurrentLinesCoverageData,
  useCurrentBranchCoverageData,
  useCurrentFunctionsCoverageData,
} from './controller'
import { usePush } from '../../utils/use-router'
const statements = useCurrentStatementsCoverageData()
const lines = useCurrentLinesCoverageData()
const branchs = useCurrentBranchCoverageData()
const functions = useCurrentFunctionsCoverageData()
const coverageData = computed(() => {
  return {
    statements: statements.value,
    lines: lines.value,
    branchs: branchs.value,
    functions: functions.value,
  }
})
const filepath = useFilePath()

const push = usePush()

const handleDirClick = () => {
  push({ name: 'index', query: { dir: getDir(filepath) } })
}

const handleAllfileClick = () => {
  push({ name: 'index' })
}
</script>
