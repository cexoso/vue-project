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
  const result = shell.exec(cmd)
  if (result.code !== 0) {
    shell.echo(result.stderr)
    shell.exit(result.code)
  }
  return result.stdout
}
