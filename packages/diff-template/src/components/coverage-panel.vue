<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-green-100 rounded-lg p-4" aria-label="Statements" role="panel">
      <span class="text-2xl font-bold text-green-600"> {{ statementsPercent }} </span>
      <p class="text-gray-600">Statements</p>
      <p class="text-sm text-gray-500">
        {{ statementsFraction }}
      </p>
    </div>

    <div class="bg-yellow-100 rounded-lg p-4" aria-label="Branches" role="panel">
      <span class="text-2xl font-bold text-yellow-600">
        {{ branchPercent }}
      </span>
      <p class="text-gray-600">Branches</p>
      <p class="text-sm text-gray-500">
        {{ branchFraction }}
      </p>
    </div>

    <div class="bg-green-100 rounded-lg p-4" aria-label="Functions" role="panel">
      <span class="text-2xl font-bold text-green-600">
        {{ functionPercent }}
      </span>
      <p class="text-gray-600">Functions</p>
      <p class="text-sm text-gray-500">
        {{ functionsFraction }}
      </p>
    </div>

    <div class="bg-green-100 rounded-lg p-4" aria-label="Lines" role="panel">
      <span class="text-2xl font-bold text-green-600">
        {{ linesPercent }}
      </span>
      <p class="text-gray-600">Lines</p>
      <p class="text-sm text-gray-500">
        {{ linesFraction }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'
import type { AllCoverageDataDeatil } from '../model/coverage-data/coverage-handle'
import { toFraction, toPercent } from '../utils/format-coverage'

const props = defineProps({
  coverageData: {
    type: Object as PropType<AllCoverageDataDeatil>,
    required: true,
  },
})

const statementsFraction = computed(() => toFraction(props.coverageData.statements))
const statementsPercent = computed(() => toPercent(props.coverageData.statements))
const branchPercent = computed(() => toPercent(props.coverageData.branchs))
const branchFraction = computed(() => toFraction(props.coverageData.branchs))
const functionPercent = computed(() => toPercent(props.coverageData.functions))
const functionsFraction = computed(() => toFraction(props.coverageData.functions))
const linesPercent = computed(() => toPercent(props.coverageData.lines))
const linesFraction = computed(() => toFraction(props.coverageData.lines))
</script>
