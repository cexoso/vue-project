import { dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'

export function makeSureDirExist(absolutePath: string) {
  const dir = dirname(absolutePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}
