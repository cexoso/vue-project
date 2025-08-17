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

      <p class="text-gray-600 mb-4">
        Press <em class="font-semibold">n</em> or <em class="font-semibold">j</em> to go to the next uncovered
        block, <em class="font-semibold">b</em>, <em class="font-semibold">p</em> or
        <em class="font-semibold">k</em> for the previous block.
      </p>

      <div class="mb-4">
        <label for="fileSearch" class="block text-gray-700 mb-2">Filter:</label>
        <input
          type="search"
          id="fileSearch"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
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
