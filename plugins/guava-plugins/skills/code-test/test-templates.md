# 测试用例模板（4 类）+ 选择器策略

> 主流程 `SKILL.md` · 用例推导 [derive-testcases.md](derive-testcases.md) · helper API [templates/helpers.ts.md](templates/helpers.ts.md)

spec 骨架：`e2e/<feature>.spec.ts`，4 个 describe 对应 4 类；用例标题用中文（`测试报告`按标题聚合）；数据一律 `uniqueTag()` fixture；每条用例收尾 `expectNoConsoleErrors(consoleErrors)`。

```ts
import { test, expect } from './fixtures';
import {
  clickMenu,
  clickButton,
  gvInputByLabel,
  selectOptionByText,
  formItemError,
  openRowAction,
  expectNoConsoleErrors
} from './helpers';

const menuPath = ['系统管理', '用户管理']; // 全部来自用例清单 manifest，禁止凭记忆写业务文案
```

---

## 0. 选择器策略（优先级从高到低）

| 级 | 选择器 | 适用 |
| --- | --- | --- |
| 1 | `getByRole('button', { name })` / `getByRole('dialog')` / `getByLabel` / `getByPlaceholder` | 按钮、菜单、带 label 关联的输入（Gv* 底层渲染 el-*，label 关联标准） |
| 2 | `getByText`（菜单、页头、成功提示） | 纯文本目标 |
| 3 | 结构 CSS：`.el-form-item`、`.el-table__row`、`.el-form-item__error` | helper 内封装（`gvInputByLabel` / `formItemError` / `openRowAction`），spec 不直接写裸 CSS |
| 4 | `data-testid` | 不要求；运行中 flaky → 报告建议业务补 `data-testid`，**不改业务源码** |

**禁止**：依赖 CSS module hash 类名、绝对 xpath、`(//div[3])` 式脆弱下标。

---

## T1 菜单导航

`clickMenu(page, menuPath)` 逐层点击 → 断言落地页：

```ts
test('菜单导航：系统管理/用户管理', async ({ page, consoleErrors }) => {
  await clickMenu(page, menuPath);
  await expect(page).toHaveURL(/userMng|UserMng/);           // 路由片段；无法推断时改用页头断言
  await expect(page.getByText('用户管理', { exact: true }).first()).toBeVisible(); // 页头
  await expect(page.locator('.el-table, .el-form').first()).toBeVisible();        // 骨架渲染
  expectNoConsoleErrors(consoleErrors);
});
```

- 路由不可推断（无 md 实况探测）→ 只断言页头 + 骨架 + 无 console error
- 菜单超过 2 层 / 需展开分组：`clickMenu` 内部已处理展开等待

## T2 按钮可用性

按 manifest `buttons` 逐个生成。**只验证"点击后有可观察反应"**，不深入业务正确性（深入断言归 T4）：

```ts
test('按钮：新增 打开对话框', async ({ page, consoleErrors }) => {
  await clickMenu(page, menuPath);
  await page.getByRole('button', { name: '新增' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('新增用户')).toBeVisible();     // manifest dialogTitle
  expectNoConsoleErrors(consoleErrors);
});

test('按钮：查询 触发列表请求', async ({ page, consoleErrors }) => {
  await clickMenu(page, menuPath);
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/list') && r.request().method() === 'POST'),
    page.getByRole('button', { name: '查询' }).click(),
  ]);
  expect(response.status()).toBe(200);
  expectNoConsoleErrors(consoleErrors);
});

test('按钮：导出 触发下载', async ({ page }) => {
  await clickMenu(page, menuPath);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '导出' }).click(),
  ]);
  expect(download.suggestedFilename().length).toBeGreaterThan(0); // v1 不解析内容
});
```

- 行级按钮（编辑/删除）：**只对 T4 自建记录**操作——顺序依赖用 `test.describe.serial` 或在同一文件内按序执行，T2 行级用例放到 T4 之后执行
- 超出 `$AUTH_SCOPE` 的按钮 → 不生成用例，报告标注
- 重置：断言查询输入清空（`toHaveValue('')`）+ 表格重新请求

## T3 输入校验

编辑表单（容器已由 T2"新增"用例打开过的逻辑复用；每条用例自包含重新打开）：

```ts
test('校验：用户名必填', async ({ page }) => {
  await clickMenu(page, menuPath);
  await page.getByRole('button', { name: '新增' }).click();
  await clickButton(page, '保存');                            // 容忍 el-button 文本插值空格（「保 存」）
  await expect(formItemError(page, '用户名')).toHaveText('请输入用户名'); // manifest message
});

test('校验：手机号格式', async ({ page }) => {
  await clickMenu(page, menuPath);
  await page.getByRole('button', { name: '新增' }).click();
  await gvInputByLabel(page, '手机号').fill('abc');
  await gvInputByLabel(page, '手机号').blur();                 // manifest trigger = blur
  await expect(formItemError(page, '手机号')).toHaveText('手机号格式不正确');
  await gvInputByLabel(page, '手机号').fill('13800138000');
  await expect(formItemError(page, '手机号')).toBeHidden();    // 合法值错误消除
});
```

- 规则来源 manifest `validations`；错误文案以 Vue 源码 rules 为准
- 触发方式：blur 用 `.blur()`；change 用填完切换焦点或显式 dispatch
- 查询条件有必填校验时同法生成 `queryValidations` 用例

## T4 保存/修改逻辑

`test.describe.serial`（数据在用例间传递），全程 `uniqueTag()` 数据 + `registerCleanup`：

```ts
test.describe.serial('保存/修改', () => {
  let recordName: string;

  test('新增保存成功并列表可见', async ({ page, uniqueTag, registerCleanup, consoleErrors }) => {
    recordName = `${uniqueTag()}_用户`;
    await clickMenu(page, menuPath);
    await page.getByRole('button', { name: '新增' }).click();
    await gvInputByLabel(page, '用户名').fill(recordName);
    // …按 manifest createFields 填满（下拉用 selectOptionByText）
    await clickButton(page, '保存');
    await expect(page.getByText('保存成功')).toBeVisible();    // manifest successMessage
    await gvInputByLabel(page, '用户名').fill(recordName);     // 查询条件回填再搜
    await clickButton(page, '查询');
    await expect(page.locator('.el-table__row', { hasText: recordName })).toBeVisible();
    registerCleanup(async (p) => {                              // p = page，teardown 时复用
      await clickMenu(p, menuPath);
      await openRowAction(p, recordName, '删除');
      await p.getByRole('button', { name: '确定' }).click();    // 删除确认
    });
    expectNoConsoleErrors(consoleErrors);
  });

  test('修改已保存记录', async ({ page }) => {
    const newName = `${recordName}_改`;
    await clickMenu(page, menuPath);
    await openRowAction(page, recordName, '编辑');
    await gvInputByLabel(page, '用户名').fill(newName);
    await clickButton(page, '保存');
    await expect(page.getByText('保存成功')).toBeVisible();
    await gvInputByLabel(page, '用户名').fill(newName);
    await clickButton(page, '查询');
    await expect(page.locator('.el-table__row', { hasText: newName })).toBeVisible();
    recordName = newName;                                       // cleanup 删改名后的记录
  });

  test('必填缺失保存被阻断', async ({ page }) => {
    await clickMenu(page, menuPath);
    await openRowAction(page, recordName, '编辑');
    await gvInputByLabel(page, '用户名').fill('');
    await clickButton(page, '保存');
    await expect(page.getByRole('dialog')).toBeVisible();      // 对话框未关闭
    await expect(formItemError(page, '用户名')).toBeVisible(); // 有校验错误
    await expect(page.getByText('保存成功')).toBeHidden();     // 无成功提示
  });
});
```

- **校验阻断断言三件套**：容器未关闭 + 错误提示可见 + 无成功提示（可再加 `waitForResponse` 取反：保存请求未发出）
- 修改用例改的是**本 describe 自建记录**，天然在 `own-only` 范围内
- `registerCleanup` 注册的删除在每条用例 teardown 执行；`afterAll` 追加残留扫描：

```ts
test.afterAll(async ({ browser }) => {
  const page = await (await browser.newContext({ storageState: 'e2e/.auth/storageState.json' })).newPage();
  await clickMenu(page, menuPath);
  // 搜索 E2E_ 前缀，逐行删除；删不掉的记录名记入残留清单（报告输出）
  await page.context().close();
});
```

---

## 生成注意事项

- spec 顶部常量（menuPath / 按钮名 / 文案）全部来自 manifest，**禁止凭记忆写业务文案**
- 下拉选择：`selectOptionByText(page, label, optionText)`（helper 内 `el-select` 点击 + `el-select-dropdown__item` 文本选择）；日期用 `el-date-editor` input fill
- 每个 expect 前自动等待由 Playwright 断言重试承担，不手写 `waitForTimeout`（固定 sleep 禁止；确需等待用 `expect(...).toBeVisible()` 或 `waitForResponse`）
- 失败截图 / trace 由 config 的 `screenshot: 'only-on-failure'` / `trace: 'retain-on-failure'` 自动产出，报告引用 `e2e/test-results/` 路径
- **并行安全**（workers 以工程 `playwright.config.ts` 为准，模板默认 5）：T1–T3 describe 之间禁止传递状态、禁止共用自建数据（各自重新导航、各自打开表单）；写操作只在 T4 `describe.serial` 内，且只操作本 describe 自建记录

## 测试数据构造（全自动，无需人工准备）

新增 / 修改用例的数据一律由 `uniqueTag()` 前缀 + 下表按字段类型自动构造，构造依据是 manifest 的组件类型与校验规则（required / length / pattern）：

| 字段类型 | 合法值构造 |
| --- | --- |
| 文本 / 名称 | `{tag}_用户`（tag = uniqueTag()） |
| 手机号 / 邮箱 | 过 pattern 的随机值：`138` + 8 位数字、`{tag}@test.local` |
| 数字 / 金额 | 校验允许范围内的随机值 |
| 下拉 / 字典 / 关联选择 | `selectOptionByText` 打开真实下拉选**第一项**（选项来自接口，不自造关联数据） |
| 日期 | 当天 |
| 长度限制 | 按 max 截断、按 min 补足 |
| 唯一索引字段 | 值内必含 `{tag}`，天然唯一 |

T3 非法值反向构造：必填 → 留空；pattern → 违例值；length → 超长。

**构造失败处理**：按规则推不出合法值（复杂业务约束）→ 用例照常生成，运行失败时报告标注「测试数据构造失败：字段 + 规则」，由人工补一个合法样例后再重跑，禁止 agent 静默改需求或放宽校验。
