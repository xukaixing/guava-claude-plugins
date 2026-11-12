---
name: code-test-init
description: >
  反向生成测试功能 md：以消费项目 src/views/<view>/ 源码为权威、src/pages/<feature>.md
  画布配置为参考交叉核对，生成 e2e/cases/<feature>.md 测试专用 md（供 guava-test 的
  feature 输入使用）。由 guava-test-init agent 以独立 subagent 执行，勿与其他 skill 混载。
disable-model-invocation: true
---

# code-test-init

> [test-md-format.md](test-md-format.md)

**职责**：为一个或多个功能反向生成 / 同步测试专用 md（`e2e/cases/<feature>.md`）。
**不做**：不执行测试、不需要凭据与环境、不改 `src/` 业务源码与 `src/pages/**` 生成配置（只读），除 `e2e/cases/` 外不写任何文件。

---

## 参数

| 来源 | 参数 | 说明 | 必填 |
| --- | --- | --- | --- |
| `$ARGS` | `功能` | `src/pages/<feature>.md` 路径 / 功能名（模糊匹配 `src/pages/**/*.md` 与 `src/views/**`）/ view 路径 / `all`（批量全量） | ✅ |
| `$ARGS` | `模式` | `generate`（默认，只生成缺失的）/ `sync`（显式更新已存在的，由用户授权后传入） | 可选 |

## 安全红线

1. `src/pages/**` 与 `src/views/**` 全程**只读**
2. `e2e/cases/<feature>.md` **已存在且模式非 sync → 绝不覆盖**，只输出差异摘要
3. 生成的 md frontmatter **禁止出现 `baseUrl` / `username` / `password`**——含这些字段会被 guava-test 误认为环境配置 md；环境字段只属于工程根 `e2e.test.md`

---

## 执行流程

### Step 0：准备（一次性读取）

在**一条消息内**并行 Read 本 skill 的 `SKILL.md` 与 [test-md-format.md](test-md-format.md)，生成过程中禁止二次 Read（上下文压缩丢失除外）。不读 code-test 及其他 code-* 文档（与本任务无关）。

### Step 1：定位 feature（1 个或多个）

| 输入形态 | 动作 |
| --- | --- |
| md 路径（`src/pages/**` 或自定义路径） | Read 全文；frontmatter 含 `baseUrl`/`username` → 报错上报（那是环境配置 md，不是功能 md）；提取 `feature` / `title` / `view` 进 Step 2 |
| 功能名 / 菜单名 | Glob `src/pages/**/*.md` 逐个 Read 匹配（标题 / feature / YAML name）；1 个 → 用之；多个 → 列出报主 agent；0 个 → Glob `src/views/**` 匹配目录名，走**纯源码模式**（无 md 基线） |
| view 路径（`src/views/<view>`） | 直接定为纯源码模式，feature 取末级目录名 |
| `all` / 批量 | Glob `src/pages/**/*.md` 全量，逐个执行 Step 2-4；已存在的测试 md 默认跳过并列入报告 |

### Step 2：读取信息源

1. **页面配置 md**（非纯源码模式时）：`## 查询` / `## 表格` / `## 操作列` / `## 表格工具栏` / `## 编辑` 小节作为基线参考
2. **Vue 源码（权威）**：Read `src/views/<view>/` 下主 SFC 与 module/ 目录（helper / data / edit 组件），提取：
   | 提取项 | 用途 |
   | --- | --- |
   | 查询条件字段（label / field / type / format 校验 / dicType / 默认值） | `## 查询` 表 |
   | 表格列（label / prop / 渲染类型：dic/tag/switch/自定义） | `## 表格` 表 |
   | 工具栏按钮与操作列按钮（真实文案、GvDialog/GvDrawer 容器、confirm 文案） | `## 表格工具栏` / `## 操作列` |
   | 编辑表单字段（label / field / format `[必填, 校验, 长度]` / 默认值 / disabled 条件 / hidden） | `## 编辑表单` 表 |
   | 联动逻辑（字典 cb / watch / 显隐条件）、页面特殊布局（树/页签/多容器） | md 顶部「布局/联动」备注 |
   | 保存成功提示文案 | `## 编辑表单` 备注 |
3. **menuPath**：在 `src/router/` 与布局菜单配置中按 view 名 / title 检索；找不到就省略 frontmatter `menuPath` 并在报告标注（实况探测可兜底）

### Step 3：交叉核对（源码优先）

md 基线与源码冲突 → **一律以源码为准**，冲突项记入漂移清单（旧 md 说法 → 源码实际）。纯源码模式下漂移清单为空，覆盖来源标为「源码」。

### Step 4：写入 e2e/cases/<feature>.md

- 文件名：feature 取页面 md 的 `feature`（无则 view 末级），扩展名 `.md`
- 内容严格按 [test-md-format.md](test-md-format.md) 的骨架与小节表格生成；末尾附 `<!-- 漂移记录 -->`（有漂移时）
- **覆盖策略**：文件已存在 → 模式为 `sync` 才覆盖重写；否则跳过，报告中给出「现有 vs 新推导」差异摘要（字段/按钮/校验 增删改三类）
- 写后用 prettier 格式化该文件（消费项目有 prettier 时）

### Step 5：报告

```markdown
## 测试 md 生成报告
### 生成：<feature> → e2e/cases/<feature>.md（覆盖来源：md+源码交叉核对 / 纯源码）
### 跳过（已存在）：<feature>（差异摘要…，确认后可用 sync 模式更新）
### 漂移记录（源码 vs src/pages md）：逐条列出
### 下一步：把 e2e.test.md 的 feature 指向 e2e/cases/<feature>.md 即可跑 guava-test
```

---

## 关键约束速查

| 约束 | 说明 |
| --- | --- |
| **源码权威** | 一切字段 / 按钮 / 校验以 `src/views/<view>/` 实际代码为准，`src/pages` md 仅作基线参考 |
| **只读业务代码** | `src/pages/**` / `src/views/**` 不得写入；唯一写入点是 `e2e/cases/` |
| **默认不覆盖** | 已存在的测试 md 只有 sync 模式（用户显式授权）才重写 |
| **frontmatter 禁环境字段** | `baseUrl`/`username`/`password` 只属于 `e2e.test.md` |
| **不臆造** | 源码中看不到的校验 / 文案 / 按钮不编造；推导不出就省略并报告标注 |
