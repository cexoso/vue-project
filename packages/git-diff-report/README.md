# @cexoso/git-diff-report

一个 Istanbul coverage reporter，**只展示 git diff 范围内的未覆盖代码块**，帮助你在 Code Review 时快速聚焦新增/修改代码的测试覆盖情况。

## 安装

```bash
npm install @cexoso/git-diff-report --save-dev
# 或
pnpm add @cexoso/git-diff-report -D
```

## 配置（Vitest）

在 `vite.config.ts` 中配置 coverage reporter：

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        // 使用 git-diff-report 作为自定义 reporter
        [require.resolve('@cexoso/git-diff-report'), {}],
      ],
    },
  },
})
```

运行覆盖率：

```bash
vitest run --coverage
```

## 配置（Jest）

在 `jest.config.js` 中：

```javascript
module.exports = {
  coverageReporters: [
    'text',
    [require.resolve('@cexoso/git-diff-report'), {}],
  ],
}
```

## 配置（nyc）

在 `.nycrc` 中：

```json
{
  "reporter": [
    "text",
    "@cexoso/git-diff-report"
  ]
}
```

## 对比分支配置

### 自动检测（推荐）

**无需任何配置**，工具会自动检测以下环境变量并使用对应分支作为对比目标：

| 优先级 | 环境变量 | 适用场景 |
|--------|----------|----------|
| 1（最高）| `git_diff_target` | 手动指定（兜底方案）|
| 2 | `GITHUB_BASE_REF` | GitHub Actions PR |
| 3 | `CI_MERGE_REQUEST_TARGET_BRANCH_NAME` | GitLab CI MR |

每次运行时会在 stderr 输出提示，例如：

```
[git-diff-report] 对比分支: main (来源: GitHub Actions (GITHUB_BASE_REF))
```

若未找到任何环境变量：

```
[git-diff-report] 未配置对比分支，将生成全量覆盖率报告
```

### GitHub Actions 自动集成

在 GitHub Actions 的 Pull Request 流程中，`GITHUB_BASE_REF` 会自动设置为目标分支，**无需额外配置**：

```yaml
# .github/workflows/test.yml
name: Test
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整 git 历史才能计算 diff
      - run: pnpm install
      - run: pnpm vitest run --coverage
```

### GitLab CI 自动集成

在 GitLab CI 的 Merge Request 流程中，`CI_MERGE_REQUEST_TARGET_BRANCH_NAME` 会自动设置，**无需额外配置**：

```yaml
# .gitlab-ci.yml
test:
  stage: test
  script:
    - pnpm install
    - pnpm vitest run --coverage
  only:
    - merge_requests
```

### 手动配置（兜底）

若自动检测不满足需求，可通过 `git_diff_target` 手动指定：

```bash
# 与 main 分支对比
git_diff_target=main vitest run --coverage

# 与上一个 commit 对比
git_diff_target=HEAD~1 vitest run --coverage

# 与指定 commit hash 对比
git_diff_target=abc1234 vitest run --coverage
```

> [!NOTE]
> `git_diff_target` 的优先级最高，设置后会覆盖 CI 平台的自动检测结果。

## 运行时提示说明

工具运行时会始终在 stderr 输出对比信息，用于确认本次报告的对比范围：

- `[git-diff-report] 对比分支: <branch> (来源: <source>)` — 成功检测到对比分支
- `[git-diff-report] 未配置对比分支，将生成全量覆盖率报告` — 未检测到任何配置，退化为全量覆盖率

这些提示不会影响覆盖率数据，仅用于调试和确认。

## 完整示例

以 Vitest + GitHub Actions 为例，完整配置如下：

**`vite.config.ts`：**

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        [require.resolve('@cexoso/git-diff-report'), {}],
      ],
    },
  },
})
```

**`.github/workflows/test.yml`：**

```yaml
name: Test
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm vitest run --coverage
```

提交 PR 后，CI 会自动用 `GITHUB_BASE_REF` 作为对比分支，只展示本次 PR 改动范围内的未覆盖代码。
