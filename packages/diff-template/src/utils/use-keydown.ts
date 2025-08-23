import { onMounted, onUnmounted } from 'vue'

export const useKeydown = (keyCode: string, keydownHandle: () => void) => {
  const innerKeyDownHandle = (event: KeyboardEvent) => {
    if (event.code === keyCode) {
      keydownHandle()
    }
  }
  onMounted(() => {
    window.addEventListener('keydown', innerKeyDownHandle)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', innerKeyDownHandle)
  })
}
