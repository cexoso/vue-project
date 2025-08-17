import { readFileSync } from 'fs'
import { join } from 'path'
export const getHtmlTemplate = () => {
  const template = readFileSync(join(__dirname, './index.html')).toString()
  return template
}

export const getAssetsDir = () => {
  return join(__dirname, './assets')
}
