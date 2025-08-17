import { defineComponent, onUpdated } from 'vue'
import { ref } from 'vue'
import Prism from 'prismjs'
import { useSourceToken } from './controller'
import 'prismjs/components/prism-typescript'
import 'prismjs/plugins/keep-markup/prism-keep-markup'
import 'prismjs/themes/prism.css'
import './prism-render.css'

export const PrismRender = defineComponent({
  setup() {
    const sourceRef = useSourceToken()
    const codeRef = ref<HTMLElement>()
    onUpdated(() => {
      const code = codeRef.value
      if (code) {
        Prism.highlightElement(code)
      }
    })

    return () => {
      const source = sourceRef.value
      const children = []
      for (const key in source) {
        const block = source[key]
        if (block.type === 'string') {
          children.push(block.payload)
        } else {
          children.push(
            <span title={block.payload.title} class={block.payload.class} key={key}>
              {block.payload.content}
            </span>
          )
        }
      }
      return (
        <pre
          class="language-container special-style"
          style="padding: 0; margin: 0; background-color: var(--color-gray-90)"
        >
          {/* 先暂时使用 key 的方法强迫 vue 强制更新 code */}
          <code ref={codeRef} class="language-typescript keep-markup" key={Math.random()}>
            {children}
          </code>
        </pre>
      )
    }
  },
})
