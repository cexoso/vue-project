# @cexoso/vue-singleton

## 0.0.11

### Patch Changes

- d2e4c03: 添加 retry 能力
- 51aba1e: 提供 refresh 方法，该方法可以主动调用以重新发起请求

## 0.0.10

### Patch Changes

- 9874e54: 兼容 runWithContext api 内调用
- d3196f2: 声明更严格的类型，data 有可能是 undefined 的

## 0.0.9

### Patch Changes

- e2aeb1f: 新增 retain 模式，用于描述在数据变更时应该如何替换旧数据

## 0.0.8

### Patch Changes

- 805cefd: 添加定义资源的 api

## 0.0.7

### Patch Changes

- 321d17b: add withResolvers polyfill

## 0.0.6

### Patch Changes

- eec7cb7: 修复 README 文件名字拼写错误

## 0.0.5

### Patch Changes

- 0f7b24e: 使用 effectScope 来支持在 defined 中使用 effect 能力

## 0.0.4

### Patch Changes

- fb51294: add README.md

## 0.0.3

### Patch Changes

- 3e2f0ac: 导出 createContext 方法

## 0.0.2

### Patch Changes

- ef646e3: 使用 provider 和 inject 的方式来提供上下文，而不再直接使用 app 作为上下文

## 0.0.1

### Patch Changes

- a6d83ee: 支持 ESM
- 0e7703d: 修复文件没有导致的 bug
- 64a3c07: 添加 defined 函数，用于定义 App 级别的单例
