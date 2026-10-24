# 配置文件解析规则

读取 `.md` 配置 → 解析 → **自动推导** 路径/方法名/API 名 → 生成代码。

支持：**视觉稿格式（推荐）** + 精简格式 + 旧版格式（兼容）。

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

## 1. 视觉稿格式（推荐）

最接近产品原型稿的写法：小节带 `- 描述` 后缀、每节可有 `### 布局` 意图文本、表格 7 列、操作列行内声明、编辑子区带组件注解。**YAML 可省略 `pageType` / `api`**。

### 1.1 YAML 头

```yaml
---
feature: userMng1          # 命名/i18n/方法前缀（非目录）
title: 用户管理
view: sysMng/userMng       # 唯一决定 src/views/<view>/
layout: module             # module（默认）| flat
i18n: false
editPage: true             # 生成 <Base>Edit.vue
infoPage: true             # 生成 <Base>Info.vue（## 详情 小节，见 info.md）
frontendOnly: true         # 可省略：无 api 块时默认 true（1.9）
# pageType 可省略 → 按小节推导（1.8）
---
```

### 1.2 小节识别

| 小节 | 说明 |
| ---- | ---- |
| `## 查询 - <描述>` | 搜索表单（后缀可省） |
| `## 表格 - <描述>` | 列表 |
| `## 编辑表单 - <描述>` | 新增/编辑（`## 编辑` 兼容别名） |
| `## 标签页` / `## 明细` / `## 详情` / `## 改进` | 同精简格式规则 |

- 按 `-` 前前缀匹配；`- 描述` 作为区块标题文案（Edit Drawer 标题、搜索区分隔等）
- `---` 分隔线忽略
- `### 布局` 见 1.3；表格下 `### 表格工具栏` / `### 操作列` / `### 操作列规则` 见 1.5 / 1.6

### 1.3 `### 布局`（可选，布局意图）

| 内容 | 处理 |
| ---- | ---- |
| 含容器指令（如「使用 GvDrawer 展示」） | 生效：GvDrawer（默认）；出现「GvDialog」→ 对话框变体（edit.md / info.md Variant B） |
| 纯描述（如「用户信息检索布局描述」） | 不生成代码，仅作生成语义上下文 |

### 1.4 表格 7 列

`名称|字段|宽度|筛选|类型|固定|扩展`（后两列可缺省 → 兼容精简格式 5 列）

| 列 | 取值 | 生成 |
| ---- | ---- | ---- |
| `固定` | `Y` | `fixed`（方向生成前查 MCP `get_props` GvTable head 属性；操作列默认右固定、数据列左固定） |
| `类型` | `multiHeader`（组名写在「名称」列，字段留空） | 多级表头分组起始行：生成 `{ label, prop, multiLabel, heads }`，其后连续带字段行作子列（映射见 [helper.md §7.1](templates/helper.md#71-多级表头类型multiheader)）；兼容旧写法 `multi:<分组名>` |

`扩展` 逗号分隔多值，取值与 `TableHeadItem` 属性映射见 [helper.md §7](templates/helper.md#7-数值列格式化--表格视觉稿扩展)（`amount` / `align:` / `type=tag` / `dic=`）；属性名生成前查 MCP `get_props` GvTable。

### 1.5 操作列（行内声明优先）

表格内 `类型` 为 `action:按钮1,按钮2` 的行 = 操作列定义（字段列留空）：

```markdown
| 操作 | | 80 | | action:编辑,编辑 | Y |
```

- 按钮名按顿号 / 逗号分隔，**原样写入 `content`，不去重**（「编辑、编辑」= 两个按钮）
- `action` 回调映射：`编辑 → actions.edit<Feature>`、`删除 → actions.delete<Feature>`、`详情 / 查看 → actions.info<Feature>`；其余按钮生成同名占位方法
- 表格无 `action:` 行 → 回落 `### 操作列` 小节（精简格式逻辑）；两处同时存在**以行内为准**，不校验一致性
- `### 操作列规则` bullets（如 `**编辑**：点击后打开「用户信息表单」（Drawer）`）→ 非标准动作占位方法的方法体 / JSDoc 注释依据；标准动作用于校验既有行为，不重复生成

### 1.6 `### 表格工具栏`

顿号分隔按钮名 → Index 页表格工具栏，按钮名原样写入、不去重。按钮→方法映射（新增 / 导入 / 导出 / 批量删除 / 占位）见 [crud.md §3.3](templates/crud.md#33-工具栏按钮映射表格工具栏)。

### 1.7 编辑表单子区（组件注解）

`## 编辑表单` 下 `###` 子标题的组件注解决定生成：

| 子标题 | 生成 |
| ---- | ---- |
| `### 基本信息（GvForm）` | `create<Feature><Section>List`（多分区规则同 helper §10；**注解省略时默认 GvForm**，兼容旧格式） |
| `### 登录信息（GvDescriptions）` | `build<Feature><Section>InfoHeadList`（`DescItemHead[]`，表结构 `名称|字段|占用列|类型|扩展`，规则同 info.md）；Edit.vue 内渲染**只读** `<GvDescriptions>` 块，数据来自 rowData（props 查 MCP）。`infoPage: true` 且无 `## 详情` 时，Info 页字段回落到该子区（再缺省回落 `## 表格` 列，见 info.md） |

`### 按钮`：顿号分隔 → Drawer footer：

| 按钮 | 行为 |
| ---- | ---- |
| 保存 | `crud.checkForms` 校验 + `crud.save / crud.update` 提交 |
| 取消 | 关闭 Drawer |
| 其他 | 同名占位方法 |

多个 `## 编辑表单 - <描述>` 小节：每个生成独立 Edit 子组件；首个为主编辑（表格「新增 / 编辑」入口），其余按标题注解生成对应容器（如 `（GvDialog，宽度 50%）` → `GvDialog` + `width="50%"`）。

编辑表单项 `扩展` 关键字 `suffixBtn=<图标名>:<子表单>(<容器>)`（仅 `类型=text`）：

| 部分 | 语义 |
| ---- | ---- |
| `<图标名>` | GvInput 后缀图标 → FormItem `suffixIcon`（GvIcon 图标名，属性 / 事件以 MCP `get_props` GvInput 为准） |
| `<子表单>` | 点击后弹出的子表单标题，必须存在对应 `## 编辑表单 - <子表单>` 小节 |
| `(<容器>)` | 弹窗容器 `Dialog` / `Drawer`，与目标小节注解一致时可省略 |

生成规则见 [edit.md §2.2](templates/edit.md#22-弹窗子表单扩展suffixbtn) 与 [helper.md §8](templates/helper.md#8-format--日期--只读--占用列)。

### 1.8 pageType 推导（YAML 显式时优先）

| 小节特征 | 推导 |
| ---- | ---- |
| 有 `## 表格` | `crud-module` |
| 仅 `## 编辑表单`（无查询 / 表格） | `form-only` |
| 有 `## 标签页` | `tabs` |
| `## 页面描述` + `## 组件清单` | `free` |

### 1.9 api 推导

无 `api` 块且未标 `frontendOnly` → **视同 `frontendOnly: true`**：`src/api/**` 不生成，`data.ts` 必生成（`getListResult` / `filterListRecords`）。

### 1.10 占位字段与 `u@`

- 字段列**原样使用**（`text_1`、`select_2` 等），禁止自动改名
- 查询表 `u@` 前缀**可选**：省略则直接用字段名（语义不变，见 search-conditions §5）

---

## 2. 精简格式（兼容）

### 2.1 YAML 头

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

### 2.2 frontendOnly

| 项 | 行为 |
| ---- | ---- |
| `api` 节点 | 省略 |
| `src/api/**` | 不生成 |
| `data.ts` | 必生成 |
| 列表查询 | `getListResult` / `filterListRecords` |

### 2.3 view = 目录

**`src/views/` 目录 = YAML `view` 原文**。

| 配置 | 正确 | 错误 |
| ---- | ---- | ---- |
| `view: sysMng/userMng2` | `src/views/sysMng/userMng2/` | `sysMng/userMng/` |

### 2.4 配置表

**查询** 6 列：`名称|字段|类型|校验|长度|扩展`（校验必填，字段带 `u@`）
**表格** 5 列：`名称|字段|宽度|筛选|类型`（字段无 `u@`）
**编辑** 9 列：`名称|字段|类型|必填|校验|长度|只读|占用列|扩展`

### 2.5 表格级声明

| 小节 | 必须 | 说明 |
| ---- | ---- | ---- |
| `## 操作列` | ✅ | 逗号分隔按钮名 |
| `## 扩展列` | | `expand` 或完整配置 |
| `## 表格工具栏` | | 按钮名 + `import,export` |

### 2.6 扩展列配置

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

### 2.7 多分区编辑

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

**解析规则**：每个 `###` 子标题 → 一个 `GvForm`（`:divider` = 子标题），工厂命名 / `formRefs` 校验 / `getFormModel` 合并见 [helper.md §10](templates/helper.md#10-多分区编辑variant-c--d)。

### 2.8 明细展开（Detail Table）

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

### 2.9 多 Tab 页

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

### 2.10 改进

`## 改进` 小节支持布局/样式/交互微调。生成后逐条应用。

---

## 3. 自动推导

### 3.1 componentBaseName

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

### 3.2 方法名 / API 名

| key | 方法名 | API 名 | HTTP |
| --- | ------ | ------ | ---- |
| `list` | `search{Entity}List` | `{末段}Api` | POST |
| `create` | `add{Entity}` | `{末段}Api` | POST |
| `update` | `edit{Entity}` | `{末段}Api` | PUT |
| `delete` | `delete{Entity}` | `{末段}Api` | POST |

### 3.3 form-only 方法名

| key | 方法名 | API 名 |
| --- | ------ | ------ |
| `get`/`find` | `load{Component}` | `get{Component}Api` |
| `save` | `save{Component}` | `save{Component}Api` |

### 3.4 文件清单

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

## 4. 旧版格式（兼容）

| 旧字段 | 新字段 |
| ------ | ------ |
| `featureName` | `feature` |
| `viewPath` | `view` |
| `apiModule` | `api` |
| `generateEditPage` | `editPage` |

---

## 5. 校验清单

- crud-module：`api.operations.list` 已填（视觉稿格式缺 `api` 不报错，默认 frontendOnly）；查询/编辑校验齐全
- tabs：`tabs` 数组 ≥1 项
- form-only：编辑表校验齐全；无查询/表格

---

## 6. 生成顺序

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
