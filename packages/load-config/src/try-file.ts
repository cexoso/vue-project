import { existsSync } from 'fs'
import { dirname, basename, extname, join } from 'path'

export const isTsMode = () => require.resolve('ts-node/register/transpile-only')
function changeExtname(filePath: string, newExtension: string) {
  // 获取文件的目录名和文件名（不包括扩展名）
  const dir = dirname(filePath)

  // 组合新的文件路径
  const result = join(dir, basename(filePath, extname(filePath)) + newExtension)
  if (result.startsWith('.') || result.startsWith('/')) {
    return result
  }
  return './' + result
}

export function tryGetFile(path: string) {
  const tsPath = changeExtname(path, '.ts')
  const tryFiles: string[] = []
  // 仅在开发环境允许加载 TS 文件
  if (isTsMode()) {
    tryFiles.push(tsPath)
    if (existsSync(tsPath)) {
      return tsPath
    }
  }
  const jsPath = changeExtname(path, '.js')

  tryFiles.push(jsPath)
  if (existsSync(jsPath)) {
    return jsPath
  }
  throw new Error(`找不到对应的入口, try file:\n${tryFiles.join('\n')}`)
}
