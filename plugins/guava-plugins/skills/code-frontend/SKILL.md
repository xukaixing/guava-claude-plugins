---
name: code-frontend
description: >
  Frontend: Vue 3 + Guava UI. Config from custom path or src/pages/*.md.
  Prefer Gv* via plugin MCP (guava-ui / gv-form / gv-table…); use el-* only if no Gv* wrapper.
  Invoke /guava-plugins:code-frontend <path>. Read context/front.md + this SKILL. No routes/git.
disable-model-invocation: true
---

# code-frontend

> [\_shared.md](_shared.md) · [conventions.md](conventions.md) · [../../context/front.md](../../context/front.md) · [MCP](../../mcp/guava-ui/README.md)

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

**规则**：优先 `Gv*`；仅当 MCP / 类型无对应封装时才用 `el-*`。详见 [conventions.md](conventions.md#ui-组件)。

### MCP 不可用时的 fallback

如果 MCP 工具（`guava-ui` / `gv-form` / `gv-table` 等）**不可用**，从工程的 `node_modules/guava-ui` 依赖获取组件信息：

1. **读取类型定义**：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui/lib/types/index.d.ts`
   - 包含所有 Gv* 组件的 props / emits 类型声明
2. **读取组件源码**：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui/lib/components/Gv*/src/Gv*.vue`
   - 包含组件实现和用法示例
3. **读取导出列表**：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui/lib/index.d.ts`
   - 包含所有导出组件名称

```
fallback 查找顺序：
1. MCP 工具（guava-ui / gv-*）     ← 优先
2. node_modules/guava-ui/lib/types  ← MCP 不可用时
3. node_modules/guava-ui/lib/components ← 需要查看源码时
```

> **注意**：只要工程执行过 `pnpm install`（含 guava-ui 依赖），fallback 始终可用。

---

## 2. 生成流程

```
用户指定了配置文件路径？
  是 → Read 指定路径 → config-parser + page-types → MCP page recipe → Write 全部 → Step 8
  否 → 搜索 src/pages/**/*.md → 同上
      没找到 → Interactive 逐步确认 → 同上
```

### Step 0：准备

Read 同 pageType 参考页（[page-types.md](page-types.md)）+ 目标 `api` / `helper` / `types` / `locales`。

### 配置文件路径

**核心规则**：用户指定路径时，**必须用 Read 工具实际读取**，禁止凭判断说"不存在"。

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

1. Read 配置（YAML + 表）；记下 YAML **`view`** 原文；检查 **`frontendOnly`**
2. [config-parser.md](config-parser.md) 推导清单 — **所有 Vue / helper / types / data 路径 = `src/views/<view>/...`**，禁止用 `.md` 路径或 `feature` 当目录
3. 展示清单时核对：例如 `view: sysMng/userMng2` → 必须出现 `src/views/sysMng/userMng2/`；`frontendOnly: true` → 有 `data.ts`、**无** `src/api`
4. MCP：`get_page_recipe` + 相关 `gv-*` / `get_gv_component`
5. Write 每一个文件（覆盖策略见 [\_shared.md](_shared.md#覆盖策略)）；`frontendOnly` 时跳过 api、按 [templates/data.md](templates/data.md) 写 data.ts
6. **读取 `## 改进`**：若配置中存在 `## 改进` 小节，逐条分析并应用到已生成的代码上做二次优化
7. Step 8

### Interactive Mode

确认顺序：pageType → **是否 frontendOnly** → 基础字段（[config-parser.md](config-parser.md)）→ 查询（crud / tabs 必选，[search-conditions.md](search-conditions.md)，**校验必填**）→ 编辑字段（**校验必填**）→ API 操作（api.operations）→ tabs 列表（tabs 时）→ 按 pageType 选模板：

| Step | crud-module | tabs | form-only | free |
| ---- | ----------- | ---- | --------- | ---- |
| API | [api.md](templates/api.md) | 同左 | get / save | 不生成 |
| data | [data.md](templates/data.md)（仅 frontendOnly） | 同左 | mockFormModel | 内联数据 |
| types | [types.md](templates/types.md) | 同左 | 同左 | 不生成 |
| helper | [helper.md](templates/helper.md) | [helper.md#tabs](templates/helper.md#tabs) | [helper.md#form-only](templates/helper.md#form-only) | 不生成 |
| Vue 格式 | [vue.md](templates/vue.md) | 同左 | 同左 | 同左 |
| 主页 | [crud.md](templates/crud.md) | [tabs.md](templates/tabs.md) | [form.md](templates/form.md) | [free.md](templates/free.md) |
| Edit | [edit.md](templates/edit.md) | drawer 时 | — | — |
| i18n | [i18n.md](templates/i18n.md) | 同左 | 同左 | — |

### Step 8：收尾

清单 ✅ · i18n 已写 · `## 改进` 已应用 · `lint-fix.sh` 无报错（见 [\_shared.md](_shared.md#生成后)）

---

## 3. 配置模板与示例

配置模板：[config-template.md](config-template.md) · 示例：`src/pages/sysMng/userMng.md`

---

## 4. 关键约束速查

| 约束 | 说明 |
|------|------|
| **view = 目录** | `src/views/<YAML.view>/`，禁止用 `.md` 路径或 `feature` 当目录 |
| **frontendOnly** | 不生成 api；列表 / 表单数据在 `data.ts` |
| **i18n** | 默认 `false` = 仅中文，不走 `t()`；`true` = 双语言 + `t()` |
| **校验必填** | 查询 / 编辑 / 表单 每条 FormItem 必须有 `format[1]` |
| **操作列独立** | `## 操作列` / `## 扩展列` 为表格级单独声明 |
| **MCP 优先** | template 标签前必须查 MCP |
