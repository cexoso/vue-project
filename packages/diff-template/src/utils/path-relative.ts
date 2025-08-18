function resolvePathSegments(path: string) {
  const isAbsolute = path.startsWith('/')
  const segments = path.split('/').filter((segment) => segment && segment !== '.')
  const resolved = []

  for (const segment of segments) {
    if (segment === '..') {
      // 如果是绝对路径且已经到根目录，则忽略 ..
      if (resolved.length === 0 && isAbsolute) continue
      // 如果不是根目录，则向上一级
      if (resolved.length > 0) resolved.pop()
    } else {
      resolved.push(segment)
    }
  }

  return { isAbsolute, segments: resolved }
}

export function relative(from: string, to: string) {
  // 解析两个路径
  const fromParsed = resolvePathSegments(from)
  const toParsed = resolvePathSegments(to)

  // 如果两个路径的根不同（一个绝对一个相对，或不同盘符），直接返回 to
  if (fromParsed.isAbsolute !== toParsed.isAbsolute) {
    return to
  }

  // 如果都是绝对路径但根不同（如 Windows 下的不同盘符），返回 to
  // 这里简化处理，实际环境可能需要更复杂的盘符判断
  if (fromParsed.isAbsolute && toParsed.isAbsolute) {
    // 此处假设根路径相同，实际应用中可能需要更复杂的判断
  }

  // 找到两个路径共同的起始部分
  let commonLength = 0
  while (
    commonLength < fromParsed.segments.length &&
    commonLength < toParsed.segments.length &&
    fromParsed.segments[commonLength] === toParsed.segments[commonLength]
  ) {
    commonLength++
  }

  // 计算需要向上的级数
  const upCount = fromParsed.segments.length - commonLength
  const upSegments = upCount > 0 ? Array(upCount).fill('..') : []

  // 计算需要向下的路径
  const downSegments = toParsed.segments.slice(commonLength)

  // 组合结果
  const allSegments = upSegments.concat(downSegments)

  // 如果没有任何片段，返回当前目录
  if (allSegments.length === 0) {
    return '.'
  }

  return allSegments.join('/')
}
