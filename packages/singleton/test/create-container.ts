let div: HTMLDivElement | undefined
export const createContainer = () => {
  if (div !== undefined) {
    clean()
  }
  div = document.createElement('div')
  return div
}

export const clean = () => {
  if (div) {
    const parent = div.parentElement
    parent?.removeChild(div)
  }
}
