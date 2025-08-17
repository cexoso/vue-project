import { computed } from 'vue'
import { useGitDiffData } from './data'
import { handleDiff } from './git-diff-parse'

export const useGitChangeset = () => {
  const gitChangeset = useGitDiffData()
  return computed(() => {
    if (!gitChangeset.value) {
      return undefined
    }
    return handleDiff(gitChangeset.value)
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
