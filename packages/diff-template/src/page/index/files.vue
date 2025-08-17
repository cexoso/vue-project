<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            File
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Coverage
          </th>
          <th
            colspan="2"
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Statements
          </th>
          <th
            scope="col"
            colspan="2"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Branches
          </th>
          <th
            scope="col"
            colspan="2"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Functions
          </th>
          <th
            scope="col"
            colspan="2"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Lines
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="[dirname, coverage] of files" :key="dirname" role="coverage-data" :aria-label="dirname">
          <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            :class="getCoverageClass(coverage.statements)"
          >
            <span @click="handleDir(dirname)" class="hover:text-blue-600 hover:cursor-pointer">
              {{ dirname }}
            </span>
          </td>
          <td :class="getCoverageClass(coverage.statements)" class="px-6 py-4 whitespace-nowrap">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-green-600 h-2.5 rounded-full"
                :class="barClass(coverage.statements)"
                :style="barStyle(coverage.statements)"
              />
            </div>
          </td>
          <td
            :class="getCoverageClass(coverage.statements)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="statements-percent"
          >
            {{ toPercent(coverage.statements) }}
          </td>
          <td
            :class="getCoverageClass(coverage.statements)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="statements-fraction"
          >
            {{ toFraction(coverage.statements) }}
          </td>
          <td
            :class="getCoverageClass(coverage.branchs)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="branchs-percent"
          >
            {{ toPercent(coverage.branchs) }}
          </td>
          <td
            :class="getCoverageClass(coverage.branchs)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="branchs-fraction"
          >
            {{ toFraction(coverage.branchs) }}
          </td>
          <td
            :class="getCoverageClass(coverage.functions)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="functions-percent"
          >
            {{ toPercent(coverage.functions) }}
          </td>
          <td
            :class="getCoverageClass(coverage.functions)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="functions-fraction"
          >
            {{ toFraction(coverage.functions) }}
          </td>
          <td
            :class="getCoverageClass(coverage.lines)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="lines-percent"
          >
            {{ toPercent(coverage.lines) }}
          </td>
          <td
            :class="getCoverageClass(coverage.lines)"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            role="lines-fraction"
          >
            {{ toFraction(coverage.lines) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useDir, useFiles } from './controller'
import { toFraction, toPercent } from '../../utils/format-coverage'
import type { CoverageStatisticsData } from '../../type'
import { useChangeQuery, usePush } from '../../utils/use-router'

function getCoverageClass(param: CoverageStatisticsData): string {
  const green = 'bg-green-50 border border-green-200 text-green-700'
  const yellow = 'bg-yellow-50 border border-yellow-200 text-yellow-700'
  const red = 'bg-red-50 border border-red-200 text-red-700'
  if (param.count === 0) {
    return green
  }
  const coverage = param.coverageCount / param.count
  if (coverage >= 0.8) {
    return green
  }
  if (coverage >= 0.5) {
    return yellow
  }
  return red
}

const barStyle = (param: CoverageStatisticsData) => {
  return `width: ${toPercent(param)}`
}

const barClass = (param: CoverageStatisticsData) => {
  const green = 'bg-green-600'
  const yellow = 'bg-yellow-600'
  const red = 'bg-red-600'
  if (param.count === 0) {
    return green
  }
  const coverage = param.coverageCount / param.count
  if (coverage >= 0.8) {
    return green
  }
  if (coverage >= 0.5) {
    return yellow
  }
  return red
}

const files = useFiles()
const currentDirRef = useDir()
const push = usePush()
const changeQuery = useChangeQuery()
const handleDir = (dir: string) => {
  const currentDir = currentDirRef.value
  if (currentDir !== '') {
    push({ name: 'content-detail', query: { file: `${currentDir}/${dir}` } })
  } else {
    changeQuery({ dir }, { isReplace: false })
  }
}
</script>
