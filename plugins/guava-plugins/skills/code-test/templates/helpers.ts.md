---
target: e2e/helpers.ts
needs: ['@playwright/test']
env: [E2E_MENU_SELECTOR]
---

Gv*/el-* 选择器 helper：菜单导航、按 label 定位表单项、行内操作、console error 断言。
选择器优先级见 test-templates.md §0；spec 不直接写裸 CSS（本文件是唯一出口）。

提取下方 ```ts 代码块，**逐字**写入 `e2e/helpers.ts`（已存在则跳过）。

```ts
import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

/** 侧边栏容器选择器（可用 E2E_MENU_SELECTOR 覆盖） */
const menuSelector = (): string => process.env.E2E_MENU_SELECTOR ?? '.el-menu';

/**
 * 按菜单路径逐层点击侧边栏，自动等待展开与加载。
 * @param page 页面
 * @param menuPath 菜单文本路径，如 ['系统管理', '用户管理']
 */
export const clickMenu = async (page: Page, menuPath: string[]): Promise<void> => {
  for (const title of menuPath) {
    await page
      .locator(menuSelector())
      .getByText(title, { exact: true })
      .first()
      .click();
    await page.waitForLoadState('networkidle');
  }
};

/**
 * 按 label 定位表单输入项（Gv* 底层渲染 el-form-item，label 与控件标准关联）。
 * 查询区与编辑容器字段都可定位；页面同时存在两个同名 label 时用 formScope 限定。
 */
export const gvInputByLabel = (page: Page, label: string, formScope?: Locator): Locator =>
  (formScope ?? page.locator('body'))
    .locator('.el-form-item', { hasText: label })
    .locator('input, textarea')
    .first();

/** 按 label 定位下拉选择（el-select）。 */
export const gvSelectByLabel = (page: Page, label: string, formScope?: Locator): Locator =>
  (formScope ?? page.locator('body')).locator('.el-form-item', { hasText: label }).locator('.el-select').first();

/** 打开下拉并按选项文本选择。 */
export const selectOptionByText = async (page: Page, label: string, optionText: string): Promise<void> => {
  await gvSelectByLabel(page, label).click();
  await page.locator('.el-select-dropdown__item', { hasText: optionText }).first().click();
};

/** 表单字段的错误提示（.el-form-item__error）。 */
export const formItemError = (page: Page, label: string, formScope?: Locator): Locator =>
  (formScope ?? page.locator('body'))
    .locator('.el-form-item', { hasText: label })
    .locator('.el-form-item__error')
    .first();

/** 点击工具栏按钮（容忍 el-button 文本插值空格，如「保 存」）。 */
export const clickButton = async (page: Page, name: string): Promise<void> => {
  await page.getByRole('button', { name: new RegExp(name.split('').join('\\s*')) }).first().click();
};

/**
 * 在行内按操作名点击（编辑/删除等），自动等待行渲染。
 * @param rowText 行内任意唯一文本（通常是 uniqueTag 生成的名称）
 */
export const openRowAction = async (page: Page, rowText: string, action: string): Promise<void> => {
  const row = page.locator('.el-table__row', { hasText: rowText }).first();
  await row.waitFor({ state: 'visible', timeout: 10_000 });
  await row.getByRole('button', { name: new RegExp(action.split('').join('\\s*')) }).click();
};

/**
 * 断言本轮无 console error。
 * @param ignorePatterns 已知良性报错过滤（如 favicon 404、第三方 SDK 埋点），生成 spec 时按项目实际填写
 */
export const expectNoConsoleErrors = (errors: string[], ignorePatterns: RegExp[] = []): void => {
  const rest = errors.filter((msg) => !ignorePatterns.some((re) => re.test(msg)));
  expect(rest, `console errors: ${rest.join(' | ')}`).toEqual([]);
};
```
