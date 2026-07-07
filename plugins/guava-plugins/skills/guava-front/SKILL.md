---
name: guava-front
description: >
  Generate Vue 3 + Guava UI page files and RESTful API files following project conventions.
  Use this skill whenever the user asks to create pages, CRUD pages, list pages, form pages,
  detail pages, management pages, or API interface files for a Guava-based project. Triggers
  include "create a user management page", "generate pages for orders", "build a product form",
  "add API interfaces for...", "I need a table page with search", "create CRUD for...", and
  any request involving GvForm, GvTable, or Guava UI components. Always use this skill for
  page and API generation tasks in Guava projects.

  Supports two modes:
  1. Config file mode — user provides a .md config file. Parse per config-parser.md and generate.
  2. Interactive mode — step-by-step confirmation when no config file is provided.

  Scope: generate files only. Do NOT add routes, run git commands, or commit. User decides git actions afterward.

  Re-run behavior: always sync generated files to the current config. Existing page files must be overwritten/updated, not skipped. Only API files use merge (add missing functions).

  Invoke as /guava-plugins:guava-front when installed via guava-plugins plugin.
disable-model-invocation: true
---

# Guava Page & API Generator

生成符合项目约定的 Vue 3 + Guava UI 页面与 API 文件。

## 职责边界

**只做一件事：写入代码文件。**

| 做 | 不做 |
|----|------|
| 按配置/确认结果生成 API、Vue、helper、types、i18n | 修改 `src/router/routes.ts` 或任何路由配置 |
| **已存在页面文件 → Write 覆盖更新**；API → 仅补缺失函数 | `git add` / `git commit` / `git push` / `git status` 等任何 git 操作 |
| 生成完成后列出已写文件清单 | 主动询问或执行 git 提交；是否提交由用户自行决定 |

文件头 `@author` 可直接写固定值或从 `git config` 只读获取，**不得因此触发 git 仓库操作**。

## 重新执行（Regenerate）

用户再次执行 guava-front（同一 `.md` 配置或配置已修改）时，**默认按当前配置全量同步**，不是「已有就跳过」。

| 文件 | 已存在时的行为 |
|------|---------------|
| `types.d.ts` | **整文件重写**（按当前 CRUD enabled 状态） |
| `helper.tsx` | **整文件重写**（按当前查询/表格/编辑配置） |
| `<Base>Index.vue` | **整文件重写**；保留原 `@date`，更新 `@LastEditTime` / `@version` |
| `<Base>Edit.vue` | **整文件重写**；保留原 `@date`，更新 `@LastEditTime` / `@version` |
| `src/api/<apiModule>.ts` | **仅追加**配置中缺失的 API 函数；**不覆盖**文件中其他已有函数 |
| `zh-CN.ts` / `en.ts` | **替换**整个 `<i18nKey>` 分组（不重复追加、不跳过） |

**CRITICAL**：禁止因「文件已存在」而跳过 Write。除 API 增量合并外，其余文件必须用 Write 工具写入（覆盖）最新内容。

流程：
1. Read 配置文件 + Read 目标路径已有文件（若存在）
2. 按配置生成完整内容
3. Write 写入每一个清单文件（API 仅补缺失函数时用 StrReplace 追加）
4. 清单全部 ✅ 后结束

## 快速决策

```
用户提供 .md 配置文件？
  ├─ 是 → Config File Mode
  └─ 否 → Interactive Mode
```

## Step 0: 读取项目上下文

生成前**必须**阅读现有代码（选同模块或最接近的 CRUD 页）：

| 阅读目标 | 目的 |
|---------|------|
| `src/api/<apiModule>.ts` | import 模式、`useFetch`、`server.gateway_*` |
| `src/views/<viewPath>/*Index.vue` | Index 结构、`@section` 分区、crud 用法 |
| `helper.tsx` | `create*SearchList` / `create*TableHeadList` 工厂模式 |
| `types.d.ts` | `TableActions` / `EditActions` 接口命名 |
| `src/locales/zh-CN.ts` | i18n 分组 key 风格 |

**参考页面**（按复杂度）：
- 标准 CRUD：`svcProduct/svcLead/salesSkills`（flat 布局）
- 主子表 Edit：`svcProduct/svcLead/salesSkills/SalesSkillsEdit.vue`
- module 布局：`sysMng/companyBusinessMng`

> 旧式 `buildSearchFilter` / 硬编码中文 label 属于 legacy 模式，**新页面一律用 `create*List` + i18n**。

---

## Config File Mode

用户指定 `.md` 配置文件时：

1. Read 读取配置文件（**精简格式**：YAML 头 + 查询/表格/编辑 三张表）
2. 按 [config-parser.md](config-parser.md) 解析并**自动推导**文件清单、方法名、API 名
3. 展示推导出的文件清单（**用户无需在 .md 里写清单**）
4. **连续 Write 全部目标文件**（已存在则覆盖，API 仅追加）
5. Step 8 生成后检查

**CRITICAL — 完整生成**：必须 Write 清单中每一个文件；禁止只写 types.d.ts 后结束；禁止因文件已存在而跳过。

配置文件模板：[config-template.md](config-template.md)  
示例：[examples/userMng.md](examples/userMng.md)（业务项目内配置文件路径自定，如 `src/pages/sysMng/userMng.md`）

---

## Interactive Mode

无配置文件时，逐步确认。

### Step 1: 理解需求

| 项目 | 说明 | 示例 |
|------|------|------|
| featureName | 业务域 camelCase | `userMng` |
| viewPath | Index 页目录 | `sysMng/userMng` |
| layout | `module` / `flat` | `module` |
| componentBaseName | Vue 组件名前缀 | `User` → `UserIndex.vue` |
| apiModule | API 文件路径 | `admin/user` |
| apiServicePath | 后端根路径 | `/sysuser` |
| i18nKey | 多语言分组 | 默认 `featureName` |

路径不明确时主动询问。命名推导见 [config-parser.md](config-parser.md#componentbasename-推导示例)。

### Step 1.1: 查询条件

列表页查询**必选**。用表格逐条确认：

```
📋 请确认查询条件：

| # | label | field | type | validator | maxlength | dicType | dateType | remark |
|---|-------|-------|------|-----------|-----------|---------|----------|--------|
| 1 | 用户账号 | u@account | text | isNumberLetter | 30 | - | - | |
| 2 | 状态 | u@status | dic | isDic | 6 | yxzt | - | |
| 3 | 创建时间 | createTime | date | isDate | 10 | - | daterange | |
```

字段规则见 [search-conditions.md](search-conditions.md)。用户未列出的条件不生成。

### Step 1.2: 编辑表单字段

选中新增/编辑时确认：

```
📋 请确认编辑表单字段：

| # | label | field | type | required | validator | maxlength | dicType | remark |
|---|-------|-------|------|----------|-----------|-----------|---------|--------|
| 1 | 用户账号 | account | text | true | isNumberLetter | 30 | - | disabledOnEdit |
| 2 | 状态 | status | dic | true | idDic | 6 | yxzt | |
```

- `required=true` → `format[0]=1`；字典必填用 `idDic`

### Step 1.3: CRUD 操作

**禁止自动生成全部操作**，仅生成用户选中的。查询必选。

```
📋 请确认 CRUD 操作：

| 操作 | enabled | methodName | apiName | apiEndpoint | httpMethod |
|------|---------|------------|---------|-------------|------------|
| search | true | searchUserList | findUsersApi | /sysuser/findUsers | POST |
| add | false | addUser | saveUserApi | /sysuser/saveUser | POST |
| edit | false | editUser | updateUserApi | /sysuser/updateUser/{id} | PUT |
| delete | false | deleteUser | deleteUserApi | /sysuser/deleteUser | POST |
```

- 无 edit/delete → 不生成 action 列
- 有 add → 工具栏新增按钮
- 有 add/edit → 询问是否生成 Edit 页及是否主子表（Variant B）

### Step 1.4: 文件清单

Config File Mode：**从配置自动推导**，展示即可，用户不必在 `.md` 里写。

Interactive Mode：写入前展示清单，写入后逐项 ✅。

### Step 2–7: 按模板生成

| Step | 文件 | 模板 |
|------|------|------|
| 2 | API | [templates/api.md](templates/api.md) |
| 3 | types.d.ts | [templates/types.md](templates/types.md) |
| 4 | helper.tsx | [templates/helper.md](templates/helper.md) |
| 5 | Index | [templates/index-page.md](templates/index-page.md) |
| 6 | Edit | [templates/edit-page.md](templates/edit-page.md) |
| 7 | i18n | [templates/i18n.md](templates/i18n.md) |

### Step 8: 生成后检查

仅做代码层面确认，**不涉及路由与 git**：

1. 确认文件清单全部 ✅
2. 确认 i18n key 已在 zh-CN / en 中追加
3. 可选：对改动文件运行 ESLint

结束时可简要列出已生成文件路径；路由注册、git 提交由用户自行处理。

---

## 参考文档

| 文档 | 内容 |
|------|------|
| [config-template.md](config-template.md) | 配置文件模板 |
| [config-parser.md](config-parser.md) | 配置文件解析规则 |
| [conventions.md](conventions.md) | 代码风格、命名、目录结构 |
| [search-conditions.md](search-conditions.md) | 查询条件、validator、字典 |
| [examples/userMng.md](examples/userMng.md) | 完整配置示例 |
