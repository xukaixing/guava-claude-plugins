# 配置文件解析规则

读取 `.md` 配置文件 → 解析 → **自动推导**路径/方法名/API 名 → 生成代码。

支持两种格式：**精简格式（推荐）** 与 **旧版表格格式（兼容）**。

## 解析流程

```
读取 .md → 解析 YAML 头 + pageType → 解析配置表 → 推导命名/文件清单 → Write 目标文件
```

**文件清单勿写入配置文件**，由本节规则自动推导并在生成前展示。

`pageType` 省略时视为 `crud-module`。类型总览见 [page-types.md](page-types.md)。

---

## 0. 精简格式（推荐）

### YAML 头

```yaml
---
feature: userMng          # 必填
title: 用户管理            # 必填
view: sysMng/userMng      # 必填
pageType: crud-module     # 可选，默认 crud-module | tabs | form-only
api: admin/user           # 必填
apiBase: /sysuser         # 必填
layout: module            # 可选，默认 module
crud: search, add, edit, delete   # 必填（form-only 见 page-types.md）
editPage: true            # 可选
subTable: false           # 可选，默认 false
editMode: drawer          # tabs 可选：drawer | inline
tabs:                     # pageType=tabs 时必填
  - name: list
    label: 查询-列表
    type: search-table
component: User           # 可选，见推导规则
i18n: userMng             # 可选，默认 = feature
paths:                    # 必填
  find: /sysuser/findUsers
  save: /sysuser/saveUser
  update: /sysuser/updateUser/{id}
  delete: /sysuser/deleteUser
---
```

| YAML 字段 | 映射 |
|-----------|------|
| `feature` | `featureName` |
| `title` | `moduleTitle` |
| `view` | `viewPath` |
| `pageType` | 页面类型，默认 `crud-module` |
| `api` | `apiModule` |
| `apiBase` | `apiServicePath` |
| `crud` | 启用的操作列表 |
| `editPage` | `generateEditPage` |
| `subTable` | `hasSubTable` |
| `editMode` | tabs 列表 Tab 编辑方式 |
| `tabs` | Tab 定义数组 |
| `paths.*` | API 端点 |

### 三张表（crud-module / tabs 按需）

**查询** — 6 列：`名称 | 字段 | 类型 | 校验 | 长度 | 扩展`
- crud-module：必填
- tabs：含 `search-table` Tab 时必填
- form-only：**不使用**

**表格** — 5 列：`名称 | 字段 | 宽度 | 筛选 | 类型`
- crud-module：必填
- tabs：含 `search-table` Tab 时必填
- form-only：**不使用**
- 筛选：`Y` → `query: true`，空 → `false`
- 类型：空 → text；`dic:yxzt` → dic；`date:datetime` → date

**编辑** — 7 列：`名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 扩展`
- 必填：`Y` → `required: true`，空 → `false`
- crud-module：add/edit 或 editPage 时必填
- tabs：含 `inline-form` Tab 或 editMode=drawer 且 add/edit 时必填
- form-only：**必填**（整页表单字段）

### 扩展列解析

| 扩展值 | 生成属性 |
|--------|---------|
| `dic=yxzt` | `dicType: 'yxzt'` |
| `date=daterange` | `dateType: 'daterange'` |
| `remote=findDictFromTableApi` | `dicRemote` + import |
| `disabledOnEdit` | 编辑时 `disabled` |
| `multiple` | `multiple: true` |

---

## 1. 自动推导

### componentBaseName

| feature | 推导结果 |
|---------|---------|
| `userMng` | `User` |
| `salesSkills` | `SalesSkills` |
| 含 `component:` | 使用配置值 |

规则：去掉 `Mng` 后缀 → PascalCase；或读 YAML `component`。

### CRUD 方法名 / API 名

从 `paths` 最后路径段 + `component` 推导：

| 操作 | 方法名 | API 名 | HTTP |
|------|--------|--------|------|
| find | `search{Entity}List` | `{segment}Api` | POST |
| save | `add{Entity}` | `{segment}Api` | POST |
| update | `edit{Entity}` | `{segment}Api` | PUT |
| delete | `delete{Entity}` | `{segment}Api` | POST |

示例 `paths.find: /sysuser/findUsers` → `findUsersApi`，`searchUserList`

配置中可显式覆盖（旧格式表格的 methodName / apiName 列）。

### form-only 方法名 / API 名

| 操作 | crud | 方法名 | API 名 | HTTP | paths |
|------|------|--------|--------|------|-------|
| 加载 | load | `load{Component}` | `get{Component}Api` | GET | `get` 或 `find` |
| 保存 | save | `save{Component}` | `save{Component}Api` | POST | `save` |
| 更新 | update | `save{Component}` | `update{Component}Api` | PUT | `update` |

示例 `feature: systemConfig` → `loadSystemConfig`、`getSystemConfigApi`、`saveSystemConfigApi`。

可选 `loadParams` 对象 → 写入 `crud.fetchData(api, loadParams)`。

### componentBaseName 补充

| feature | 推导结果 |
|---------|---------|
| `systemConfig` | `SystemConfig` |
| `userMng` | `User`（去 Mng） |

无 `Mng` 后缀时：首字母大写保留已有驼峰 → PascalCase（`systemConfig` → `SystemConfig`，`demoFormTabs` → `DemoFormTabs`）。

### tabs 方法名 / inline 保存

| 方法 | 命名 | 条件 |
|------|------|------|
| inline 保存 | `save{Component}Inline` | 含 `inline-form` Tab |
| Tab 切换 | `handleTabClick` | 含 `inline-form` Tab |

Tab i18n：`tabs[].name` → `tab` + 首字母大写 name（`list` → `tabList`）。

`editPage` 默认：tabs + `editMode: drawer` + crud 含 add/edit → 生成 Edit.vue。

### 输出文件清单（自动，勿手写进配置）

#### pageType 分支

| pageType | 主 Vue | Edit 子组件 | helper/types | 模板 | 生成状态 |
|----------|--------|------------|--------------|------|---------|
| `crud-module` | `<Component>Index.vue` | `<Component>Edit.vue`（editPage） | 同下 | index-page / edit-page | ✅ |
| `tabs` | `<Component>Index.vue`（GvTabs） | `<Component>Edit.vue`（editMode=drawer） | 同下 | index-page-tabs | ✅ |
| `form-only` | `<Component>.vue` | 无 | `<view>/helper.tsx` | form-only-page | ✅ |

**未实现类型**：无（三种 pageType 均已支持）。

#### tabs 文件清单

```
src/api/<api>.ts
src/views/<view>/<Component>Index.vue      ← GvTabs
src/views/<view>/[module/]helper.tsx       ← 含 InlineEditList（有 inline-form Tab 时）
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editMode=drawer 且 add/edit
src/locales/zh-CN.ts + en.ts
```

#### form-only 文件清单

```
src/api/<api>.ts
src/views/<view>/<Component>.vue
src/views/<view>/helper.tsx
src/views/<view>/types.d.ts
src/locales/zh-CN.ts + en.ts
```

**不生成** `<Component>Index.vue`、`<Component>Edit.vue`。`layout: module` 时 helper/types 仍在 `module/` 子目录。

#### crud-module / tabs（layout 影响 module 子目录）

根据 `view`、`layout`、`component`、`crud`、`editPage`、`pageType` 推导：

```
src/api/<api>.ts
src/views/<view>/<Component>Index.vue          ← form-only 时为 <Component>.vue
src/views/<view>/[module/]helper.tsx           ← layout=module 时有 module/
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editPage 且 add/edit（非 form-only）
src/locales/zh-CN.ts + en.ts
```

| layout | helper / types / Edit 位置 |
|--------|---------------------------|
| `module` | `<view>/module/` |
| `flat` | `<view>/` |

生成前 skill **展示**上述清单供确认；用户**无需**在 `.md` 里维护清单。

---

## 2. 旧版格式（兼容）

仍支持「## 1. 基本信息」表格 + 宽表头格式。字段映射：

| 旧字段 | 新字段 |
|--------|--------|
| `featureName` | `feature` |
| `moduleTitle` | `title` |
| `viewPath` | `view` |
| `apiModule` | `api` |
| `apiServicePath` | `apiBase` |
| `modulePath: x/module` | `view: x`, `layout: module` |
| `generateEditPage` | `editPage` |
| `hasSubTable` | `subTable` |
| `pageType` | `pageType`（旧配置缺省 → crud-module） |

旧版「## 5. CRUD 操作」宽表仍有效；有则优先于 paths 推导。

---

## 3. 查询 / 表格 / 编辑 → 代码

（与旧规则相同，扩展列等价于原 remark / dicType / dateType）

| 配置 | FormItem |
|------|----------|
| 查询 | `format[0]=0` |
| 编辑必填 Y | `format[0]=1`，字典用 `idDic` |
| 编辑非必填 | `format[0]=0`，字典用 `isDic` |

action 列按 `crud` 含 edit/delete 自动生成，不在表格配置中写。

---

## 4. 校验清单

### crud-module（默认）

- [ ] `crud` 含 `search`
- [ ] `paths.find` 已填
- [ ] 查询表、表格表有数据
- [ ] dic 字段扩展含 `dic=` 或类型列含 `dic:`

### tabs

- [ ] `pageType: tabs`
- [ ] `tabs` 数组至少 1 项
- [ ] 含 `type: search-table` 时：查询表 + 表格表有数据，`crud` 含 `search`
- [ ] 含 `type: inline-form` 时：编辑表有数据

### form-only

- [ ] `pageType: form-only`
- [ ] `crud` 含 `load` 或等价 `get`
- [ ] `paths.get`（或 `paths.find`）与 `paths.save` 已填
- [ ] 编辑表有数据
- [ ] **无**查询表、表格表要求

---

## 5. 生成顺序

覆盖策略 → [_shared.md](_shared.md)

| 顺序 | 文件 | 策略 |
|------|------|------|
| 0 | Read 已有文件 | 保留 Vue `@date` |
| 1 | API | 缺函数追加 |
| 2 | types.d.ts | 覆盖 |
| 3 | helper.tsx | 覆盖 |
| 4 | Index.vue / `<Base>.vue` | 覆盖（form-only 为 `<Base>.vue`） |
| 5 | Edit.vue | 覆盖（editPage 时；form-only 跳过） |
| 6 | i18n | 替换分组 |

---

## 6. 不做的事

- 不修改路由
- 不执行 git 命令
- **不在配置文件里要求用户维护文件清单**
