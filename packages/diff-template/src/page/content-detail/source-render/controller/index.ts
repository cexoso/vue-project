import { computed } from 'vue'
import type { RequiredColumnPosition } from '../../../../type'
import { useCoverageData } from '../../../../model/coverage-data'
import { useFilePath, useHasChange } from '../../controller'
import { isPositionEqual } from '../../../../model/coverage-data/coverage-handle'
import type { AllBlock, SpanBlock, StringBlock } from './type'
import { useSourceHelper } from './use-source-helper'
import { useUncoverBlock } from './use-uncover-block'
export { useSourceHelper } from './use-source-helper'

export const useSourceToken = () => {
  const blocksRef = useUncoverBlock()
  const sourceRef = useSourceHelper()
  return computed(() => {
    const block = blocksRef.value
    const source = sourceRef.value
    if (source === null) {
      return []
    }

    let currentIndex = { line: 0, column: 0 }

    const renderIncludeTo = (nextposition: RequiredColumnPosition) => {
      if (!isPositionEqual(currentIndex, nextposition)) {
        result.push({
          type: 'string',
          payload: source.getSnippet({
            start: currentIndex,
            end: nextposition,
          }),
        })
        setCurrentIndex(nextposition, 1)
      }
    }

    const result: Array<StringBlock | SpanBlock> = []

    const setCurrentIndex = (basePosition: RequiredColumnPosition, columnOffset: number = 0) => {
      currentIndex = offsetColumn(basePosition, columnOffset)
    }

    const offsetColumn = (basePosition: RequiredColumnPosition, columnOffset: number = 0) => ({
      ...basePosition,
      column: basePosition.column + columnOffset,
    })

    const horizontalMove = <T extends AllBlock>(codeBlock: T) => {
      // 在 demo 示例中，我发现 istanbul 的 ranger 在某些情况下总会偏移一个字符，我不能确定这个问题出在哪，先写一个函数来避免
      return {
        ...codeBlock,
        block: {
          ...codeBlock.block,
          start: { ...codeBlock.block.start, column: codeBlock.block.start.column + 1 },
        },
      }
    }

    for (let i = 0; i < block.length; i++) {
      let current = block[i]
      if (current.type === 'ranger') {
        current = horizontalMove(current)
        renderIncludeTo(offsetColumn(current.block.start, -1))
        result.push({
          type: 'span',
          payload: {
            title: current.title ?? '',
            class: current.rangerType,
            content: source.getSnippet(current.block),
          },
        })
        setCurrentIndex(source.fillPosition(current.block.end), 1)
      } else if (current.type === 'branch') {
        renderIncludeTo(offsetColumn(current.block.start))
        result.push({
          type: 'span',
          payload: {
            title: current.title ?? '',
            content: current.label,
            class: 'branch-tag',
          },
        })
        setCurrentIndex(current.block.start, 1)
      } else {
        current = horizontalMove(current)
        renderIncludeTo(offsetColumn(current.block.start, -1))
        result.push({
          type: 'span',
          payload: {
            title: current.title ?? '',
            content: source.getSnippet(current.block),
            class: 'function-tag',
          },
        })
        setCurrentIndex(source.fillPosition(current.block.end), 1)
      }
    }
    renderIncludeTo(source.getEndPosition())
    return result
  })
}

interface Line {
  // 分支覆盖率是一个块，在报告上只有 start line 才会展示，所以不能保证每行都有
  statementCount: number | undefined
}

export const useSourceCoverageData = () => {
  const coverageData = useCoverageData()
  const hasChange = useHasChange()
  const file = useFilePath()
  return computed<Line[]>(() => {
    const cdata = coverageData.value
    if (cdata === undefined || file === undefined) {
      return []
    }
    const { source, coverage } = cdata[file] ?? {}
    if (source === undefined) {
      // 如果没有越用 sourcemap 功能，会导致没有源码
      return []
    }

    const statementMap = new Map<number, number>()

    for (const [s, count] of Object.entries(coverage.s)) {
      const record = coverage.statementMap[s]
      if (hasChange(record)) {
        statementMap.set(record.start.line, count)
      }
    }

    return source.split('\n').map((_, line) => ({
      statementCount: statementMap.get(line + 1),
    }))
  })
}
