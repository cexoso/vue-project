const parentWindow = window.parent
// 将 test ui 隐藏，我们关注的是用例的 UI
const ui = parentWindow.document.getElementById('vitest-ui')
if (ui) {
  ui.style.display = 'none'
}

const style = parentWindow.document.createElement('style')
style.innerText = `
  #vitest-tester iframe {
    height: 100vh !important;
    width: 100vw !important;
  }
  vite-error-overlay {
    opacity: 0;
    pointer-events: none;
  }
`
parentWindow.document.head.appendChild(style)
