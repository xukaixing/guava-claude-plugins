# 配置文件解析规则

读取 `.md` 配置 → 解析 → **自动推导** 路径/方法名/API 名 → 生成代码。

支持：**视觉稿格式（推荐，本文档 §1）** + 精简格式 + 旧版格式（兼容，[config-parser-legacy.md](config-parser-legacy.md)）。

## 格式识别（先识别，再读对应文档）

| 特征 | 格式 | 读哪 |
| ---- | ---- | ---- |
| 小节带 `- 描述` 后缀 / `### 布局` / 表格 7 列 / 操作列行内 `action:`；YAML 可省 `pageType` / `api` | 视觉稿 | 本文档 §1 |
| YAML 含 `pageType` + `api` 块；表格 5 列；`## 操作列` / `## 扩展列` / `## 表格工具栏` 小节 | 精简 | config-parser-legacy.md |
| YAML 字段为 `featureName` / `viewPath` / `apiModule` / `generateEditPage` | 旧版 | config-parser-legacy.md（字段映射后按精简解析） |

识别出精简 / 旧版 → 停下读 [config-parser-legacy.md](config-parser-legacy.md)，本文档只需保留 §3 自动推导 / §5 校验 / §6 生成顺序。

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
infoPage: true             # 生成 <Base>Info.vue（## 详情 小节，见 info.md）
# 以下默认值可省略：layout: module / i18n: false / editPage: true / infoPage: false / frontendOnly: true
# pageType 可省略 → 按小节推导（1.8）；无 api 块时默认 frontendOnly: true（1.9）
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

`名称|字段|宽度|筛选|类型|固定|扩展`（后两列可缺省 → 兼容精简格式 5 列）。

> 表格**不写 Markdown 分隔行**（`|------|`），行尾空单元格可裁剪 —— 列按表头名定位，与分隔行 / 补齐单元格无关；旧格式带分隔行同样兼容。

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
- 表格无 `action:` 行 → 回落 `### 操作列` 小节（精简格式逻辑）；两处同时存在**以行内为准**，不校验一致性；GvAIDesigner 导出已不再双写 `### 操作列`
- `### 操作列规则` bullets 两种写法等价（`**编辑**：…` 或省 token 的 `编辑：…`）→ 非标准动作占位方法的方法体 / JSDoc 注释依据；标准动作用于校验既有行为，不重复生成

### 1.6 `### 表格工具栏`

顿号分隔按钮名 → Index 页表格工具栏，按钮名原样写入、不去重。按钮→方法映射（新增 / 导入 / 导出 / 批量删除 / 占位）见 [crud.md §3.3](templates/crud.md#33-工具栏按钮映射)。

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
