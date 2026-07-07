# Guava Page Config

> 复制下方内容，改 YAML 头 + 三张表即可。文件清单、方法名、API 函数名由 skill **自动推导**，无需手写。

```markdown
---
feature: userMng          # 必填，camelCase
title: 用户管理            # 必填，中文标题
view: sysMng/userMng      # 必填，Index 页目录
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

## YAML 头说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `feature` | ✅ | 业务域，如 `userMng` |
| `title` | ✅ | 页面中文标题 |
| `view` | ✅ | `src/views/` 下路径 |
| `api` | ✅ | API 文件，如 `admin/user` |
| `apiBase` | ✅ | 后端根路径 |
| `crud` | ✅ | 逗号分隔：`search, add, edit, delete` |
| `layout` | | `module`（默认）或 `flat` |
| `component` | | Vue 组件前缀，省略时从 feature 推导 |
| `i18n` | | 多语言分组，省略时用 feature |
| `editPage` | | 是否生成 Edit 页 |
| `subTable` | | 是否主子表 |
| `paths` | ✅ | CRUD 端点，key 为 find/save/update/delete |

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
