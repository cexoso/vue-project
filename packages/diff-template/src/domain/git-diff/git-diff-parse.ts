import parseGitDiff, { type AnyFileChange, type AnyLineChange } from 'parse-git-diff'
import type { AnyChunk } from 'parse-git-diff'

function handleChanges(changes: AnyLineChange[]) {
  const results: number[] = []
  for (const change of changes) {
    if (change.type === 'AddedLine') {
      results.push(change.lineAfter)
      continue
    }
    if (change.type === 'DeletedLine') {
      continue
    }
    if (change.type === 'UnchangedLine') {
      continue
    }
    if (change.type === 'MessageLine') {
      continue
    }
  }
  return results
}

function handleChunks(chunks: AnyChunk[]) {
  const changes: number[][] = []
  for (const chunk of chunks) {
    if (chunk.type === 'Chunk') {
      changes.push(handleChanges(chunk.changes))
      continue
    }
    if (chunk.type === 'CombinedChunk') {
      changes.push(handleChanges(chunk.changes))
      continue
    }
    if (chunk.type === 'BinaryFilesChunk') {
      continue
    }
  }
  return changes.flat()
}

export type ChangeLines = number[]
type FilePath = string
function handleChangesets(files: AnyFileChange[]): Record<FilePath, ChangeLines> {
  const map: Record<string, ChangeLines> = {}
  for (const file of files) {
    if (file.type === 'AddedFile') {
      map[file.path] = handleChunks(file.chunks)
      continue
    }
    if (file.type === 'ChangedFile') {
      map[file.path] = handleChunks(file.chunks)
      continue
    }
    if (file.type === 'DeletedFile') {
      continue
    }
    if (file.type === 'RenamedFile') {
      map[file.pathAfter] = handleChunks(file.chunks)
      continue
    }
  }
  return map
}

export const handleDiff = (diff: string) => {
  const files = parseGitDiff(diff).files
  const diffData = handleChangesets(files)
  return diffData
}
