---
target: e2e/env.d.ts
needs: []
env: [E2E_BASE_URL, E2E_USERNAME, E2E_PASSWORD, E2E_HEADLESS, E2E_LOGIN_PATH, E2E_MENU_SELECTOR]
---

process.env 类型声明（IDE 提示用；Playwright 运行时自身转译 TS，不依赖 tsconfig 包含本目录）。

提取下方 ```ts 代码块，**逐字**写入 `e2e/env.d.ts`（已存在则跳过）。

```ts
declare namespace NodeJS {
  interface ProcessEnv {
    /** 被测系统入口，如 http://localhost:5173 */
    E2E_BASE_URL?: string;
    /** 登录用户名 */
    E2E_USERNAME?: string;
    /** 登录密码 */
    E2E_PASSWORD?: string;
    /** 'false' 时 headed 调试（默认 headless） */
    E2E_HEADLESS?: string;
    /** 登录页路径，默认 /login */
    E2E_LOGIN_PATH?: string;
    /** 侧边栏容器选择器，默认 .el-menu */
    E2E_MENU_SELECTOR?: string;
  }
}
```
