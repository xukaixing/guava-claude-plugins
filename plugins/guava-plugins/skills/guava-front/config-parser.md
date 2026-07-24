# 配置文件解析规则

读取 `.md` 配置 → 解析 → **自动推导** 路径 / 方法名 / API 名 → 生成代码。

支持两种格式：**精简格式（推荐）** 与 **旧版格式（兼容）**。

---

## 0. CRUD 方法来源

生成代码时，`crud.*` 方法签名以 **GvCrud MCP**（对齐 `gv.crud.ts`）为准：

| 场景 | crud 方法 |
| ---- | --------- |
| 列表查询（有表单） | `crud.search(fm, table, fetch)` |
| 列表查询（无表单） | `crud.searchNoFm(table, fetch, data)` |
| 通用获取 | `crud.fetchData(fetch, data)` |
| 通用提交 | `crud.submit(fetch, data, hasMsg?, msg?)` |
| 新增保存 | `crud.save(fm, fetch, check?, msg?)` |
| 编辑保存 | `crud.update(fm, id, fetch, check?, msg?)` |
| 表单回填 | `crud.setEditValue(formList, rowData)` |
| 表单重置 | `crud.resetEditValue(formList)` |
| 本地插入行 | `crud.insertResult(searchData, result)` |
| 本地更新行 | `crud.updateResult(searchData, result, rownums)` |
| 本地删除行 | `crud.removeResult(searchData, index)` |
| 多表单校验 | `crud.checkForms(fmNodes)` |
| 分页查询 | `crud.toNewPageSearch(tabNode, filterConditions, fetch, pageInfo)` |

> **导入**：`import { crud } from 'guava-ui'` 或 `import { crud } from '@/hook/service/useCrud'`

---

## 1. 精简格式（推荐）

### 1.1 YAML 头

```yaml
---
feature: userMng          # 必填
title: 用户管理            # 必填
view: sysMng/userMng2     # 必填 → src/views/sysMng/userMng2/
pageType: crud-module     # 可选，默认 crud-module
layout: module            # 可选，默认 module
i18n: false               # 可选，默认 false = 仅中文
editPage: true            # 可选
subTable: false           # 可选
component: User           # 可选，覆盖推导
api:                      # frontendOnly 时省略
  module: admin/user
  base: /sysuser
  operations:
    list: /sysuser/findUsers
    create: /sysuser/saveUser
    update: /sysuser/updateUser/{id}
    delete: /sysuser/deleteUser
---
```

| YAML 字段 | 映射 |
| --------- | ---- |
| `feature` | 命名 / i18n / 方法前缀（**不是** views 目录） |
| `title` | 页面中文标题 |
| `view` | **唯一**决定 `src/views/<view>/` |
| `pageType` | `crud-module`（默认）\| `tabs` \| `form-only` \| `free` |
| `layout` | `module`（默认）\| `flat` |
| `i18n` | `false` = 仅中文（默认）；`true` = 双语言 + `t()` |
| `api.module` | API 文件路径 → `src/api/<module>.ts` |
| `api.operations` | 操作端点（key = 操作名） |

### 1.2 frontendOnly

| 项 | 行为 |
| ---- | ---- |
| `api` 节点 | **省略** |
| `src/api/**` | **不生成、不修改** |
| `data.ts` | **必生成**（[templates/data.md](templates/data.md)） |
| 列表查询 | Index 读 `getListResult` / `filterListRecords`，禁止 `crud.search(…, *Api)` |
| 编辑保存 | Edit 本地 `emit('saved')`（[templates/edit.md](templates/edit.md#frontendonly-true)） |

### 1.3 硬性规则：view = 目录

**`src/views/` 下的目录必须严格等于 YAML `view` 字段**。

| 配置 | 正确 | 错误 |
| ---- | ---- | ---- |
| `view: sysMng/userMng2` | `src/views/sysMng/userMng2/` | `src/views/sysMng/userMng/` |

生成前**必须**先打印文件清单供确认。

### 1.4 三张配置表

**查询** — 6 列：`名称 | 字段 | 类型 | 校验 | 长度 | 扩展`
- crud-module / tabs 必填
- **「校验」列必填**（[search-conditions.md](search-conditions.md)）
- **「字段」列保留 `u@` 前缀**

**表格** — 5 列：`名称 | 字段 | 宽度 | 筛选 | 类型`
- 筛选：`Y` → `query: true`
- 类型：空 → text；`dic:yxzt` → dic；`date:datetime` → date；`amount` → 金额列
- **「字段」列不带 `u@`**

**编辑** — 9 列：`名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展`
- 必填：`Y` → `required: true`
- **「校验」列必填**（字典必填 → `idDic`，非必填 → `isDic`）
- 只读：`Y` → `readonly: true`（必须填 Y/N，不可空）
- 占用列：`≥2` → `colspan: N`；名称含「备注/地址/详情/描述」默认 `colspan: 3`

### 1.5 表格级独立声明

| 小节 | 必须 | 说明 |
| ---- | ---- | ---- |
| `## 操作列` | ✅ | 逗号分隔按钮名 → `content` + `action`（无 icon） |
| `## 扩展列` | | 含 `expand` → 展开列 |
| `## 表格工具栏` | | 第 1 行：按钮名；第 2 行：`import,export` |

### 1.6 多表格

`## 表格2`、`## 表格3`... 追加第二个以后表格（无查询条件）。

| 项 | 说明 |
| ---- | ---- |
| ref 命名 | `xxxTableList2`... |
| helper 工厂 | `create<Feature>TableHeadList2`... |
| 操作列 | `## 操作列2`（可选） |

### 1.7 改进（二次优化）

`## 改进` 小节支持页面布局、样式、交互的全方位微调。生成后逐条应用。

**约束**：所有调整必须基于 guava-ui（Gv*）组件库，调整前需查询 MCP。

---

## 2. 自动推导

### 2.1 componentBaseName

| feature | 推导结果 |
| ------- | -------- |
| `userMng` | `User`（去 Mng 后缀 → PascalCase） |
| `salesSkills` | `SalesSkills` |
| 含 `component:` | 使用配置值 |

### 2.2 操作名 / 方法名 / API 名

从 `api.operations` 的 key 推导：

| operations key | 方法名 | API 名 | HTTP |
| -------------- | ------ | ------ | ---- |
| `list` | `search{Entity}List` | `{末段}Api` | POST |
| `create` | `add{Entity}` | `{末段}Api` | POST |
| `update` | `edit{Entity}` | `{末段}Api` | PUT |
| `delete` | `delete{Entity}` | `{末段}Api` | POST |

> 示例：`list: /sysuser/findUsers` → API `findUsersApi`，方法 `searchUserList`

### 2.3 form-only 方法名

| operations key | 方法名 | API 名 |
| -------------- | ------ | ------ |
| `get` / `find` | `load{Component}` | `get{Component}Api` |
| `save` | `save{Component}` | `save{Component}Api` |
| `update` | `save{Component}` | `update{Component}Api` |

### 2.4 tabs 方法名

| 方法 | 命名 | 条件 |
| ---- | ---- | ---- |
| inline 保存 | `save{Component}Inline` | 含 `inline-form` Tab |
| Tab 切换 | `handleTabClick` | 含 `inline-form` Tab |

---

## 3. 输出文件清单（自动推导）

### pageType 分支

| pageType | 主 Vue | Edit | helper/types |
| -------- | ------ | ---- | ------------ |
| `crud-module` | `<Component>Index.vue` | `<Component>Edit.vue`（editPage） | `module/` 或根目录 |
| `tabs` | `<Component>Index.vue`（GvTabs） | drawer 时 | 同上 |
| `form-only` | `<Component>.vue` | — | 同上 |
| `free` | `<Feature>.vue` | — | 不生成 |

### crud-module 文件清单

```
src/api/<api>.ts                              ← frontendOnly 时省略
src/views/<view>/[module/]data.ts             ← 仅 frontendOnly
src/views/<view>/<Component>Index.vue
src/views/<view>/[module/]helper.tsx
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue  ← editPage 且 add/edit
src/locales/zh-CN.ts + en.ts
```

| layout | helper / types / Edit 位置 |
| ------ | -------------------------- |
| `module` | `src/views/<view>/module/` |
| `flat` | `src/views/<view>/` |

---

## 4. 旧版格式（兼容）

| 旧字段 | 新字段 |
| ------ | ------ |
| `featureName` | `feature` |
| `moduleTitle` | `title` |
| `viewPath` | `view` |
| `apiModule` | `api` |
| `apiServicePath` | `apiBase` |
| `modulePath: x/module` | `view: x`, `layout: module` |
| `generateEditPage` | `editPage` |
| `hasSubTable` | `subTable` |

旧版「## 5. CRUD 操作」宽表仍有效；有则优先于 api.operations 推导。

---

## 5. 校验清单

### crud-module

- [ ] `api.operations.list` 已填（有后端时）
- [ ] 查询表、表格表有数据，每行「校验」已填且合法
- [ ] 编辑表（若有）每行「校验」已填且合法
- [ ] dic 字段扩展含 `dic=` 或类型列含 `dic:`

### tabs

- [ ] `tabs` 数组至少 1 项
- [ ] 含 `search-table` 时：查询 + 表格有数据，校验齐全
- [ ] 含 `inline-form` 时：编辑表有数据且校验齐全

### form-only

- [ ] `crud` 含 `load` 或等价 `get`
- [ ] 编辑表有数据且每行「校验」已填
- [ ] **无**查询表、表格表要求

---

## 6. 生成顺序

| 顺序 | 文件 | 策略 |
| ---- | ---- | ---- |
| 0 | Read 已有文件 | 保留 Vue `@date` |
| 1 | API | 缺函数追加 |
| 2 | types.d.ts | 覆盖 |
| 3 | helper.tsx | 覆盖 |
| 4 | data.ts（frontendOnly） | 覆盖 |
| 5 | Vue 主页 | 覆盖 |
| 6 | Vue Edit | 覆盖 |
| 7 | i18n | 替换分组 |
| 8 | 应用 `## 改进` | 局部调整 |
