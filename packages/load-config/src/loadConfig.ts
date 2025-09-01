import { withResolvers } from '@cexoso/utils'
import { spawn, type StdioOptions } from 'child_process'
import { join } from 'path'
import { tryGetFile, isTsMode } from './try-file'

export const loadConfig = async (
  filePath: string,
  opts?: {
    debug?: boolean
  }
) => {
  let tsRegister = require.resolve('ts-node/register/transpile-only')
  const runnerFile = tryGetFile(join(__dirname, './runner.ts'))
  const { promise, resolve, reject } = withResolvers()
  const configPath = tryGetFile(filePath)
  const args: string[] = []
  if (isTsMode()) {
    args.push('-r')
    args.push(tsRegister)
  }

  args.push(runnerFile) // 入口
  args.push('--config-file') // 参数
  args.push(configPath)
  let stdio: StdioOptions = ['ipc']
  if (opts?.debug) {
    stdio.push('inherit')
  }

  let result = spawn('node', args, {
    stdio,
  })
  result.on('message', (config) => {
    resolve(config)
  })
  result.on('exit', (code) => {
    if (code !== 0) {
      reject(code)
    }
  })
  return promise
}
