import { computed } from 'vue'
import type { BranchType, CodeRanger, Position } from '../../../type'
import { useCoverageData } from '../../../model/coverage-data'
import { useFilePath, useHasChange } from '../controller'
import {
  isCodeRanger,
  isPositionEqual,
  useGetBranchHasChange,
} from '../../../model/coverage-data/coverage-handle'
import { SourceHelper } from './source'

interface Block {
  block: CodeRanger
  title?: string
}
interface RangerBlock extends Block {
  type: 'ranger'
  rangerType: string
}
interface BranchBlock extends Block {
  type: 'branch'
  branchType: BranchType
  coverageData: any
  title?: string
  label: string
}
interface FunctionBlock extends Block {
  type: 'function'
}
type AllBlock = RangerBlock | BranchBlock | FunctionBlock

interface StringBlock {
  type: 'string'
  payload: string
}

interface SpanBlock {
  type: 'span'
  payload: {
    title: string
    content: string
    class?: string
  }
}

export const useSourceHelper = () => {
  const coverageData = useCoverageData()
  const file = useFilePath()
  return computed(() => {
    const cdata = coverageData.value
    if (cdata === undefined || file === undefined) {
      return null
    }
    const { source: rawSource } = cdata[file] ?? {}
    if (rawSource === undefined) {
      return null
    }
    const source = new SourceHelper(rawSource)
    return source
  })
}

const useUncoverBlock = () => {
  const coverageData = useCoverageData()
  const innerHasChange = useHasChange()
  const file = useFilePath()
  const getBranchHasChange = useGetBranchHasChange()
  const sourceHelperRef = useSourceHelper()

  return computed(() => {
    const sourceHelper = sourceHelperRef.value
    const cdata = coverageData.value
    if (cdata === undefined || file === undefined || sourceHelper === null) {
      return []
    }
    const { source, coverage } = cdata[file] ?? {}
    if (source === undefined) {
      // 如果没有越用 sourcemap 功能，会导致没有源码
      return []
    }

    const uncoverStatementBlock: AllBlock[] = []

    for (const [s, count] of Object.entries(coverage.s)) {
      const record = coverage.statementMap[s]
      if (innerHasChange(record) && count === 0) {
        uncoverStatementBlock.push({
          block: record,
          type: 'ranger',
          rangerType: 'statement-tag',
          title: 'statement not covered',
        })
      }
    }

    for (const [b, counts] of Object.entries(coverage.b)) {
      const branchBlocks = coverage.branchMap[b]
      const changes = getBranchHasChange(branchBlocks, file)
      if (branchBlocks.type === 'if') {
        const cData = branchBlocks.locations.map((_, key) => counts[key])
        const hasUncoverBranch = cData.includes(0)
        const hasChange = branchBlocks.locations.some((_, key) => changes[key])
        if (hasChange && hasUncoverBranch) {
          const isIfPathNotCover = counts[0] === 0
          uncoverStatementBlock.push({
            block: branchBlocks.loc,
            type: 'branch',
            branchType: branchBlocks.type,
            coverageData: cData,
            title: isIfPathNotCover ? 'if path not taken' : 'else path not taken',
            label: isIfPathNotCover ? 'I' : 'E',
          })
        }
      } else if (branchBlocks.type === 'cond-expr' || branchBlocks.type === 'binary-expr') {
        branchBlocks.locations.forEach((loc, key) => {
          if (changes[key] && counts[key] === 0 && isCodeRanger(loc)) {
            uncoverStatementBlock.push({
              block: loc,
              type: 'ranger',
              rangerType: 'branch-expr-tag',
              title: 'branch not covered',
            })
          }
        })
      }
    }

    for (const [f, counts] of Object.entries(coverage.f)) {
      const record = coverage.fnMap[f]
      if (innerHasChange(record.loc) && counts === 0) {
        const decl = record.decl || record.loc
        uncoverStatementBlock.push({
          block: {
            start: {
              line: decl.start.line,
              column: decl.start.column,
            },
            end: {
              line: decl.start.line,
              column: decl.start.column + 2,
            },
          },
          type: 'function',
          title: 'function not covered',
        })
      }
    }

    return uncoverStatementBlock.sort((a, b) => {
      return (
        sourceHelper.getIndexOf(a.block.start.line, a.block.start.column) -
        sourceHelper.getIndexOf(b.block.start.line, b.block.start.column)
      )
      // if (a.block.start.line !== b.block.start.line) {
      //   return a.block.start.line - b.block.start.line
      // }
      // return a.block.start.column - b.block.start.column
    })
  })
}

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

    const renderIncludeTo = (nextposition: Position) => {
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

    const setCurrentIndex = (basePosition: Position, columnOffset: number = 0) => {
      currentIndex = offsetColumn(basePosition, columnOffset)
    }

    const offsetColumn = (basePosition: Position, columnOffset: number = 0) => ({
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
        setCurrentIndex(current.block.end, 1)
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
        setCurrentIndex(current.block.end, 1)
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
