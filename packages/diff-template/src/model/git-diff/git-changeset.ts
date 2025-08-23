import { computed } from 'vue'
import { useGitDiffData } from './data'
import { handleDiff, type ChangeLines } from './git-diff-parse'
import { useProjectInfo } from '../coverage-data/coverage-handle'
import { relative } from '../../utils/path-relative'

const useGitChangeset = () => {
  const gitChangeset = useGitDiffData()
  const projectInfoRef = useProjectInfo()
  return computed(() => {
    const projectInfo = projectInfoRef.value
    if (!gitChangeset.value || projectInfo === undefined) {
      return undefined
    }
    const originMap = handleDiff(gitChangeset.value)
    let diffMap: Record<string, ChangeLines> = {}

    const keys = Object.keys(originMap)
    for (let key of keys) {
      const value = originMap[key]
      diffMap[relative(projectInfo, key)] = value
    }
    return diffMap
  })
}

export type ChangeLinesSet = Set<number>

export const useGitChangeLineSet = () => {
  const gitChangesetRef = useGitChangeset()
  return computed(() => {
    const gitChangeset = gitChangesetRef.value
    const result: Record<string, Set<number>> = {}
    if (gitChangeset === undefined) {
      return undefined
    }
    for (const [fileName, changeLines] of Object.entries(gitChangeset)) {
      const set = new Set<number>()
      result[fileName] = set
      for (const line of changeLines) {
        set.add(line)
      }
    }
    return result
  })
}
