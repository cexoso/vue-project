import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveTargetBranch } from './get-git-diff'

describe('resolveTargetBranch', () => {
  let originalEnv: NodeJS.ProcessEnv
  let stderrOutput: string[]

  beforeEach(() => {
    originalEnv = { ...process.env }
    // 清空所有相关环境变量
    delete process.env['git_diff_target']
    delete process.env['GITHUB_BASE_REF']
    delete process.env['CI_MERGE_REQUEST_TARGET_BRANCH_NAME']
    // 拦截 stderr
    stderrOutput = []
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      stderrOutput.push(String(chunk))
      return true
    })
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('手动配置 git_diff_target 时，优先使用它', () => {
    process.env['git_diff_target'] = 'main'
    const result = resolveTargetBranch()
    expect(result?.target).toBe('main')
    expect(result?.source).toContain('git_diff_target')
  })

  it('GitHub Actions 环境下，自动读取 GITHUB_BASE_REF', () => {
    process.env['GITHUB_BASE_REF'] = 'main'
    const result = resolveTargetBranch()
    expect(result?.target).toBe('main')
    expect(result?.source).toContain('GITHUB_BASE_REF')
  })

  it('GitLab CI 环境下，自动读取 CI_MERGE_REQUEST_TARGET_BRANCH_NAME', () => {
    process.env['CI_MERGE_REQUEST_TARGET_BRANCH_NAME'] = 'develop'
    const result = resolveTargetBranch()
    expect(result?.target).toBe('develop')
    expect(result?.source).toContain('CI_MERGE_REQUEST_TARGET_BRANCH_NAME')
  })

  it('git_diff_target 优先级高于 GITHUB_BASE_REF', () => {
    process.env['git_diff_target'] = 'feature-branch'
    process.env['GITHUB_BASE_REF'] = 'main'
    const result = resolveTargetBranch()
    expect(result?.target).toBe('feature-branch')
    expect(result?.source).toContain('git_diff_target')
  })

  it('所有环境变量都未配置时，返回 undefined', () => {
    const result = resolveTargetBranch()
    expect(result).toBeUndefined()
  })

  it('找到对比分支时，输出包含分支名的运行时提示到 stderr', () => {
    process.env['GITHUB_BASE_REF'] = 'main'
    resolveTargetBranch()
    expect(stderrOutput.some((line) => line.includes('main'))).toBe(true)
    expect(stderrOutput.some((line) => line.includes('[git-diff-report]'))).toBe(true)
  })

  it('未找到对比分支时，输出全量覆盖率提示到 stderr', () => {
    resolveTargetBranch()
    expect(stderrOutput.some((line) => line.includes('全量覆盖率'))).toBe(true)
  })
})
