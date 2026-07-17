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
frontendOnly: false       # 可选，true=仅前端：不生成 api，列表数据用 data.ts
api: admin/user           # frontendOnly 时省略
apiBase: /sysuser         # frontendOnly 时省略
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
paths:                    # frontendOnly 时省略
  find: /sysuser/findUsers
  save: /sysuser/saveUser
  update: /sysuser/updateUser/{id}
  delete: /sysuser/deleteUser
---
```

| YAML 字段 | 映射 |
|-----------|------|
| `feature` | `featureName`（命名/i18n/方法前缀；**不是** views 目录） |
| `title` | `moduleTitle` |
| `view` | `viewPath` → **唯一**决定 `src/views/<view>/` |
| `pageType` | 页面类型，默认 `crud-module` |
| `frontendOnly` | `true` = 仅前端：不生成 `src/api`、不调后端；生成 `data.ts`（默认 `false`） |
| `api` | `apiModule`（`frontendOnly` 时忽略） |
| `apiBase` | `apiServicePath`（`frontendOnly` 时忽略） |
| `crud` | 启用的操作列表 |
| `editPage` | `generateEditPage` |
| `subTable` | `hasSubTable` |
| `editMode` | tabs 列表 Tab 编辑方式 |
| `tabs` | Tab 定义数组 |
| `paths.*` | API 端点（`frontendOnly` 时忽略） |

### `frontendOnly: true`（仅前端 / 无后端 API）

| 项 | 行为 |
|----|------|
| `api` / `apiBase` / `paths` | **可不写**；写出也忽略 |
| `src/api/**` | **不生成、不修改** |
| `data.ts` | **必生成**，见 [templates/data.md](templates/data.md) |
| 列表查询 | Index 读 `getListResult` / `filterListRecords`，禁止 `crud.search(…, *Api)` |
| 编辑保存 | Edit 本地 `emit('saved')`，见 [templates/edit-page.md](templates/edit-page.md#frontendonly-true) |
| guava-all / 后端 | **不生成** Java（见 guava-all config-bridge） |

配置示例：

```yaml
---
feature: userMng
title: 用户管理（演示）
view: demo/userMngLocal
layout: module
frontendOnly: true
crud: search, add, edit, delete
editPage: true
---
```

可选追加 `## 示例数据` 表（列=字段名），用于填充 `mockListRecords`；没有则按 ## 表格字段自动造 2～3 条。  
**`data.ts` 必须对齐后台 `datas`**：分页字段 + `records[0].transHash`（dic/date 列）+ 字典行 `{ c, v }`，见 [templates/data.md](templates/data.md)。

### 硬性规则：`view` 决定生成目录

**`src/views/` 下的目录必须严格等于 YAML 的 `view` 字段**，禁止用配置文件路径、`feature`、或参考页路径替代。

| 配置 | 正确输出根目录 | 错误（禁止） |
|------|----------------|--------------|
| 文件 `src/pages/sysMng/userMng.md` + `view: sysMng/userMng2` | `src/views/sysMng/userMng2/` | `src/views/sysMng/userMng/`（抄了 md 文件名） |
| `feature: userMng` + `view: sysMng/userMng2` | 同上；组件名仍由 `feature`/`component` 推导为 `User` | 把 `feature` 当成目录段 |

生成前**必须**先打印文件清单，且每条路径以 `src/views/<view>/` 开头，例如：

```
view = sysMng/userMng2   ← 来自 YAML，不是 pages 路径
src/views/sysMng/userMng2/UserIndex.vue
src/views/sysMng/userMng2/module/helper.tsx
src/views/sysMng/userMng2/module/types.d.ts
src/views/sysMng/userMng2/module/UserEdit.vue
```

若清单中的 views 路径与 `view` 不一致，**停止生成并修正**后再 Write。

### 三张表（crud-module / tabs 按需）

**查询** — 6 列：`名称 | 字段 | 类型 | 校验 | 长度 | 扩展`
- crud-module：必填
- tabs：含 `search-table` Tab 时必填
- form-only：**不使用**
- **「校验」列必填**，取值见 [search-conditions.md](search-conditions.md)（对齐 `gv.validate.ts`）

**表格** — 5 列：`名称 | 字段 | 宽度 | 筛选 | 类型`
- crud-module：必填
- tabs：含 `search-table` Tab 时必填
- form-only：**不使用**
- 筛选：`Y` → `query: true`，空 → `false`
- 类型：空 → text；`dic:yxzt` → dic；`date:datetime` → date

**编辑** — 7 列：`名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 扩展`
- 必填：`Y` → `required: true`，空 → `false`
- **「校验」列必填**（与查询相同规则集；字典必填→`idDic`，非必填→`isDic`）
- crud-module：add/edit 或 editPage 时必填
- tabs：含 `inline-form` Tab 或 editMode=drawer 且 add/edit 时必填
- form-only：**必填**（整页表单字段，含校验列）

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
src/api/<api>.ts                               ← frontendOnly 时省略
src/views/<view>/<Component>Index.vue      ← GvTabs
src/views/<view>/[module/]data.ts          ← 仅 frontendOnly
src/views/<view>/[module/]helper.tsx       ← 含 InlineEditList（有 inline-form Tab 时）
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editMode=drawer 且 add/edit
src/locales/zh-CN.ts + en.ts
```

#### form-only 文件清单

```
src/api/<api>.ts                               ← frontendOnly 时省略
src/views/<view>/<Component>.vue
src/views/<view>/[module/]data.ts              ← 仅 frontendOnly（含 mockFormModel）
src/views/<view>/helper.tsx
src/views/<view>/types.d.ts
src/locales/zh-CN.ts + en.ts
```

**不生成** `<Component>Index.vue`、`<Component>Edit.vue`。`layout: module` 时 helper/types 仍在 `module/` 子目录。

#### crud-module / tabs（layout 影响 module 子目录）

根据 **YAML `view` 原文**、`layout`、`component`、`crud`、`editPage`、`pageType`、`frontendOnly` 推导（`<view>` = YAML `view` 字符串，禁止改写）：

```
src/api/<api>.ts                               ← frontendOnly 时省略
src/views/<view>/<Component>Index.vue          ← form-only 时为 <Component>.vue
src/views/<view>/[module/]data.ts              ← 仅 frontendOnly
src/views/<view>/[module/]helper.tsx           ← layout=module 时有 module/
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editPage 且 add/edit（非 form-only）
src/locales/zh-CN.ts + en.ts
```

**对照示例**（配置文件在 `src/pages/sysMng/userMng.md`）：

| YAML | 正确输出 | 错误（禁止） |
|------|----------|--------------|
| `view: sysMng/userMng2` | `src/views/sysMng/userMng2/UserIndex.vue` | `src/views/sysMng/userMng/...` |
| `feature: userMng` | 文件名仍为 `UserIndex.vue` / i18n `userMng` | 把目录改成 `userMng` |
| `frontendOnly: true` | 有 `…/data.ts`，**无** `src/api/...` | 仍生成 api 或仍 `crud.search(…, Api)` |

| layout | helper / types / Edit / data 位置 |
|--------|---------------------------|
| `module` | `src/views/<view>/module/` |
| `flat` | `src/views/<view>/` |

生成前 skill **展示**上述清单（路径必须含完整 `view`；标明是否 frontendOnly）供确认；用户**无需**在 `.md` 里维护清单。

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
| 查询 | `format[0]=0`，`format[1]`=校验列（必填） |
| 编辑必填 Y | `format[0]=1`，`format[1]`=校验列；字典用 `idDic` |
| 编辑非必填 | `format[0]=0`，`format[1]`=校验列；字典用 `isDic` |
| `isDouble` | `format[3]`=小数位数，如 `[0, 'isDouble', 10, 4]` |

校验类型必须来自 [search-conditions.md](search-conditions.md)；空或未知则停止生成并确认。

action 列按 `crud` 含 edit/delete 自动生成，不在表格配置中写。

---

## 4. 校验清单

### crud-module（默认）

- [ ] `crud` 含 `search`
- [ ] `paths.find` 已填
- [ ] 查询表、表格表有数据
- [ ] 查询表每行「校验」已填且合法
- [ ] 编辑表（若有）每行「校验」已填且合法
- [ ] dic 字段扩展含 `dic=` 或类型列含 `dic:`

### tabs

- [ ] `pageType: tabs`
- [ ] `tabs` 数组至少 1 项
- [ ] 含 `type: search-table` 时：查询表 + 表格表有数据，`crud` 含 `search`，查询校验齐全
- [ ] 含 `type: inline-form` 时：编辑表有数据且校验齐全

### form-only

- [ ] `pageType: form-only`
- [ ] `crud` 含 `load` 或等价 `get`
- [ ] `paths.get`（或 `paths.find`）与 `paths.save` 已填
- [ ] 编辑表有数据且每行「校验」已填
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
