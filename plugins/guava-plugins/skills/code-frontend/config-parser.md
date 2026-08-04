# 配置文件解析规则

读取 `.md` 配置 → 解析 → **自动推导** 路径/方法名/API 名 → 生成代码。

支持：**精简格式（推荐）** + **旧版格式（兼容）**。

---

## 0. CRUD 方法来源

`crud.*` 以 **GvCrud MCP** 为准：

| 场景 | 方法 |
| ---- | ---- |
| 列表查询（有表单） | `crud.search(fm, table, fetch)` |
| 列表查询（无表单） | `crud.searchNoFm(table, fetch, data)` |
| 通用获取/提交 | `crud.fetchData` / `crud.submit` |
| 新增/编辑保存 | `crud.save(fm, fetch)` / `crud.update(fm, id, fetch)` |
| 表单回填/重置 | `crud.setEditValue(list, row)` / `crud.resetEditValue(list)` |
| 本地行操作 | `crud.insertResult` / `crud.updateResult` / `crud.removeResult` |

> 导入：`import { crud } from 'guava-ui'` 或 `@/hook/service/useCrud`

---

## 1. 精简格式

### 1.1 YAML 头

```yaml
---
feature: userMng
title: 用户管理
view: sysMng/userMng2
pageType: crud-module
layout: module
i18n: false
editPage: true
api:
  module: admin/user
  base: /sysuser
  operations:
    list: /sysuser/findUsers
    create: /sysuser/saveUser
    update: /sysuser/updateUser/{id}
    delete: /sysuser/deleteUser
---
```

| 字段 | 映射 |
| ---- | ---- |
| `feature` | 命名/i18n/方法前缀（**非目录**） |
| `view` | **唯一**决定 `src/views/<view>/` |
| `pageType` | `crud-module`（默认）\| `tabs` \| `form-only` \| `free` |
| `i18n` | `false`（默认）= 仅中文 |
| `api.operations` | 操作端点 |

### 1.2 frontendOnly

| 项 | 行为 |
| ---- | ---- |
| `api` 节点 | 省略 |
| `src/api/**` | 不生成 |
| `data.ts` | 必生成 |
| 列表查询 | `getListResult` / `filterListRecords` |

### 1.3 view = 目录

**`src/views/` 目录 = YAML `view` 原文**。

| 配置 | 正确 | 错误 |
| ---- | ---- | ---- |
| `view: sysMng/userMng2` | `src/views/sysMng/userMng2/` | `sysMng/userMng/` |

### 1.4 配置表

**查询** 6 列：`名称|字段|类型|校验|长度|扩展`（校验必填，字段带 `u@`）
**表格** 5 列：`名称|字段|宽度|筛选|类型`（字段无 `u@`）
**编辑** 9 列：`名称|字段|类型|必填|校验|长度|只读|占用列|扩展`

### 1.5 表格级声明

| 小节 | 必须 | 说明 |
| ---- | ---- | ---- |
| `## 操作列` | ✅ | 逗号分隔按钮名 |
| `## 扩展列` | | `expand` 或完整配置 |
| `## 表格工具栏` | | 按钮名 + `import,export` |

### 1.6 扩展列配置

```markdown
## 扩展列
expand                # 简写 = type: table
# 或：
expand:
  type: table         # table | custom | both
  columns:
    - label: xxx
      prop: xxx
  template:           # custom/both 时
    <div>{scope.row.xxx}</div>
```

| type | 生成内容 |
| ---- | -------- |
| `table` | 子表 `GvTable`（无 ElForm）+ 数据拉取 |
| `custom` | 自定义 div |
| `both` | 自定义 div + 子表 |

### 1.7 多分区编辑

`## 编辑` 下用 `###` 子标题拆分多个表单区域：

```markdown
## 编辑
### 基本信息
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit |

### 开票信息
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 发票抬头 | invoiceTitle | text | Y | isAny | 100 | N | 1 | |
```

**解析规则**：
- 每个 `###` 子标题 → 一个 `GvForm`，`:divider` = 子标题文本
- helper 工厂函数名 = `create<Feature><SectionName>List`（SectionName 为子标题去空格 PascalCase）
- 多个表单 ref 放入 `formRefs` 数组，保存时 `crud.checkForms(formRefs)` 统一校验
- `getFormModel` 依次合并所有表单模型数据

### 1.8 明细展开（Detail Table）

操作列自定义按钮 + 展开明细表格模式，用于关联数据异步拉取（如用户登录明细）。

```markdown
## 明细
- name: loginLog
  label: 用户登录明细
  api: /sysuser/findUserLoginInfo
  columns:
    - label: 登录IP
      prop: loginIp
    - label: 登录时间
      prop: loginTime
```

**解析规则**：
- `name` → helper 函数名 `build<DetailName>HeadList`，Index 方法名 `show<DetailName>`
- `label` → 操作列按钮文案
- `api` → 自动推导 API 函数名 `find<DetailName>Api`，需追加到 `src/api/<module>.ts`
- `columns` → 明细表格列配置（`TableHeadItem[]`）
- 数据拉取：`crud.fetchTable(fetch, { <parent>Id: row.id })`
- 渲染方式：返回 render 函数，`table-type="detail"`
- 按钮追加到操作列末尾，icon 用 `gv-icon-daiban`

### 1.9 多 Tab 页

`## 编辑`（含多分区）基础上增加 `## 标签页` 小节：

```markdown
## 标签页
- name: orderDtl
  label: 订单明细
  type: table
  columns:
    - label: 商品名称
      prop: productName
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

**解析规则**：
- `type: table` → `GvTable` + 工具栏按钮，数据用 `crud.searchNoFm` 按 masterId 拉取
- `type: form` → `GvForm` + 保存按钮，数据用 `crud.setEditValue` / `crud.resetEditValue`
- `table` 类型用 `v-show="masterId !== 0"` 控制显隐（新增时隐藏）
- `form` 类型始终显示
- Tab 列表 / 表单的 helper 工厂函数命名为 `create<Feature><TabName>TableHeadList` / `create<Feature><TabName>List`

### 1.10 改进

`## 改进` 小节支持布局/样式/交互微调。生成后逐条应用。

---

## 2. 自动推导

### 2.1 componentBaseName

**必须从 `feature` 推导，禁止从 `view` 推导。**

**规则**：仅当 `feature` 以 `Mng` 结尾时去除 `Mng` 后缀，其余情况保持原样转 PascalCase。

| feature | 结果 | 说明 |
| ------- | ---- | ---- |
| `userMng` | `User` | 去除 `Mng` |
| `salesSkills` | `SalesSkills` | 无 `Mng`，保持原样 |
| `svcStmtApply` | `SvcStmtApply` | 无 `Mng`，保持原样 |
| `systemConfig` | `SystemConfig` | 无 `Mng`，保持原样 |
| `component: Xxx` | 使用配置值 | 显式指定 |

> **禁止**：从 `view` 路径推导、去除 `Mng` 以外的后缀（如 `Apply`、`Config` 等）

### 2.2 方法名 / API 名

| key | 方法名 | API 名 | HTTP |
| --- | ------ | ------ | ---- |
| `list` | `search{Entity}List` | `{末段}Api` | POST |
| `create` | `add{Entity}` | `{末段}Api` | POST |
| `update` | `edit{Entity}` | `{末段}Api` | PUT |
| `delete` | `delete{Entity}` | `{末段}Api` | POST |

### 2.3 form-only 方法名

| key | 方法名 | API 名 |
| --- | ------ | ------ |
| `get`/`find` | `load{Component}` | `get{Component}Api` |
| `save` | `save{Component}` | `save{Component}Api` |

### 2.4 文件清单

```
src/api/<api>.ts                         ← frontendOnly 时省略
src/views/<view>/[module/]data.ts        ← 仅 frontendOnly
src/views/<view>/<Component>Index.vue
src/views/<view>/[module/]helper.tsx
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue  ← editPage + add/edit
src/locales/zh-CN.ts + en.ts
```

| layout | helper/types/Edit 位置 |
| ------ | ---------------------- |
| `module` | `src/views/<view>/module/` |
| `flat` | `src/views/<view>/` |

---

## 3. 旧版格式（兼容）

| 旧字段 | 新字段 |
| ------ | ------ |
| `featureName` | `feature` |
| `viewPath` | `view` |
| `apiModule` | `api` |
| `generateEditPage` | `editPage` |

---

## 4. 校验清单

- crud-module：`api.operations.list` 已填；查询/编辑校验齐全
- tabs：`tabs` 数组 ≥1 项
- form-only：编辑表校验齐全；无查询/表格

---

## 5. 生成顺序

| 顺序 | 文件 | 策略 |
| ---- | ---- | ---- |
| 1 | API | 缺函数追加 |
| 2 | types.d.ts | 覆盖 |
| 3 | helper.tsx | 覆盖 |
| 4 | data.ts（frontendOnly） | 覆盖 |
| 5 | Vue 主页 | 覆盖 |
| 6 | Vue Edit | 覆盖 |
| 7 | i18n | 替换分组 |
| 8 | 应用 `## 改进` | 局部调整 |
