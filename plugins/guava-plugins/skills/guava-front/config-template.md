# Guava Page Config

> 复制改 YAML 头 + 配置表即可。文件清单、方法名、API 函数名由 skill **自动推导**。

`pageType` 决定页面类型，详见 [page-types.md](page-types.md)。省略默认 `crud-module`。

---

## crud-module（默认）

```markdown
---
feature: userMng
title: 用户管理
view: sysMng/userMng2
pageType: crud-module
layout: module
editPage: true
subTable: false
api:
  module: admin/user
  base: /sysuser
  operations:
    list: /sysuser/findUsers
    create: /sysuser/saveUser
    update: /sysuser/updateUser/{id}
    delete: /sysuser/deleteUser
---

## 查询
| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 用户账号 | u@account | text | isNumberLetter | 30 | |
| 状态 | u@status | dic | isDic | 6 | dic=yxzt |
| 创建时间 | createTime | date | isDate | 10 | date=daterange |

## 表格
| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| 用户账号 | account | 150 | Y | |

## 操作列
编辑,删除

## 扩展列
expand

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit |
| 状态 | status | dic | Y | idDic | 6 | N | 1 | dic=yxzt |
| 备注 | remark | textarea | | isAny | 200 | N | 3 | |
```

### 仅前端（frontendOnly: true）

```markdown
---
feature: userMng
title: 用户管理（本地数据）
view: demo/userMngLocal
layout: module
frontendOnly: true
editPage: true
---

## 查询
| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 用户账号 | account | text | isNumberLetter | 30 | |

## 表格
| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| 用户账号 | account | 150 | Y | |

## 操作列
编辑,删除

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | |

## 示例数据
| id | account | userName | status |
| 1 | admin | 管理员 | 10601 |
```

---

## tabs

```markdown
---
feature: demoFormTabs
title: Demo 多 Tab 表单
view: demo/demoFormTabs
pageType: tabs
layout: flat
editMode: drawer
tabs:
  - name: list
    label: 查询-列表
    type: search-table
  - name: edit
    label: 新增-修改
    type: inline-form
---

## 查询 / 表格 / 编辑（同 crud-module）
```

---

## form-only

```markdown
---
feature: systemConfig
title: 系统参数配置
view: sysMng/systemConfig
pageType: form-only
layout: flat
---

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 站点名称 | siteName | text | Y | isAny | 60 | N | 1 | |
| 备注 | remark | textarea | | isAny | 200 | N | 3 | |
```

> 不需要 ## 查询 / ## 表格；**编辑表校验列仍必填**。

---

## free

```markdown
---
feature: dashboard
title: 数据看板
view: dashboard/overview
layout: flat
i18n: false
pageType: free
frontendOnly: true
---

## 页面描述
顶部显示 4 个统计卡片，下方为最近订单列表。

## 组件清单
| 组件 | 用途 | 关键 props |
| GvCard | 统计卡片 | title, value |
| GvTable | 订单列表 | table-head, table-data |

## 数据
const statCards = [{ title: '今日订单', value: 128 }];
```

---

## 配置项速查

### 字段扩展

| 写法 | 含义 |
| ---- | ---- |
| `dic=yxzt` | 字典编码 |
| `date=daterange` | 日期类型 |
| `remote=findDictFromTableApi` | 远程字典 |
| `disabledOnEdit` | 编辑时禁用 |
| `multiple` | 字典多选 |

### 表格「类型」列

| 写法 | 含义 |
| ---- | ---- |
| 留空 | text |
| `dic:yxzt` | 字典列 |
| `date:datetime` | 日期列 |
| `amount` | 金额列（自动右对齐 + `amountFormat`） |

### 扩展列

```markdown
## 扩展列
expand                     # 简写 = type: table

# 或：
expand:
  type: table              # table | custom | both
  columns:
    - label: 用户账号
      prop: account
  template:                # custom/both 时
    <div>{scope.row.xxx}</div>
```

### 改进

```markdown
## 改进
- Drawer 宽度改为 60%
- 表格列「用户账号」固定左侧
- 状态为「停用」的行文字显示为红色
```

> 所有调整必须基于 guava-ui（Gv*）组件库，调整前需查询 MCP。
