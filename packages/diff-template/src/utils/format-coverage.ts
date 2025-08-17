import Big from 'big.js'

export const toPercent = ({ count, coverageCount }: { count: number; coverageCount: number }) => {
  if (count === 0) {
    return '0%'
  }
  const percentage = new Big(coverageCount).times(100).div(count)

  // 如果百分比是整数，则不显示小数位
  if (percentage.mod(1).eq(0)) {
    return `${percentage.toFixed(0, 0)}%`
  }
  // 否则保留两位小数
  return `${percentage.toFixed(2, 0)}%`
}

export const toFraction = ({ count, coverageCount }: { count: number; coverageCount: number }) => {
  if (count === 0) {
    return 'A/N'
  }
  return `${coverageCount}/${count}`
}
