import type { CodeRanger } from '../../../type'

type IndexOf = number

export class SourceHelper {
  private lineStarts: IndexOf[] = []
  constructor(private source: string) {
    let fromIndex = 0
    this.lineStarts.push(0)
    while (true) {
      const indexOf = source.indexOf('\n', fromIndex)
      if (indexOf === -1) {
        break
      }
      const firsrChatOfLineIndex = indexOf + 1
      this.lineStarts.push(firsrChatOfLineIndex)
      fromIndex = firsrChatOfLineIndex
    }
  }

  getSnippet(block: CodeRanger): string {
    const start = this.getIndexOf(block.start.line, block.start.column)
    const end = this.getIndexOf(block.end.line, block.end.column)
    return this.getSnippetByIndex(start, end + 1)
  }
  private getSnippetByIndex(startIndex: number, endIndex: number) {
    return this.source.slice(startIndex, endIndex)
  }
  public getIndexOf(line: number, column: number) {
    return this.lineStarts[line - 1] + column - 1
  }
  getEndPosition() {
    const lastLineStartNumber = this.lineStarts.length - 1
    return {
      column: this.source.length - this.getIndexOf(lastLineStartNumber, 1),
      line: this.lineStarts.length - 1,
    }
  }
}
