---
target: playwright.config.ts            # 工程根（package.json 同级）
needs: ['@playwright/test', 'dotenv']
env: [E2E_BASE_URL, E2E_HEADLESS]
---

提取下方 ```ts 代码块，**逐字**写入工程根 `playwright.config.ts`（已存在则跳过，见 fixtures.md §1）。

```ts
import * as dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

dotenv.config({ path: ['e2e/.env.e2e', '.env'] });

export default defineConfig({
  testDir: './e2e',
  outputDir: 'e2e/test-results',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // 提速：T1-T3 只读用例文件内并行（fullyParallel），T4 写操作用 test.describe.serial 独占一个 worker
  // 数据敏感场景可 E2E_WORKERS=1 强制全串行
  fullyParallel: true,
  workers: Number(process.env.E2E_WORKERS ?? 3),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    headless: process.env.E2E_HEADLESS !== 'false',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/storageState.json'
      },
      dependencies: ['setup']
    }
  ]
});
```
