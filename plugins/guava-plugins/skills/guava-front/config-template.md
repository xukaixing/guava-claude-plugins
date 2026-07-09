# Guava Page Config

> 复制下方内容，改 YAML 头 + 配置表即可。文件清单、方法名、API 函数名由 skill **自动推导**，无需手写。

**页面类型**由 `pageType` 决定，详见 [page-types.md](page-types.md)。省略时默认为 `crud-module`。

| pageType | 配置模板 | 示例 |
|----------|---------|------|
| `crud-module`（默认） | 下方默认块 | `src/pages/sysMng/userMng.md` |
| `tabs` | [tabs 配置块](#tabs-配置) | `src/pages/demo/demoFormTabs.md` |
| `form-only` | [form-only 配置块](#form-only-配置) | `src/pages/sysMng/systemConfig.md` |

## crud-module 配置（默认）

```markdown
---
feature: userMng          # 必填，camelCase
title: 用户管理            # 必填，中文标题
view: sysMng/userMng      # 必填，Index 页目录
pageType: crud-module     # 可选，省略时等同 crud-module
api: admin/user           # 必填 → src/api/admin/user.ts
apiBase: /sysuser         # 必填，后端根路径
layout: module            # 可选 module | flat，默认 module
crud: search, add, edit, delete   # 必填，search 始终要有
editPage: true            # 可选，add/edit 有时默认 true
subTable: false           # 可选，主子表
paths:                    # 必填，端点路径（skill 推导 apiName / methodName）
  find: /sysuser/findUsers
  save: /sysuser/saveUser
  update: /sysuser/updateUser/{id}
  delete: /sysuser/deleteUser
---

## 查询

| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| | | text | isAny | 30 | |

## 表格

| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| | | 120 | | |

## 编辑

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 扩展 |
| | | text | Y | isAny | 30 | |
```

## tabs 配置

```markdown
---
feature: demoFormTabs
title: Demo 多 Tab 表单
view: demo/demoFormTabs
pageType: tabs
layout: flat
api: admin/user
apiBase: /sysuser
crud: search, add, edit, delete
editMode: drawer          # drawer | inline（列表 Tab 编辑方式）
tabs:
  - name: list
    label: 查询-列表
    type: search-table
  - name: edit
    label: 新增-修改
    type: inline-form
paths:
  find: /sysuser/findUsers
  save: /sysuser/saveUser
  update: /sysuser/updateUser/{id}
  delete: /sysuser/deleteUser
---

## 查询
（同 crud-module）

## 表格
（同 crud-module）

## 编辑
（inline-form Tab 与/或 Drawer 共用）
```

## form-only 配置

```markdown
---
feature: systemConfig
title: 系统参数配置
view: sysMng/systemConfig
pageType: form-only
layout: flat
api: admin/systemConfig
apiBase: /sysconfig
crud: load, save
paths:
  get: /sysconfig/getByKey
  save: /sysconfig/save
---

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 扩展 |
| 站点名称 | siteName | text | Y | isAny | 60 | |
```

> form-only **不需要** ## 查询 / ## 表格 表。

## YAML 头说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `feature` | ✅ | 业务域，如 `userMng` |
| `title` | ✅ | 页面中文标题 |
| `view` | ✅ | `src/views/` 下路径 |
| `pageType` | | `crud-module`（默认）\| `tabs` \| `form-only` |
| `api` | ✅ | API 文件，如 `admin/user` |
| `apiBase` | ✅ | 后端根路径 |
| `crud` | ✅ | 见 [page-types.md](page-types.md) 各类型说明 |
| `layout` | | `module`（默认）或 `flat` |
| `component` | | Vue 组件前缀，省略时从 feature 推导 |
| `i18n` | | 多语言分组，省略时用 feature |
| `editPage` | | crud-module：是否生成 Edit 页 |
| `subTable` | | crud-module：是否主子表 |
| `editMode` | | tabs：列表 Tab 编辑方式 `drawer`（默认）\| `inline` |
| `tabs` | tabs 时 ✅ | Tab 定义数组，见 [page-types.md](page-types.md#tabs) |
| `paths` | ✅ | 端点；crud-module/tabs 用 find/save/update/delete；form-only 用 get/save |

## 扩展列（仅需要时填写）

| 写法 | 含义 |
|------|------|
| `dic=yxzt` | 字典编码 |
| `date=daterange` | 日期类型 |
| `remote=findDictFromTableApi` | 远程字典 |
| `disabledOnEdit` | 编辑时禁用 |
| `multiple` | 字典多选 |

## 表格「类型」列

| 写法 | 含义 |
|------|------|
| 留空 | text |
| `dic:yxzt` | 字典列 |
| `date:datetime` | 日期列 |

## 子表（subTable: true 时追加）

```markdown
## 子表路径
paths:
  dtlFind: /xxx/findXxxDtl
  dtlSave: /xxx/saveXxxDtl
  dtlDelete: /xxx/deleteXxxDtl

## 子表列
| 名称 | 字段 | 宽度 | 类型 |
```

字段规则详见 [search-conditions.md](search-conditions.md)。
