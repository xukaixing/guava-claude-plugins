---
name: code-test
description: >
  自动化功能测试：对指定功能（src/pages/<feature>.md 或功能名/菜单路径）执行 Playwright 浏览器
  测试——菜单导航、按钮可用性、输入校验、保存/修改逻辑。测试代码落在消费项目 e2e/ 可复跑，
  凭据走 env，真实环境写操作只触碰自建数据。由 guava-test agent 调度执行（Phase A subagent +
  Phase B 主 agent），勿与其他 skill 混载。
disable-model-invocation: true
---

# code-test

> [derive-testcases.md](derive-testcases.md) · [test-templates.md](test-templates.md) · [fixtures.md](fixtures.md) · [bug-report.md](bug-report.md) · [templates/](templates/) · [config-template.md](config-template.md)

**职责**：为指定功能推导用例、生成 Playwright spec、执行测试并产出报告与 bug 台账。
**不做**：路由、git、修改业务源码（`e2e/` 与 `.gitignore` 追加除外）。

**执行者分段**（guava-test agent 调度，见 agents/guava-test.md Step 3）：

- **Phase A（subagent 执行 Step 1–4）**：解析配置、环境引导、推导用例清单、生成 spec；结束返回 manifest 摘要（各类用例数）、spec 路径、环境就绪状态
- **Phase B（guava-test agent 亲自执行 Step 5–7）**：Playwright 用 Bash 前台跑（list reporter 逐条用例结果实时可见），失败迭代、清理、报告与 bug 台账落盘；每完成一个里程碑先向用户输出一行进度（环境就绪 / 用例清单 N 条 / spec 已生成 / 第 X 轮：通过 N 失败 M / 报告已落盘）

---

## 参数

| 来源 | 参数 | 说明 | 必填 |
| --- | --- | --- | --- |
| `$ARGS` | `功能` | `src/pages/<feature>.md` 路径 / 功能名 / 菜单路径文本 | ✅ |
| `$ARGS` | `系统 URL` / `用户名` / `密码` | 由 guava-test agent 解析注入（命令行 > 测试配置 md > 询问），只写入 `e2e/.env.e2e` | ✅ |
| `$ARGS` | `测试配置 md 路径` | 如 `e2e.test.md`（agent 自动发现时给出）；frontmatter 的环境字段合并进 `$ARGS` | 可选 |
| `$SCOPE` | 用例类别 | `menu` / `buttons` / `validations` / `crud` 子集，缺省全量 | 可选 |
| `$AUTH_SCOPE` | 授权范围 | `own-only`（默认，仅自建数据）/ `preset`（允许触碰预置数据）/ 逐条确认清单 | ✅ |

## 安全红线

1. **凭据只进 `e2e/.env.e2e`**（gitignored），禁止出现在 spec / helper / 报告里
2. **写操作只触碰自建数据**（唯一前缀 `E2E_<ts>_`）；超出 `$AUTH_SCOPE` 的用例**跳过并在报告标注**，禁止擅自扩大范围
3. 删除类用例只对自建记录执行；清理失败残留必须在报告中如实列出
4. 不改 `src/` 业务源码；选择器不稳定只在报告里建议补 `data-testid`

---

## 执行流程

### Step 0：准备（一次性读取）

**工作流文档一次性读取**：动手前在**一条消息内**并行 Read 本任务涉及的全部工作流文档——`SKILL.md`、[derive-testcases.md](derive-testcases.md)、[test-templates.md](test-templates.md)、[fixtures.md](fixtures.md)、[bug-report.md](bug-report.md)、[templates/](templates/) 下全部模板；生成过程中直接复用已读内容，**禁止二次 Read**（仅当上下文压缩导致内容丢失时才允许重读个别文件）。

### Step 1：定位 feature（Phase A）

**1.0 测试配置 md**（`$ARGS` 里给了 `测试配置 md 路径` 时先走这步；主 agent 已代理解析的可跳过直接到 1.1）：

1. Read 该 md（本会话刚 Write 过则复用上下文）：frontmatter 提取 `baseUrl` / `username` / `password` / `headless` / `loginPath` / `menuSelector`，小节提取 `feature` / `## 范围`（→ `$SCOPE`）/ `## 菜单路径`（→ 实况探测 menuPath）/ `## 预置数据授权`（→ `$AUTH_SCOPE`）
2. `${ENV_VAR}` 形式的环境值从 `process.env` 解析；解析不到 → 停止上报（主 agent 问用户）
3. 环境字段写入 `e2e/.env.e2e`（映射：`headless` → `E2E_HEADLESS`、`loginPath` → `E2E_LOGIN_PATH`、`menuSelector` → `E2E_MENU_SELECTOR`；**只追加缺失 key，不覆盖用户已有值**）
4. 取 `feature` 字段作为功能输入，进 1.1

**1.1 功能定位**：

| 输入形态 | 动作 |
| --- | --- |
| md 路径（`src/pages/**` 或自定义相对/绝对路径） | Read 全文（本会话刚 Write 过则复用上下文，跳过 Read）；**与 1.0 的区分**：frontmatter 含 `baseUrl`/`username` 的是测试配置 md → 回 1.0；否则是被测功能的页面配置 md |
| 功能名 / 菜单名 | Glob `${CLAUDE_PROJECT_DIR}/src/pages/**/*.md` 逐个 Read 匹配（标题 / feature / YAML name）；找到 1 个 → 用之；多个 → 列出问主 agent（subagent 无法提问时选标题最贴近的并在报告标注）；0 个 → **实况探测模式** |
| 菜单路径文本（如 `系统管理/用户管理`） | 同上；并作为 T1 菜单导航用例的 `menuPath` |

同时从 md YAML 记下 `view`（→ `src/views/<view>/`），用于 Step 3 交叉核对生成产物。

### Step 2：环境引导（Phase A，幂等，详见 [fixtures.md](fixtures.md)）

1. **依赖**：`package.json` 缺 `@playwright/test` → `pnpm add -D @playwright/test dotenv && pnpm exec playwright install chromium`
2. **脚手架**：`e2e/` 下 6 个文件（config / auth.setup / fixtures / helpers / env.d.ts / progress-reporter）**仅缺失时**从 [templates/](templates/) 提取写入，已存在**绝不覆盖**
3. **凭据**：写入 `e2e/.env.e2e`（缺 key 才追加，不覆盖已有值）
4. **gitignore**：检查并追加 `e2e/.auth/`、`e2e/.env.e2e`
5. **登录冒烟**：`pnpm exec playwright test --project=setup` 验证 auth.setup 通过；失败（验证码 / 多步登录等）→ 如实上报主 agent 转问用户，禁止绕过

### Step 3：推导用例清单（Phase A，manifest，详见 [derive-testcases.md](derive-testcases.md)）

md 模式：`## 查询` / `## 表格` / `## 编辑表单` 小节 → 交叉核对 `src/views/<view>/` 生成产物（Vue 源码优先）→ 产出结构化清单。实况探测模式：一次性 Playwright 脚本 dump 菜单 / 按钮 / 表头 / 表单字段 → 归纳清单。每条用例记录：类别（T1-T4）、目标、选择器策略、测试数据、期望结果。

### Step 4：生成 spec（Phase A）

写 `e2e/<feature>.spec.ts`（feature 取 md 文件名去扩展名，实况探测取菜单末级 kebab-case）：4 类 describe 结构、用例标题中文、数据用 `uniqueTag()`，**覆盖重写**该 spec（脚手架文件不动）。模板见 [test-templates.md](test-templates.md)。

### Step 5：执行与失败迭代（Phase B，主 agent 用 Bash 前台执行，过程可见）

```bash
cd ${CLAUDE_PROJECT_DIR} && pnpm exec playwright test e2e/<feature>.spec.ts
```

- 每轮跑完立刻输出一行进度：`第 X 轮：通过 N / 失败 M（耗时 Xs）`，失败用例列出标题
- **实时进度与计时**：工程注册了 `e2e/progress-reporter.ts`，每条用例结束即写 `e2e/progress.log`（时间戳 / 进度序号 / 单条耗时 / worker），运行结束写 `e2e/reports/last-run-summary.json`（总耗时 + 每用例耗时 + 最慢 Top5）。后台执行时主会话可 `tail -f e2e/progress.log` 实时观察；每轮耗时以该日志首行（▶ 开始）与汇总行（■ 运行结束）的时间戳之差为准，**禁止凭感觉估算耗时**
- **提速约定**：默认取 `playwright.config.ts` 的 workers（消费工程已按只读/写操作分组并行调好）；只有数据相互干扰时才 `E2E_WORKERS=1 pnpm exec playwright test …` 全串行
- 失败分类：**选择器 / 测试代码问题** → 修 spec 重跑（**累计 ≤2 轮**）；**疑似被测系统 bug**（操作正常但系统报错 / 校验缺失 / 保存无响应）→ 不再重试，保留证据，按 [bug-report.md](bug-report.md) 追加 `e2e/bugs.md` 台账
- 导出按钮用例：断言下载触发 + 文件非空即可，不解析内容

### Step 6：清理（Phase B）

cleanup fixture 在每条用例 teardown 里执行注册的删除函数（`afterEach` 语义）；spec 末尾 `afterAll` 搜索 `E2E_` 前缀残留并删除；清理失败不阻断测试但必须在报告列出残留。

### Step 7：报告与落盘（Phase B）

完整报告写入 `e2e/reports/<feature>-<YYYYMMDD-HHmm>.md`（格式如下），同时在回复中输出同内容摘要；疑似系统 bug 已在 Step 5 追加进 `e2e/bugs.md` 的，在失败详情里回链 `→ BUG-XXXX`：

```markdown
## 测试报告 — <功能名> (<系统 URL>)
覆盖来源：md 配置 src/pages/xxx.md（或：实况探测）
### 菜单导航  N 通过 / M 失败
### 按钮可用性  …
### 输入校验  …
### 保存/修改  …
### 失败详情（如有）
| 用例 | 期望 | 实际 | 证据（screenshot/trace 路径） | suspected 层 |
### 清理状态：已清理 / 残留：<清单>
### 耗时统计
- 各轮耗时（第 X 轮 Xs）与**总测试耗时**（从 e2e/reports/last-run-summary.json 读取 wallTimeMs，禁止估算）
- 最慢用例 Top3（标题 + 耗时）；明显超出均值的用例给出提速建议
### 改进建议：data-testid 候选、flaky 选择器、覆盖缺口、config 提速建议（如仍 workers=1）
```

末尾附复跑与查看方式：`pnpm exec playwright test` / `pnpm exec playwright show-report`；bug 台账：`e2e/bugs.md`。

---

## 3. 配置模板

测试配置模板（推荐复制为工程根 `e2e.test.md`，URL/账号/功能一次配置复用）：[config-template.md](config-template.md)（**仅供编写新配置时读，生成 / 执行流程不读**）。命令行显式参数优先级高于配置；含真实凭据的配置文件必须 gitignore。

---

## 关键约束速查

| 约束 | 说明 |
| --- | --- |
| **脚手架仅缺失时写** | config / auth.setup / fixtures / helpers / env.d.ts / progress-reporter 已存在绝不覆盖；feature spec 整文件覆盖 |
| **凭据走 env** | 只进 `e2e/.env.e2e`；禁止硬编码进 spec / helper / 报告 |
| **Vue 源码优先** | 用例推导中 md 与生成产物不一致时，以 `src/views/` 实际 DOM 结构为准 |
| **失败迭代 ≤2 轮** | 超出按疑似系统 bug 上报，不无限重试 |
| **真实环境红线** | 只写自建数据（`E2E_` 前缀）；超范围用例跳过并标注 |
| **baseUrl = 已部署环境** | 指向 k8s 部署的远程地址（Ingress/域名）；禁止默认 localhost、禁止启动本地 dev server / 配 `webServer` 指向本地 |
| **过程可见** | Phase B 每轮跑完输出进度行（耗时取自 `e2e/progress.log` 首末行时间戳，禁止估算）；里程碑（环境就绪/清单/spec/报告落盘）逐一向用户可见；后台执行时提示 `tail -f e2e/progress.log` |
| **bug 统一入台账** | 疑似系统 bug 只进 `e2e/bugs.md`（append-only），运行报告回链编号；测试代码问题不进台账 |
| **v1 单功能** | 一次跑一个 feature；manifest 格式预留多 feature 扩展 |
