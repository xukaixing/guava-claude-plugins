# Guava Page Config

> 复制改 YAML 头 + 配置表即可。文件清单、方法名、API 函数名由 skill **自动推导**。
> 推荐「视觉稿格式」（`pageType` / `api` 可省略）；其后为精简格式模板（兼容）。

---

## 视觉稿格式（推荐）

解析规则见 [config-parser.md](config-parser.md#1-视觉稿格式推荐)。要点：小节可带 `- 描述` 后缀、`---` 分隔线忽略、表格不写分隔行且行尾空单元格可裁剪、操作列行内 `action:` 声明（设计器导出不再双写 `### 操作列` 小节）、编辑子区带（GvForm）/（GvDescriptions）注解、frontmatter 默认值可省略（`layout: module` / `i18n: false` / `editPage: true` / `infoPage: false`）；`frontendOnly` 已废弃——有 `backend:` 块 = 全栈（`api:` 块由设计器按 backend 配置自动推导），无 = 纯前端。

```markdown
---
feature: userMng1
title: 用户管理
view: sysMng/userMng
infoPage: true
# pageType 可省略 → 按小节推导：有 ## 表格 = crud-module
---

## 查询 - 用户信息检索

### 布局                  # 可选；纯描述不生成代码；含「GvDrawer/GvDialog」指令时生效

| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 用户姓名 | text_1 | text | isAny | 30 |
| 用户状态 | select_2 | dic | isDic | 6 | dic=yxzt |

## 表格 - 用户信息列表

| 名称 | 字段 | 宽度 | 筛选 | 类型 | 固定 | 扩展 |
| 操作 | | 80 | | action:编辑,编辑 | Y |
| 用户姓名 | text_1 | 150 | Y | | Y |
| 状态 | text_3 | | Y | dic:xb |
| 金额 | text_4 | | | | | amount, align: right |
| 部门 | text_5 | 200 | | | | type=tag |

### 表格工具栏 - 用户信息列表    # 可选；顿号分隔 → Index 页工具栏按钮

新增、导入、导出

### 操作列规则 - 用户信息列表    # 可选；`按钮名：行为描述` → 占位方法注释

- 编辑：点击后打开「用户信息表单」（Drawer）

---

## 编辑表单 - 用户信息表单

### 布局

使用 GvDrawer 展示

### 登录信息（GvDescriptions）    # 只读描述子区 → build<User>LoginInfoHeadList

| 名称 | 字段 | 占用列 | 类型 | 扩展 |
| 文本项 | text_1 | 1 |

### 基本信息（GvForm）            # 可编辑子区 → create<User>BasicInfoList（注解省略默认 GvForm）

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 单行文本 | text_2 | text | Y | isAny | 30 | | 1 | placeholder: 请输入 |

### 按钮                         # Drawer footer；顿号分隔（保存=提交校验+save/update，取消=关闭）

保存、取消
```

### 生成结果示例（以上配置自动推导）

- pageType `crud-module`（有 `## 表格`）；frontendOnly（无 api 块）→ **无 `src/api`**，生成 `data.ts`
- `<Base>` 推导：feature `userMng1` 不以 `Mng` 结尾 → `<Base> = UserMng1`（保持原样转 PascalCase）
- `src/views/sysMng/userMng/UserMng1Index.vue`：工具栏 = 新增 / 导入 / 导出；操作列含两个「编辑」按钮（重复写法不去重）；金额列右对齐 + `amountFormat`；状态列 `dic:xb`；部门列 tag
- `src/views/sysMng/userMng/module/helper.tsx`：`createUserMng1SearchList` / `createUserMng1TableHeadList` / `createUserMng1BasicInfoList` / `buildUserMng1LoginInfoHeadList`
- `src/views/sysMng/userMng/module/types.d.ts`、`module/data.ts`（本地 mock）
- `UserMng1Edit.vue`：GvDrawer + 登录信息只读 `GvDescriptions` 块 + 基本信息 `GvForm` + footer 保存 / 取消
- `UserMng1Info.vue`：`infoPage: true` 且无 `## 详情` → 字段回落「登录信息（GvDescriptions）」子区（见 info.md 字段来源）

---

## 精简格式（兼容）

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
编辑,删除,用户登录明细

## 明细
- name: loginLog
  label: 用户登录明细
  api: /sysuser/findUserLoginInfo
  columns:
    - label: 登录IP
      prop: loginIp
      width: 150
    - label: 所属地区
      prop: loginDivision
    - label: 浏览器
      prop: browser
    - label: 登录时间
      prop: loginTime
      width: 180

## 扩展列
expand

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit,value=admin |
| 状态 | status | dic | Y | idDic | 6 | N | 1 | dic=yxzt |
| 组织级别 | orgLevel | dic | Y | idDic | 10 | N | 1 | dic=zzjb,value=100601,showLabel=集团公司 |
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

## 多分区编辑 + 多 Tab 页

```markdown
---
feature: orderMng
title: 订单管理
view: sysMng/orderMng
pageType: crud-module
layout: module
editPage: true
i18n: false
api:
  module: admin/order
  base: /order
  operations:
    list: /order/findOrders
    create: /order/saveOrder
    update: /order/updateOrder/{id}
    delete: /order/deleteOrder
---

## 查询
| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 订单号 | u@orderNo | text | isNumberLetter | 30 | |
| 状态 | u@status | dic | isDic | 6 | dic=ddzt |

## 表格
| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| 订单号 | orderNo | 180 | Y | |
| 客户名称 | customerName | 150 | Y | |
| 金额 | amount | 120 | | amount |
| 状态 | status | 100 | | dic:ddzt |

## 操作列
编辑,删除

## 编辑
### 基本信息
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 订单号 | orderNo | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit |
| 客户名称 | customerName | text | Y | isAny | 60 | N | 1 | |
| 金额 | amount | number | Y | isDouble | 12 | N | 1 | |

### 开票信息
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 发票抬头 | invoiceTitle | text | Y | isAny | 100 | N | 1 | |
| 税号 | taxNo | text | | isAny | 20 | N | 1 | |
| 开户银行 | bankName | text | | isAny | 60 | N | 1 | |

## 按钮
保存,取消

## 标签页
- name: orderDtl
  label: 订单明细
  type: table
  columns:
    - label: 商品名称
      prop: productName
    - label: 数量
      prop: quantity
    - label: 单价
      prop: price
  buttons: 新增,删除
  api:
    list: /order/findOrderDtl
    save: /order/saveOrderDtl
    delete: /order/deleteOrderDtl

- name: remark
  label: 备注信息
  type: form
  fields:
    - { label: '备注', field: 'remark', type: 'textarea', format: [0, 'isAny', 200] }
  buttons: 保存
  api:
    save: /order/saveRemark
```

---

## 配置项速查

### 字段扩展

| 写法 | 含义 |
| ---- | ---- |
| `dic=yxzt` | 字典编码（写法全集见 [search-conditions.md](search-conditions.md#4-字典字段)：`multiple` / `value=` / `showLabel=` / `filtercode`） |
| `date=daterange` | 日期类型 |
| `remote=findDictFromTableApi` | 远程字典 |
| `disabledOnEdit` | 编辑时禁用 |

### 表格「类型」列

| 写法 | 含义 |
| ---- | ---- |
| 留空 | text |
| `dic:yxzt` | 字典列 |
| `date:datetime` | 日期列 |
| `amount` | 金额列（自动右对齐 + `amountFormat`） |
| `action:编辑,删除` | 操作列（视觉稿格式行内声明，按钮名不去重；优先于 `## 操作列` 小节，设计器导出不再双写该小节） |
| `multiHeader`（组名写在「名称」列，字段留空） | 多级表头分组起始行，其后连续带字段行作子列（生成 `multiLabel` + `heads`，见 [helper.md §7.1](templates/helper.md#71-多级表头类型multiheader)）；兼容旧写法 `multi:<分组名>` |

### 表格「固定 / 扩展」列（视觉稿格式，可选）

| 列 / 写法 | 含义 |
| ---- | ---- |
| `固定` = `Y` | `fixed`（方向查 MCP：操作列右、数据列左） |
| `align: right`（left / center / right） | 列对齐 |
| `amount` | 右对齐 + `amountFormat` |
| `type=tag` | 标签列（GvTag，颜色查 MCP） |
| `dic=yxzt` | 同 `类型` 列 `dic:yxzt` |

> 编辑子区组件注解（`（GvForm）` / `（GvDescriptions）`）与 `### 按钮` 写法见上方视觉稿模板内联注释。

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
