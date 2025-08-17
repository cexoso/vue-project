export function join(...paths: string[]) {
  // 过滤空字符串片段
  const nonEmptyPaths = paths.filter((path) => typeof path === 'string' && path.trim() !== '')

  if (nonEmptyPaths.length === 0) {
    return ''
  }

  // 拼接所有路径，并统一替换为 '/' 分隔
  let joined = nonEmptyPaths.join('/')

  // 处理多个连续斜杠（替换为单个）
  joined = joined.replace(/\/+/g, '/')

  // 处理特殊情况：如果是绝对路径（以 '/' 开头），保持根目录
  // 若不是绝对路径，确保不额外添加开头斜杠
  return joined
}
