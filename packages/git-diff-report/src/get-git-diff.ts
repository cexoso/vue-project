import shell from 'shelljs'

/**
 * @description 获取当前分支与目标分支之前的 diff 数据
 */
export const getGitDiff = (target: string) => {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git')
    shell.exit(1)
  }
  const cmd = `git diff ${target}`
  const result = shell.exec(cmd, { silent: true })
  if (result.code !== 0) {
    shell.echo(result.stderr)
    shell.exit(result.code)
  }
  return result.stdout.trim()
}

export const getProjectRoot = () => {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git')
    shell.exit(1)
  }
  const cmd = 'git rev-parse --show-toplevel'
  const result = shell.exec(cmd, { silent: true })
  if (result.code !== 0) {
    shell.echo(result.stderr)
    shell.exit(result.code)
  }
  return result.stdout.trim()
}

export type ResolvedTarget = {
  target: string
  source: string
}

/**
 * 按优先级检测对比目标分支：
 * 1. git_diff_target（手动配置）
 * 2. GITHUB_BASE_REF（GitHub Actions PR）
 * 3. CI_MERGE_REQUEST_TARGET_BRANCH_NAME（GitLab CI MR）
 *
 * 找到后输出运行时提示到 stderr，未找到也输出提示。
 */
export const resolveTargetBranch = (): ResolvedTarget | undefined => {
  const candidates: Array<{ envKey: string; source: string }> = [
    { envKey: 'git_diff_target', source: '手动配置 (git_diff_target)' },
    { envKey: 'GITHUB_BASE_REF', source: 'GitHub Actions (GITHUB_BASE_REF)' },
    {
      envKey: 'CI_MERGE_REQUEST_TARGET_BRANCH_NAME',
      source: 'GitLab CI (CI_MERGE_REQUEST_TARGET_BRANCH_NAME)',
    },
  ]

  for (const { envKey, source } of candidates) {
    const value = process.env[envKey]
    if (value) {
      process.stderr.write(`[git-diff-report] 对比分支: ${value} (来源: ${source})\n`)
      return { target: value, source }
    }
  }

  process.stderr.write(
    '[git-diff-report] 未配置对比分支，将生成全量覆盖率报告\n'
  )
  return undefined
}
