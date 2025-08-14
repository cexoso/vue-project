import { computed, ComputedRef, onUnmounted, shallowRef, watchEffect } from 'vue'
import { define } from './define-singleton'

type Result<T> = Promise<T | undefined> | undefined
interface Options {
  lazy?: boolean
  interval?: number
}

// 错误的原因不一定是 error, 这个要交给业务自己去判断
type REASON = unknown

// define 如果只能在 setup 中使用，基于可以把 RC 内置，让定义数据源的人可以直接使用 RC 来决定做某事

export function defineResource<T>(
  promiseComputedCreator: () => () => Result<T>,
  opts?: Options
): () => {
  data: ComputedRef<T>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<REASON>
} {
  // 绑定到 application
  const useController = define(() => {
    let data = shallowRef<T | undefined>(undefined)
    let isLoading = shallowRef(false)
    let error = shallowRef<REASON>(undefined)
    const promiseComputed = promiseComputedCreator()

    const requestAndHandle = async (opts: {
      // 静默更新，不是由人或者业务主动触发的更新，而是由 SWR 事件触发的更新为静默更新
      // 静默更新不会触发 isLoading true，仅会在拉取到新数据后直接替换掉数据
      silent: boolean
    }) => {
      const silent = opts.silent
      if (!silent) {
        isLoading.value = true
      }

      Promise.resolve(promiseComputed())
        .then(
          (result) => {
            data.value = result
          },
          (reason: unknown) => {
            if (!silent) {
              error.value = reason
            }
          }
        )
        .finally(() => {
          isLoading.value = false
        })
    }

    watchEffect(() => {
      requestAndHandle({ silent: false })
    }, {})
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    const loop = (interval: number) => {
      timeoutHandle = setTimeout(() => {
        requestAndHandle({ silent: true }).finally(() => {
          loop(interval)
        })
      }, interval)
    }
    let rc = 0

    const startIntervalIfNeed = (interval: number | undefined) => {
      if (rc === 0) {
        if (interval !== undefined && interval !== 0) {
          loop(interval)
        }
      }
      rc += 1
    }
    const stopIntervalIfNeed = () => {
      rc -= 1
      if (rc === 0) {
        clearTimeout(timeoutHandle)
      }
    }

    return { data, isLoading, error, startIntervalIfNeed, stopIntervalIfNeed }
  })

  const useData = () => {
    const { data, isLoading, error, startIntervalIfNeed, stopIntervalIfNeed } = useController()
    // 当组件产生依赖时， RC 加1
    startIntervalIfNeed(opts?.interval)
    onUnmounted(() => {
      // 当组件卸载时， RC 减1
      stopIntervalIfNeed()
    })

    // 这个必须在 setup 中使用
    return {
      data: computed(() => {
        return data.value
      }),
      isLoading: computed(() => {
        return isLoading.value
      }),
      error: computed(() => {
        return error.value
      }),
    }
  }
  return useData
}
