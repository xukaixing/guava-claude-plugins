---
target: e2e/fixtures.ts
needs: ['@playwright/test']
env: []
---

扩展 test：console error 收集 / uniqueTag 唯一数据前缀 / registerCleanup 清理注册（teardown 逆序执行）。

提取下方 ```ts 代码块，**逐字**写入 `e2e/fixtures.ts`（已存在则跳过）。spec 一律 `import { test, expect } from './fixtures'`，不用 @playwright/test 的原始 test。

```ts
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** 清理函数：teardown 时传入用例页面执行（如删除自建记录） */
export type CleanupFn = (page: Page) => Promise<void>;

interface GuavaTestFixtures {
  /** 收集本轮用例的 console error（未捕获异常一并计入） */
  consoleErrors: string[];
  /** 本轮用例唯一数据前缀：E2E_<时间戳>_<随机>（真实环境只写自建数据） */
  uniqueTag: () => string;
  /** 注册清理函数：用例结束（含失败）后逆序执行，单个失败不阻断其余清理 */
  registerCleanup: (fn: CleanupFn) => void;
}

export const test = base.extend<GuavaTestFixtures>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', (error) => errors.push(String(error)));
    await use(errors);
  },

  uniqueTag: async (_, use) => {
    const tag = `E2E_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    await use(() => tag);
  },

  registerCleanup: async ({ page }, use) => {
    const fns: CleanupFn[] = [];
    await use((fn) => {
      fns.push(fn);
    });
    for (const fn of fns.reverse()) {
      try {
        await fn(page);
      } catch (error) {
        // 清理失败不阻断测试，但会出现在 stdout；残留需报告列出
        console.warn(`[e2e] 清理失败（需人工处理）: ${String(error)}`);
      }
    }
  }
});

export { expect };
```
