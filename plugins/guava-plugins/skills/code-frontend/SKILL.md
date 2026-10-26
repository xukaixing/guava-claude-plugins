---
name: code-frontend
description: >
  Frontend: Vue 3 + Guava UI. Config from custom path or src/pages/*.md.
  Prefer Gv* via plugin MCP (guava-ui / gv-form / gv-table…); use el-* only if no Gv* wrapper.
  Invoke /guava-plugins:code-frontend <path>. Read context/front.md + this SKILL. No routes/git.
  由 guava-codegen 以独立 subagent 执行，勿与其他端 skill 混载。
disable-model-invocation: true
---

# code-frontend

> [\_shared.md](_shared.md) · [\_common.md](templates/_common.md) · [conventions.md](conventions.md) · [../../context/front.md](../../context/front.md) · [MCP](../../mcp/guava-ui/README.md)

**职责**：按配置 Write API / Vue / helper / types / i18n。**不做**：路由、git。

---

## 1. Gv 组件（MCP 必用）

写 `<template>` 前**必须**查 MCP，禁止凭记忆写 `el-*`：

| 时机 | MCP 工具 |
| --- | --- |
| 定 pageType 后 | `guava-ui` → `get_page_recipe`（`crud-list` / `form-edit` / `form-only` / `tabs`） |
| 写具体标签前 | `gv-form` / `gv-table` / `gv-button`… → `get_usage` / `get_api` / `get_props` |
| 只有 el-* / 中文意图 | `guava-ui` → `resolve_gv_component` |
| 不确定有哪些 | `guava-ui` → `list_gv_components`（可 `pageLevelOnly: true`） |

**规则**：优先 `Gv*`；仅当 MCP / 类型无对应封装时才用 `el-*`。详见 [conventions.md](conventions.md#3-ui-组件)。

**同轮复用**（省 token / 省往返）：同一次生成任务中，`get_page_recipe` 每个 pageType 只查一次；同一组件的 `get_usage` / `get_api` / `get_props` / `get_source` 结果只查一次，后续相同标签直接复用，禁止重复查询。

## 1.1 Icon 图标规则

**优先使用 `src/views/iconsMng/` 中已定义的图标**：

| 图标类型 | iconType | 来源文件 | 命名 |
| -------- | -------- | -------- |------|
| 字体图标 | `iconfont` | `font-icons.ts` | `gv-icon-xxx` |
| Element 图标 | `el` | `el-icons.ts` | PascalCase |
| SVG 图标 | `svg` | `svg-icons.ts` | kebab-case |

```vue
<GvIcon iconType="iconfont" iconName="gv-icon-shouye" />
<GvIcon iconType="el" iconName="AddLocation" />
<GvIcon iconType="svg" iconName="some-svg" />
```

- 生成代码时，从 `iconsMng/` 中查找合适的图标
- 不在列表中的图标不使用
- `iconType` 可省略（自动推断）：`el-icon-xxx` → el，`gv-icon-xxx` → iconfont

### MCP 不可用时的 fallback

如果 MCP 工具（`guava-ui` / `gv-form` / `gv-table` 等）**不可用**，从工程的 `node_modules/guava-ui` 依赖获取组件信息（发布包只含 4 个文件，**没有** `lib/components/**/*.vue` 和 `lib/index.d.ts`，勿引用不存在的路径）：

1. **读取类型定义**：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui/lib/types/index.d.ts`
   - 包含所有 Gv* 组件的 props / emits 类型声明
2. **读取组件源码**：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui/lib/guava-ui.es.js.map`
   - source map 内嵌全部 Gv* 原始 SFC 源码（`sourcesContent`，按 `packages/Gv*/src/*.vue` 索引），与消费项目实际运行的代码一致

```
fallback 查找顺序：
1. MCP 工具（guava-ui / gv-*）     ← 优先；组件级 get_source = npm 源码，get_props = npm 类型
2. node_modules/guava-ui/lib/types/index.d.ts  ← props / emits 权威
3. node_modules/guava-ui/lib/guava-ui.es.js.map ← 原始 SFC 源码（内嵌）
```

> **npm 新鲜度**：press 用法文档可能滞后；props / emits / 组件源码永远以安装版 npm 为准（get_props / get_source，或上述 fallback 文件）。各工具响应里的 `npm` 块（packageVersion / sfcLastEditTime / pressGeneratedAt）可用来判断 press 文档是否过期。

---

## 2. 生成流程

```
用户指定了配置文件路径？
  是 → Read 指定路径 → config-parser + page-types → MCP page recipe → Write 全部 → Step 8
  否 → 搜索 src/pages/**/*.md → 同上
      没找到 → Interactive 逐步确认 → 同上
```

### Step 0：准备

**并行 Read**（一条消息内并发调用，勿串行）：同 pageType 参考页（[page-types.md](page-types.md)）+ 目标 `api` / `helper` / `types` / `locales`。

### 配置文件路径

**核心规则**：用户指定路径时，**必须用 Read 工具实际读取**，禁止凭判断说"不存在"。
**例外（省 token）**：若本会话刚用 Write 生成 / 更新过该 md（如先产出配置再生成代码），内容已在上下文中，**跳过 Read 直接复用写入内容**；仅当文件可能被外部修改过（跨会话、他人编辑）才必须重新 Read。

**路径解析规则**（按顺序尝试，每一步都用 Read 工具验证）：

```
第 1 步：用户输入的是绝对路径（以 / 开头）？
  → 是 → 直接用 Read 工具读取该路径
  → 读取成功 → 进入 Config File Mode
  → 读取失败 → 进入第 2 步

第 2 步：尝试相对于项目根目录
  → Read 工具读取：${CLAUDE_PROJECT_DIR}/<用户输入路径>
  → 例如用户输入 template/frontend/crudPage.md
  → 读取：/Users/andyhsu/Workspace/ses-web/template/frontend/crudPage.md
  → 读取成功 → 进入 Config File Mode
  → 读取失败 → 进入第 3 步

第 3 步：尝试 src/pages/ 下
  → Read 工具读取：${CLAUDE_PROJECT_DIR}/src/pages/<用户输入路径>
  → 读取成功 → 进入 Config File Mode
  → 读取失败 → 告知用户路径不存在，询问是否搜索 src/pages/**/*.md
```

**优先级**：
1. **用户指定路径**：`/code-frontend template/frontend/crudPage.md` → 按上述步骤逐步尝试
2. **默认搜索**：`src/pages/**/*.md`（递归查找）

| 用法 | 示例 |
|------|------|
| 指定相对路径 | `/code-frontend template/frontend/crudPage.md` |
| 指定绝对路径 | `/code-frontend /Users/andyhsu/Workspace/ses-web/template/frontend/crudPage.md` |
| 指定 src/pages 路径 | `/code-frontend src/pages/sysMng/userMng.md` |
| 默认搜索 | `/code-frontend` → 自动搜索 `src/pages/**/*.md` |

### Config File Mode

1. 获取配置：**本会话刚 Write 过该 md → 直接用上下文内容，跳过 Read**；否则 Read 配置（YAML + 表）。然后 **格式识别**（视觉稿 / 精简 / 旧版，按小节标题特征与表格列数，[config-parser.md](config-parser.md)）→ `pageType` 省略时按小节推导 → 无 `api` 块（未标 frontendOnly）**默认 `frontendOnly: true`**；记下 YAML **`view`** 原文
2. [config-parser.md](config-parser.md) 推导清单 — **所有 Vue / helper / types / data 路径 = `src/views/<view>/...`**，禁止用 `.md` 路径或 `feature` 当目录
3. 展示清单时核对：例如 `view: sysMng/userMng2` → 必须出现 `src/views/sysMng/userMng2/`；`frontendOnly: true` → 有 `data.ts`、**无** `src/api`
4. MCP：`get_page_recipe` + 相关 `gv-*` / `get_gv_component`
5. **并发 Write 全部文件**（一条消息内多个 Write 调用，勿串行；hook `PostToolBatch` 对整批统一 lint）：覆盖策略见 [\_shared.md](_shared.md#覆盖策略)；`frontendOnly` 时跳过 api、按 [templates/data.md](templates/data.md) 写 data.ts
6. **读取 `## 改进`**：若配置中存在 `## 改进` 小节，逐条分析并应用到已生成的代码上做二次优化
7. Step 7

### Interactive Mode

确认顺序：pageType → **是否 frontendOnly** → 基础字段（[config-parser.md](config-parser.md)）→ 查询（crud / tabs 必选，[search-conditions.md](search-conditions.md)，**校验必填**）→ 编辑字段（**校验必填**）→ API 操作（api.operations）→ tabs 列表（tabs 时）→ 按 pageType 选模板：

| Step | crud-module | tabs | form-only | free |
| ---- | ----------- | ---- | --------- | ---- |
| API | [api.md](templates/api.md) | 同左 | get / save | 不生成 |
| data | [data.md](templates/data.md)（仅 frontendOnly） | 同左 | mockFormModel | 内联数据 |
| types | [types.md](templates/types.md) | 同左 | 同左 | 不生成 |
| helper | [helper.md](templates/helper.md) | [helper.md §14](templates/helper.md#14-form-only--tabs) | [helper.md §14](templates/helper.md#14-form-only--tabs) | 不生成 |
| Vue 格式 | [vue.md](templates/vue.md) | 同左 | 同左 | 同左 |
| 主页 | [crud.md](templates/crud.md) | [tabs.md](templates/tabs.md) | [form.md](templates/form.md) | [free.md](templates/free.md) |
| Edit | [edit.md](templates/edit.md) | drawer 时 | — | — |
| i18n | [i18n.md](templates/i18n.md) | 同左 | 同左 | — |

### Step 7：本轮代码检查（速查优先）

每次生成后必做。先凭刚写完的内容过下表速查（无需 Read 任何文件）；**全部通过** → 输出三行简报（`规范 / 安全 / 性能：通过（速查）`）直接进 Step 8；**任一可疑** → 才 Read [code-review.md](code-review.md) 按完整清单深检，Critical 修复后再进 Step 8。

| 维度 | Critical 速查项 |
| --- | --- |
| 规范 | 路径 = `src/views/<YAML.view>/`；无 `function` / `reactive` / 裸 `any`；全局类型（`FormItem` / `TableHeadItem` / `Recordable` 等）未 import；format 校验完整（查询 / 编辑 validator 必填） |
| 安全 | `frontendOnly` 时无 `@/api` import；无未消毒 `v-html`；删除 / 状态变更有确认 |
| 性能 | 列表走 `crud.search` 分页；字典不在循环内重复请求 |

### Step 8：收尾

清单 ✅ · i18n 已写 · `## 改进` 已应用 · 本轮检查通过 · `lint-fix.sh` 无报错（见 [\_shared.md](_shared.md#生成后)）

---

## 3. 配置模板与示例

配置模板（推荐视觉稿格式）：[config-template.md](config-template.md) · 解析规则：[config-parser.md](config-parser.md) · 示例：`src/pages/sysMng/userMng.md`

---

## 4. 关键约束速查

| 约束 | 说明 |
|------|------|
| **view = 目录** | `src/views/<YAML.view>/`，禁止用 `.md` 路径或 `feature` 当目录 |
| **componentBaseName** | 仅当 `feature` 以 `Mng` 结尾时去后缀，其余保持原样转 PascalCase |
| **frontendOnly** | 不生成 api；列表 / 表单数据在 `data.ts` |
| **i18n** | 默认 `false` = 仅中文，不走 `t()`；`true` = 双语言 + `t()` |
| **校验必填** | 查询 / 编辑 / 表单 每条 FormItem 必须有 `format[1]` |
| **操作列独立** | `## 操作列` / `## 扩展列` 为表格级单独声明；视觉稿格式行内 `action:` 声明**优先** |
| **小节后缀** | `## 查询 - xxx` / `## 编辑表单 - xxx` 按 `-` 前前缀匹配；`---` 分隔线忽略 |
| **布局意图** | `### 布局` 纯描述不生成代码；含 GvDrawer / GvDialog 指令时决定编辑容器 |
| **GvDescriptions 子区** | `### 分区名（GvDescriptions）` → `build<Feature><Section>InfoHeadList` + Edit 内只读块 |
| **MCP 优先** | template 标签前必须查 MCP |
