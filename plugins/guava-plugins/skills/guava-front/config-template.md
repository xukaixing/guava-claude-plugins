# Guava Page Config

> 复制下方内容，改 YAML 头 + 配置表即可。文件清单、方法名、API 函数名由 skill **自动推导**。

**页面类型**由 `pageType` 决定，详见 [page-types.md](page-types.md)。省略时默认为 `crud-module`。

---

## crud-module 配置（默认）

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
<!-- 校验列必填，取值见 search-conditions.md -->

| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 用户账号 | u@account | text | isNumberLetter | 30 | |
| 状态 | u@status | dic | isDic | 6 | dic=yxzt |
| 创建时间 | createTime | date | isDate | 10 | date=daterange |

## 表格

| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| | | 120 | | |

## 操作列

编辑,删除

## 扩展列

expand

## 表格工具栏

新增编辑行,校验编辑行
import,export

## 编辑
<!-- 校验列必填；字典必填用 idDic；只读=Y→readonly: true；占用列=数字→colspan: N -->

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit |
| 状态 | status | dic | Y | idDic | 6 | N | 1 | dic=yxzt |
| 手机 | mobile | text | | isPhone | 11 | N | 1 | |
| 创建人 | createBy | text | | isAny | 30 | Y | 1 | |
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
| 2 | demo | 演示 | 10602 |
```

---

## tabs 配置

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
（同 crud-module）

## 表格
（同 crud-module）

## 编辑
（inline-form Tab 与/或 Drawer 共用）
```

---

## form-only 配置

```markdown
---
feature: systemConfig
title: 系统参数配置
view: sysMng/systemConfig
pageType: form-only
layout: flat
api:
  module: admin/systemConfig
  base: /sysconfig
  operations:
    get: /sysconfig/getByKey
    save: /sysconfig/save
---

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 站点名称 | siteName | text | Y | isAny | 60 | N | 1 | |
| 维护模式 | maintenanceMode | dic | | isDic | 6 | N | 1 | dic=yxzt |
| 备注 | remark | textarea | | isAny | 200 | N | 3 | |
```

> form-only **不需要** ## 查询 / ## 表格；**编辑表校验列仍必填**。

---

## free 配置

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

数据看板页，顶部显示 4 个统计卡片，下方左侧为订单趋势图表，右侧为最近订单列表。

## 组件清单

| 组件 | 用途 | 关键 props |
|------|------|-----------|
| GvCard | 统计卡片 | title, value |
| GvTable | 最近订单列表 | table-head, table-data |
| GvButton | 刷新按钮 | type: primary |

## 数据

// 统计数据
const statCards = [
  { title: '今日订单', value: 128 },
  { title: '今日金额', value: 56800 },
];

// 订单列表数据
const orderList = [
  { orderNo: 'OD20260101', amount: 1280, status: '已支付' },
];
```

> free **不需要** ## 查询 / ## 表格 / ## 编辑；布局由 `## 页面描述` + `## 组件清单` 定义。

---

## 字段扩展

| 写法 | 含义 |
| ---- | ---- |
| `dic=yxzt` | 字典编码 |
| `date=daterange` | 日期类型 |
| `remote=findDictFromTableApi` | 远程字典 |
| `disabledOnEdit` | 编辑时禁用 |
| `multiple` | 字典多选 |

## 表格「类型」列

| 写法 | 含义 |
| ---- | ---- |
| 留空 | text |
| `dic:yxzt` | 字典列 |
| `date:datetime` | 日期列 |
| `amount` | 金额列（自动右对齐 + `amountFormat` 千分位） |

> **数值列自动格式化**：列名含「金额」「合计」→ `align: 'right'` + `amountFormat`；含「数量」→ `align: 'right'`

---

## 操作列 / 扩展列（表格级）

```markdown
## 操作列
编辑,删除

## 扩展列
expand
```

| 按钮名 | 对应 TableActions 方法 |
| ------ | ---------------------- |
| `编辑` | `edit<Feature>` |
| `删除` | `delete<Feature>` |
| 自定义 | 需在 `TableActions` 声明对应方法 |

**不生成 `icon` 属性**。

### 扩展列配置（可选）

简写（默认子表表格）：
```markdown
## 扩展列
expand
```

完整配置（自定义 render 内容）：
```markdown
## 扩展列
expand:
  type: table          # table | custom | both（默认 table）
  columns:
    - label: 用户账号
      prop: account
    - label: 用户姓名
      prop: userName
  template:            # type=custom 或 both 时
    <div class="expand-custom">
      <p>自定义内容：{scope.row.userName}</p>
    </div>
```

| 字段 | 说明 |
| ---- | ---- |
| `type` | `table`（子表）\| `custom`（自定义 div）\| `both`（组合） |
| `columns` | 子表列定义（type=table 或 both 时） |
| `template` | 自定义 JSX 模板（type=custom 或 both 时） |

---

## 表格工具栏（可选）

```markdown
## 表格工具栏
新增编辑行,校验编辑行
import,export
```

不声明时仅生成默认"新增"按钮（add enabled 时）。

---

## 改进（可选）

```markdown
## 改进
- 编辑页 Drawer 宽度改为 60%
- 表格列「用户账号」固定左侧，宽度 180px
- 状态为「停用」的行文字显示为红色
- 「备注」输入框改为多行文本，占用 2 列
```

> 所有调整必须基于 guava-ui（Gv*）组件库，调整前需查询 MCP。

---

## 多表格（可选）

```markdown
## 表格2
> 第二个表格，无查询条件，仅显示列表。

| 名称 | 字段 | 宽度 | 类型 |
| 订单编号 | orderNo | 180 | |

## 操作列2
查看,取消

## 表格工具栏2
刷新
```
