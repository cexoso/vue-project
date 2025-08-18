import type { CoverageData } from '../type'

export const GCMMock = (): {
  coverageData: CoverageData
  diff: string
  metaInfo: { projectInfo: string }
} => ({
  diff: "diff --git a/src/a.ts b/src/a.ts\nnew file mode 100644\nindex 0000000..e1fa428\n--- /dev/null\n+++ b/src/a.ts\n@@ -0,0 +1,6 @@\n+export const add = (a: number, b: number) => {\n+  if (Math.random() > 0.999) {\n+    return a * b\n+  }\n+  return a + b\n+}\ndiff --git a/test/new.spec.ts b/test/new.spec.ts\nnew file mode 100644\nindex 0000000..d41df4b\n--- /dev/null\n+++ b/test/new.spec.ts\n@@ -0,0 +1,8 @@\n+import { expect } from 'chai'\n+import { add } from '../src/a'\n+import '../index'\n+describe('example', () => {\n+  it('add', () => {\n+    expect(add(1, 2)).eq(3)\n+  })\n+})",
  coverageData: {
    'a.ts': {
      coverage: {
        path: '/Users/xiongjie/project/aes-gcm/src/a.ts',
        statementMap: {
          '0': { start: { line: 1, column: 19 }, end: { line: 6, column: 1 } },
          '1': { start: { line: 2, column: 2 }, end: { line: 4, column: null } },
          '2': { start: { line: 3, column: 4 }, end: { line: 3, column: null } },
          '3': { start: { line: 5, column: 2 }, end: { line: 5, column: null } },
          '4': { start: { line: 1, column: 13 }, end: { line: 1, column: 19 } },
        },
        fnMap: {
          '0': {
            name: '(anonymous_0)',
            decl: { start: { line: 1, column: 19 }, end: { line: 1, column: 20 } },
            loc: { start: { line: 1, column: 44 }, end: { line: 6, column: 1 } },
          },
        },
        branchMap: {
          '0': {
            loc: { start: { line: 2, column: 2 }, end: { line: 4, column: null } },
            type: 'if',
            locations: [
              { start: { line: 2, column: 2 }, end: { line: 4, column: null } },
              { start: { line: 2, column: 2 }, end: { line: 4, column: null } },
            ],
          },
        },
        s: { '0': 1, '1': 1, '2': 0, '3': 1, '4': 1 },
        f: { '0': 1 },
        b: { '0': [0, 1] },
      },
      source:
        'export const add = (a: number, b: number) => {\n  if (Math.random() > 0.999) {\n    return a * b\n  }\n  return a + b\n}\n',
    },
  },
  metaInfo: { projectInfo: 'src' },
})
