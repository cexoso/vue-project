const filesplit = '/' // 先不考虑 window 的 \ 了
export const getDir = (filepath: string) => {
  const names = filepath.split(filesplit)
  if (names.length === 1) {
    return '.' // 如果是根目录的文件
  }
  return names.slice(0, names.length - 1).join('/')
}

export const getFilename = (filepath: string) => {
  const names = filepath.split(filesplit)
  return names[names.length - 1]
}
