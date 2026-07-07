# 配置文件解析规则

读取 `.md` 配置文件 → 解析 → **自动推导**路径/方法名/API 名 → 生成代码。

支持两种格式：**精简格式（推荐）** 与 **旧版表格格式（兼容）**。

## 解析流程

```
读取 .md → 解析 YAML 头 + 三张表 → 推导命名/文件清单 → Write 全部目标文件
```

**文件清单勿写入配置文件**，由本节规则自动推导并在生成前展示。

---

## 0. 精简格式（推荐）

### YAML 头

```yaml
---
feature: userMng          # 必填
title: 用户管理            # 必填
view: sysMng/userMng      # 必填
api: admin/user           # 必填
apiBase: /sysuser         # 必填
layout: module            # 可选，默认 module
crud: search, add, edit, delete   # 必填
editPage: true            # 可选
subTable: false           # 可选，默认 false
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
| `api` | `apiModule` |
| `apiBase` | `apiServicePath` |
| `crud` | 启用的 CRUD 操作列表 |
| `editPage` | `generateEditPage` |
| `subTable` | `hasSubTable` |
| `paths.*` | API 端点 |

### 三张表

**查询** — 6 列：`名称 | 字段 | 类型 | 校验 | 长度 | 扩展`

**表格** — 5 列：`名称 | 字段 | 宽度 | 筛选 | 类型`
- 筛选：`Y` → `query: true`，空 → `false`
- 类型：空 → text；`dic:yxzt` → dic；`date:datetime` → date

**编辑** — 7 列：`名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 扩展`
- 必填：`Y` → `required: true`，空 → `false`

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

### 输出文件清单（自动，勿手写进配置）

根据 `view`、`layout`、`component`、`crud`、`editPage` 推导：

```
src/api/<api>.ts
src/views/<view>/<Component>Index.vue
src/views/<view>/[module/]helper.tsx      ← layout=module 时有 module/
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editPage 且 add/edit
src/locales/zh-CN.ts + en.ts              ← 替换 <i18n> 分组
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

- [ ] `crud` 含 `search`
- [ ] `paths.find` 已填
- [ ] dic 字段扩展含 `dic=` 或类型列含 `dic:`
- [ ] 三张表至少查询表有数据

---

## 5. 生成顺序

**必须连续 Write 全部文件，已存在则覆盖（API 仅追加缺失函数）。**

| 顺序 | 文件 | 策略 |
|------|------|------|
| 0 | Read 已有文件 | 保留 Vue `@date` |
| 1 | API | 缺函数追加 |
| 2 | types.d.ts | 覆盖 |
| 3 | helper.tsx | 覆盖 |
| 4 | Index.vue | 覆盖 |
| 5 | Edit.vue | 覆盖（editPage 时） |
| 6 | i18n | 替换分组 |

---

## 6. 不做的事

- 不修改路由
- 不执行 git 命令
- **不在配置文件里要求用户维护文件清单**
