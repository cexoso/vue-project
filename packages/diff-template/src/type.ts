type RelativePath = string
type AbsolutePath = string

export interface Position {
  line: number
  column: number | null // 在实际的落地中发现 column 还有可能为 null
}

export interface CodeRanger {
  start: Position
  end: Position
}

interface BranchLocation {
  start: Partial<Position>
  end: Partial<Position>
}

export type MaybeCodeRanger = BranchLocation | CodeRanger

export type StatementBlock = CodeRanger

export type BranchType = 'if' | 'binary-expr' | 'cond-expr'

export interface BranchBlock {
  // 这是整个分支块代码的范围
  loc: CodeRanger
  type: BranchType // 也有可能有其它的 'if' 'binary-expr' 等，我暂时没法枚举
  locations: BranchLocation[] // 这里有几个分支，就会有几个元素，每个元素表示的是代码的范围
}

export interface FunctionBlock {
  decl: CodeRanger // 函数声明所在的位置
  loc: CodeRanger // 函数体所在的位置
  name: string // 函数名称;
}
export interface CoverageItem {
  coverage: {
    path: AbsolutePath // 绝对路径
    statementMap: Record<string, StatementBlock>
    fnMap: Record<string, FunctionBlock>
    branchMap: Record<string, BranchBlock>
    s: Record<number, number>
    f: Record<number, number>
    b: Record<number, number[]>
  }
  source?: string
}
export type CoverageData = Record<RelativePath, CoverageItem>

export type GitDiffData = string

export interface CoverageStatisticsData {
  count: number
  coverageCount: number
}
