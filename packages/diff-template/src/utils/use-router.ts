import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'

// 保证已有参数不变，仅改变或者添加参数
export const useChangeQuery = () => {
  const route = useRoute()
  const router = useRouter()
  return (queries: RouteLocationNormalizedLoaded['query'], opts?: { isReplace?: boolean }) => {
    return router[opts?.isReplace ? 'replace' : 'push']({
      query: {
        ...route.query,
        ...queries,
      },
    })
  }
}

const useChangeRoute = () => {
  const route = useRoute()
  const router = useRouter()
  return (isReplace = true) =>
    // 更改路由的时候，允许保留指定的参数
    (newRoute: Partial<RouteLocationNormalizedLoaded>, opts?: { keepQuery?: string[] }) => {
      const emptyQuery: RouteLocationNormalizedLoaded['query'] = {}
      const keepQueries =
        opts?.keepQuery?.reduce(
          (acc, item) => Object.assign(acc, { [item]: route.query[item] }),
          emptyQuery
        ) ?? emptyQuery
      return router[isReplace ? 'replace' : 'push']({
        ...newRoute,
        query: {
          ...newRoute.query,
          ...keepQueries,
        },
      })
    }
}

export const usePush = () => {
  const changeRoute = useChangeRoute()
  return changeRoute(false)
}
export const useReplace = () => {
  const changeRoute = useChangeRoute()
  return changeRoute(true)
}
