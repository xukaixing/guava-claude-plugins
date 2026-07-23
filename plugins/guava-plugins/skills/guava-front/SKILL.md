---
name: guava-front
description: >
  Frontend: Vue 3 + Guava UI from src/pages/*.md. Prefer Gv* via plugin MCP
  (guava-ui / gv-form / gv-table…); use el-* only if no Gv* wrapper.
  Invoke /guava-plugins:guava-front. Read context/front.md + this SKILL. No routes/git.
disable-model-invocation: true
---

# guava-front

> [\_shared.md](_shared.md) · [conventions.md](conventions.md) · [../../context/front.md](../../context/front.md) · [MCP](../../mcp/guava-ui/README.md)

**只做**：按配置 Write API/Vue/helper/types/i18n。**不做**：路由、git。

## Gv 组件（MCP 必用）

本 skill 与 **guava-plugins 自带 MCP** 一起安装；写 `<template>` 前必须查 MCP，禁止凭记忆写 `el-*`：

| 时机 | MCP |
| --- | --- |
| 定 pageType 后 | `guava-ui` → `get_page_recipe`（`crud-list` / `form-edit` / `form-only` / `tabs`） |
| 写具体标签前 | `gv-form` / `gv-table` / `gv-button`… → `get_usage` / `get_api` / `get_props`；或 `guava-ui` → `get_gv_component` |
| 只有 el-* / 中文意图 | `guava-ui` → `resolve_gv_component` |
| 不确定有哪些 | `guava-ui` → `list_gv_components`（可 `pageLevelOnly: true`） |

规则：优先 `Gv*`；仅当 MCP/类型无对应封装时才用 `el-*`。详见 [conventions.md](conventions.md#ui-组件guava-ui--guava-ui)。

## 流程

```
有 src/pages/**/*.md？
  是 → Read 配置 → config-parser + page-types → MCP page recipe → Write 全部 → Step 8
  否 → Interactive 逐步确认 → 同上
```

### Step 0

Read 同 pageType 参考页（[page-types.md#类型总览](page-types.md#类型总览)）+ 目标 `api`/`helper`/`types`/`locales`。

### Config File Mode

1. Read 配置（YAML + 表）；记下 YAML **`view`** 原文；检查 **`frontendOnly`**
2. [config-parser.md](config-parser.md) 推导清单 — **所有 Vue/helper/types/data 路径 = `src/views/<view>/...`**，禁止用 `.md` 路径或 `feature` 当目录
3. 展示清单时核对：例如 `view: sysMng/userMng2` → 必须出现 `src/views/sysMng/userMng2/`；`frontendOnly: true` → 有 `data.ts`、**无** `src/api`
4. MCP：`get_page_recipe` + 相关 `gv-*` / `get_gv_component`
5. Write 每一个文件（覆盖策略见 \_shared.md）；`frontendOnly` 时跳过 api、按 [templates/data.md](templates/data.md) 写 data.ts
6. **读取 `## 改进`**：若配置中存在 `## 改进` 小节，逐条分析并应用到已生成的代码上做二次优化
7. Step 8

### Interactive Mode

确认：pageType → **是否 frontendOnly** → 基础字段（[config-parser.md](config-parser.md)）→ 查询（crud/tabs 必选，[search-conditions.md](search-conditions.md)，**校验必填**）→ 编辑字段（**校验必填**，同 search-conditions）→ API 操作（api.operations）→ tabs 列表（tabs 时）→ 按 pageType 选模板：

| Step   | crud-module                              | tabs                                               | form-only                                        |
| ------ | ---------------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| API    | [api.md](templates/api.md)（frontendOnly 跳过） | 同左                                               | get/save（frontendOnly 跳过）                    |
| data   | [data.md](templates/data.md)（仅 frontendOnly） | 同左                                               | mockFormModel                                    |
| types  | [types.md](templates/types.md)           | 同左                                               | 同左                                             |
| helper | [helper.md](templates/helper.md)         | [#tabs](templates/helper.md#tabs)                  | [#form-only](templates/helper.md#form-only)      |
| Vue 格式 | [vue.md](templates/vue.md)               | 同左                                               | 同左                                             |
| 主页   | [index-page.md](templates/index-page.md) | [index-page-tabs.md](templates/index-page-tabs.md) | [form-only-page.md](templates/form-only-page.md) |
| Edit   | [edit-page.md](templates/edit-page.md)   | drawer 时                                          | —                                                |
| i18n   | [i18n.md](templates/i18n.md)             | 同左                                               | 同左                                             |

### Step 8

清单 ✅ · i18n 已写 · `## 改进` 已应用 · `lint-fix.sh` 无报错（见 \_shared.md）

配置模板：[config-template.md](config-template.md) · 示例：`src/pages/sysMng/userMng.md`
