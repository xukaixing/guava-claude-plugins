# e2e/ 脚手架规范（幂等引导）

> 主流程 `SKILL.md` Step 2 · 模板 [templates/](templates/)（每个模板一个 md，内含目标路径与逐字代码块）

在消费项目 `${CLAUDE_PROJECT_DIR}` 下维护 Playwright 测试环境。**核心原则：脚手架只建一次，绝不被测试任务覆盖**（用户可能已定制）。

---

## 1. 落盘文件总览

| 消费项目文件 | 来源模板 | 存在时 |
| --- | --- | --- |
| `playwright.config.ts` | [templates/playwright.config.ts.md](templates/playwright.config.ts.md) | **跳过** |
| `e2e/auth.setup.ts` | [templates/auth.setup.ts.md](templates/auth.setup.ts.md) | **跳过** |
| `e2e/fixtures.ts` | [templates/fixtures.ts.md](templates/fixtures.ts.md) | **跳过** |
| `e2e/helpers.ts` | [templates/helpers.ts.md](templates/helpers.ts.md) | **跳过** |
| `e2e/env.d.ts` | [templates/env.d.ts.md](templates/env.d.ts.md) | **跳过** |
| `e2e/progress-reporter.ts` | [templates/progress-reporter.ts.md](templates/progress-reporter.ts.md) | **跳过** |
| `e2e/.env.e2e` | 无模板，按 key 追加（见 §3） | 缺 key 才追加，不覆盖已有值 |
| `e2e/<feature>.spec.ts` | 用例模板生成（test-templates.md） | **整文件覆盖重写** |

提取规则：Read 模板 md → 取其中 ```ts 围栏代码块 → **逐字** Write 到目标路径（代码块内容即文件全文，禁止改写、美化、增删）。模板 frontmatter 标注目标路径与 env 契约。

## 2. 依赖与安装

检查 `package.json`：

- 缺 `@playwright/test` → `pnpm add -D @playwright/test dotenv && pnpm exec playwright install chromium`
- 已有则跳过安装（**不要**重复 `playwright install`，版本不匹配时报错再处理）

playwright.config.ts 在工程根（与 package.json 同级）；`testDir: './e2e'`；只跑 chromium。**并行策略**：`workers` 由 `E2E_WORKERS` 驱动（默认 5）——T1–T3 只读用例并行安全，T4 写操作用例用 `test.describe.serial` 独占一个 worker；数据相互干扰时用 `E2E_WORKERS=1` 全串行。

> **旧配置升级**：既有工程的 `playwright.config.ts` 是脚手架（绝不自动覆盖），若仍是 `workers: 1` / `workers ?? 3` 硬编码，或 reporter 未注册 `./e2e/progress-reporter.ts`，在报告"改进建议"里提示用户手动改为 `workers: Number(process.env.E2E_WORKERS ?? 5)` 并在 reporter 数组追加 `'./e2e/progress-reporter.ts'`（文件本身从模板补齐）。

## 3. 凭据契约（env）

| env key | 说明 | 必填 |
| --- | --- | --- |
| `E2E_BASE_URL` | 被测系统入口 | ✅ |
| `E2E_USERNAME` / `E2E_PASSWORD` | 登录账号 | ✅ |
| `E2E_HEADLESS` | `false` 时 headed 调试（默认 headless） | 可选 |
| `E2E_LOGIN_PATH` | 登录页路径，默认 `/login` | 可选 |
| `E2E_MENU_SELECTOR` | 侧边栏容器选择器，默认 `.el-menu` | 可选 |

- 来源优先级：`process.env`（导出 / CI 注入）→ `e2e/.env.e2e`（dotenv 在 config 里加载）
- 便捷方式：把 URL/账号写进工程根 `e2e.test.md`（模板 [config-template.md](config-template.md)），SKILL.md Step 1.0 会解析并注入 `e2e/.env.e2e`（只追加缺失 key）；密码推荐写 `${E2E_PASSWORD}` 引用环境变量
- `.env.e2e` 写入格式 `KEY=value`，**只追加缺失 key**；若用户已有同 key 但值是占位符（如 `xxx` / `TODO`）→ 用真实值覆盖并告知
- **禁止**：凭据进 spec / helper / 报告 / 任何会被提交的文件（`e2e/.env.e2e` 必须 gitignore；含真实凭据的 `e2e.test.md` 同样必须 gitignore）

## 4. .gitignore 与登录产物

检查工程根 `.gitignore`，缺失则追加：

```gitignore
e2e/.auth/
e2e/.env.e2e
```

`e2e/.auth/storageState.json` 由 auth.setup 产出（含登录态 cookie/token），同样不得入库。

## 5. 登录冒烟（Step 2 收尾）

```bash
cd ${CLAUDE_PROJECT_DIR} && pnpm exec playwright test --project=setup
```

- 通过 → 继续 Step 3
- 失败分类：
  - 选择器 / 登录路径不符 → 用 env 覆盖（`E2E_LOGIN_PATH` / `E2E_MENU_SELECTOR`）重试 1 次
  - 验证码 / 短信 / 扫码 / 多步登录 → **停止**，如实上报主 agent 转问用户（人工完成一次登录后导出 storageState 放入 `e2e/.auth/`，或提供可绕过验证码的测试账号）
  - 账号密码错（401 / 错误提示）→ 停止，上报主 agent 核对凭据
- 禁止绕过登录（直接构造 token / 跳过 setup project）——测试目标是真实系统真实流程

## 6. 二次运行的幂等性

同一工程再次执行任意功能的测试时：

1. §1 五件套全部已存在 → 全部跳过（包括 `.env.e2e` 已有真实值时）
2. 登录态 `storageState.json` 已存在且未过期 → setup project 仍会重跑（auth.setup 幂等：已登录则直接复用会话保存），失败处理同 §5
3. 只重写 `e2e/<feature>.spec.ts`

> **版本漂移**：用户升级插件后模板可能有新版本，但已有脚手架绝不自动升级——差异在报告"改进建议"里提示用户手动对比即可。
