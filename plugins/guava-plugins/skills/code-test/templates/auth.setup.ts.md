---
target: e2e/auth.setup.ts
needs: ['@playwright/test']
env: [E2E_BASE_URL, E2E_USERNAME, E2E_PASSWORD, E2E_LOGIN_PATH, E2E_MENU_SELECTOR]
---

登录 setup：运行时探测登录表单 → 提交 → 保存 storageState 供全部用例复用。
失败处理见 fixtures.md §5（验证码 / 多步登录 / 凭据错一律停止上报，禁止绕过）。

提取下方 ```ts 代码块，**逐字**写入 `e2e/auth.setup.ts`（已存在则跳过）。

```ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test as setup } from '@playwright/test';

const authDir = path.join(__dirname, '.auth');
const authFile = path.join(authDir, 'storageState.json');

setup('登录并保存会话', async ({ page }) => {
  const baseURL = process.env.E2E_BASE_URL;
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!baseURL || !username || !password) {
    throw new Error('缺少 E2E_BASE_URL / E2E_USERNAME / E2E_PASSWORD（写入 e2e/.env.e2e 或导出环境变量）');
  }

  const loginPath = process.env.E2E_LOGIN_PATH ?? '/login';
  await page.goto(loginPath, { waitUntil: 'domcontentloaded' });

  // 运行时探测：先定位密码框，再在其所在表单内就近找账号输入框（兼容不同项目登录页结构）
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.waitFor({ state: 'visible', timeout: 15_000 });

  const loginForm = passwordInput.locator('xpath=ancestor::form[1]');
  const scope = (await loginForm.count()) > 0 ? loginForm : page;
  const usernameInput = scope
    .locator('input[name*="user" i]')
    .first()
    .or(scope.locator('input[placeholder*="账号" i]').first())
    .or(scope.locator('input[placeholder*="用户名" i]').first())
    .or(scope.locator('#username').first())
    .or(scope.locator('input:not([type="password"]):not([type="hidden"])').first());

  await usernameInput.fill(username);
  await passwordInput.fill(password);

  // 探测除账号/密码外的必填输入框（如验证码），存在则无法自动化 → 明确报错
  const extraRequired = scope.locator(
    'input:visible:not([type="password"]):not([type="hidden"]):not([name*="user" i]):not([placeholder*="账号" i]):not([placeholder*="用户名" i])'
  );
  if ((await extraRequired.count()) > 0) {
    throw new Error(
      '登录页存在账号/密码之外的输入框（疑似验证码），请人工登录后把 storageState 放入 e2e/.auth/，或提供无验证码测试账号'
    );
  }

  const submit = scope
    .getByRole('button', { name: /登\s*录|login/i })
    .first()
    .or(scope.locator('button[type="submit"]').first());
  await submit.click();

  // 登录成功标记：URL 离开登录页 或 侧边栏菜单渲染
  const menuSelector = process.env.E2E_MENU_SELECTOR ?? '.el-menu';
  const loggedIn = page
    .waitForURL((url) => !url.pathname.includes('login'), { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  const menuShown = page
    .locator(menuSelector)
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  expect(await Promise.race([loggedIn, menuShown]), '登录失败：请检查 E2E_USERNAME / E2E_PASSWORD').toBe(true);

  fs.mkdirSync(authDir, { recursive: true });
  await page.context().storageState({ path: authFile });
});
```
