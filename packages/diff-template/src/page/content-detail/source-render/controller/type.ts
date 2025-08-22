import type { BranchType, CodeRanger } from '../../../../type'
export interface StringBlock {
  type: 'string'
  payload: string
}

export interface SpanBlock {
  type: 'span'
  payload: {
    title: string
    content: string
    class?: string
  }
}

export interface Block {
  block: CodeRanger
  title?: string
}
export interface RangerBlock extends Block {
  type: 'ranger'
  rangerType: string
}
export interface BranchBlock extends Block {
  type: 'branch'
  branchType: BranchType
  coverageData: any
  title?: string
  label: string
}
export interface FunctionBlock extends Block {
  type: 'function'
}
export type AllBlock = RangerBlock | BranchBlock | FunctionBlock
