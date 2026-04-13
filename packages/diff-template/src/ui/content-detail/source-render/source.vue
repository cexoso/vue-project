<template>
  <div class="flex" role="source-display">
    <div class="flex flex-col">
      <div v-for="(data, key) of coverageData" :key="key" class="flex">
        <div class="line-number w-12 text-right pr-4 text-gray-500 select-none">{{ key + 1 }}</div>
        <div
          class="run-count w-12 text-right pr-4 text-blue-600 font-semibold"
          :class="{
            'bg-green-50': data.statementCount,
            'bg-gray-50': data.statementCount === undefined,
            'line-uncovered': data.statementCount === 0,
          }"
        >
          {{ data.statementCount ? data.statementCount + 'x' : '' }}
        </div>
      </div>
    </div>
    <PrismRender />
  </div>
</template>

<script lang="ts" setup>
import { PrismRender } from './prism-render'
import { useSourceCoverageData } from './controller'
const coverageData = useSourceCoverageData()
</script>

<style>
.line-uncovered {
  background-color: #f6c6ce;
}
</style>
