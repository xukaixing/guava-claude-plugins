# 配置文件解析规则（精简 / 旧版兼容格式）

> 仅当 [config-parser.md](config-parser.md) 的格式识别判定为**精简格式或旧版格式**时读本文件；视觉稿格式（推荐）的全部规则在 config-parser.md，本文件不加载。

## 0. 格式识别速查

| 特征 | 格式 |
| ---- | ---- |
| 小节带 `- 描述` 后缀 / `### 布局` / 表格 7 列 / 操作列行内 `action:` | 视觉稿 → 回到 [config-parser.md](config-parser.md) §1 |
| YAML 含 `pageType` + `api` 块；表格 5 列；`## 操作列` / `## 扩展列` / `## 表格工具栏` 小节 | 精简格式 → 本文件 §1 |
| YAML 字段为 `featureName` / `viewPath` / `apiModule` / `generateEditPage` | 旧版格式 → 本文件 §2 字段映射后按精简格式解析 |

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

**解析规则**：每个 `###` 子标题 → 一个 `GvForm`（`:divider` = 子标题），工厂命名见 [helper.md §10](templates/helper.md#10-多分区编辑variant-c--d)；保存逻辑见 [edit.md §5](templates/edit.md#5-variant-c多分区表单--基座--增量)。

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

`## 编辑`（含多分区）基础上增加 `## 标签页` 小节。完整 YAML 示例见 [config-template.md](config-template.md#多分区编辑--多-tab-页)；字段速览：

```markdown
## 标签页
- name: orderDtl          # type: table → GvTable + 工具栏按钮，crud.searchNoFm 按 masterId 拉取，v-show="masterId !== 0"
  label: 订单明细
  type: table             # table | form；form → GvForm + 保存按钮，始终显示
  columns: [...]          # table: TableHeadItem[]
  fields: [...]           # form: FormItem[]
  buttons: 新增,删除
  api: { list, save, delete }
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

## 2. 旧版格式（兼容）

| 旧字段 | 新字段 |
| ------ | ------ |
| `featureName` | `feature` |
| `viewPath` | `view` |
| `apiModule` | `api` |
| `generateEditPage` | `editPage` |

字段映射后按 §1 精简格式解析。
