import { describe, expect, it } from 'vitest'
import { computeStatistics } from './statistics'
import coverageData from '../../mock/dir-mode-coverage.json'
import metaInfo from '../../mock/meta-info.json'
import dirModeGitLog from '../../mock/dir-mode-diff.log?raw'
import type { CoverageData } from '../../type'

describe('computeStatistics', () => {
  it('全量覆盖率（无 diff）', () => {
    const result = computeStatistics({
      coverageData: coverageData as unknown as CoverageData,
      diff: '',
      metaInfo,
    })
    expect(result.statements.count).toBe(180)
    expect(result.statements.coverageCount).toBe(161)
    expect(result.branchs.count).toBe(51)
    expect(result.branchs.coverageCount).toBe(50)
    expect(result.functions.count).toBe(17)
    expect(result.functions.coverageCount).toBe(16)
    expect(result.lines.count).toBe(180)
    expect(result.lines.coverageCount).toBe(161)
  })

  it('增量覆盖率（有 diff）', () => {
    const result = computeStatistics({
      coverageData: coverageData as unknown as CoverageData,
      diff: dirModeGitLog,
      metaInfo,
    })
    expect(result.statements.count).toBe(3)
    expect(result.statements.coverageCount).toBe(1)
    expect(result.branchs.count).toBe(2)
    expect(result.branchs.coverageCount).toBe(1)
    expect(result.functions.count).toBe(1)
    expect(result.functions.coverageCount).toBe(1)
    expect(result.lines.count).toBe(3)
    expect(result.lines.coverageCount).toBe(1)
  })
})
