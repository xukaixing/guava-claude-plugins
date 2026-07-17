# 页面类型（pageType）

guava-front 按 `pageType` 选择生成模板与输出文件。配置文件 YAML 头中 `pageType` **省略时默认为 `crud-module`**。

## 类型总览

| pageType | 说明 | 参考页 | 配置示例 | 模板 |
|----------|------|--------|---------|------|
| `crud-module` | 搜索+表格+Drawer | YAML `view`（如 `sysMng/userMng2`） | `src/pages/sysMng/userMng.md`（路径可与 view 不同） | index-page / edit-page |
| `tabs` | GvTabs 多 Tab | `demo/demoFormTabs` | `src/pages/demo/demoFormTabs.md` | index-page-tabs |
| `form-only` | 纯表单 | `sysMng/systemConfig` | `src/pages/sysMng/systemConfig.md` | form-only-page |

## 决策树

```
需要列表查询？
  ├─ 否 → pageType: form-only
  └─ 是 → 编辑入口形式？
         ├─ Drawer 弹层（标准管理页）→ pageType: crud-module
         └─ 多 Tab 合一（含 Tab 内嵌表单）→ pageType: tabs
```

---

## crud-module（默认）

标准 CRUD 管理页，与现有 userMng 生成路径一致。

### YAML 关键字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `pageType` | | 省略或 `crud-module` |
| `frontendOnly` | | `true`=仅前端：无 api，列表用 `data.ts` |
| `layout` | | `module`（默认）或 `flat` |
| `crud` | ✅ | `search, add, edit, delete` 子集，`search` 必选 |
| `editPage` | | add/edit 启用时是否生成 Edit.vue |
| `subTable` | | 是否主子表（Edit Variant B） |
| `paths` | 有后端时 ✅ | find / save / update / delete；`frontendOnly` 时省略 |

### 配置表

| 表 | 必填 | 用途 |
|----|------|------|
| 查询 | ✅ | 搜索表单 |
| 表格 | ✅ | 列表列 |
| 编辑 | add/edit 时 | Drawer 表单 |
| 子表列 | subTable 时 | 主子表明细 |
| 示例数据 | frontendOnly 可选 | 填充 `data.ts` 的 records |

### 输出文件

```
src/api/<api>.ts                         ← frontendOnly 时省略
src/views/<view>/<Component>Index.vue
src/views/<view>/[module/]data.ts        ← 仅 frontendOnly
src/views/<view>/[module/]helper.tsx
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editPage 且 add/edit
src/locales/zh-CN.ts + en.ts
```

### 模板映射

| 文件 | 模板 |
|------|------|
| Index | [templates/index-page.md](templates/index-page.md)（含 frontendOnly 分支） |
| data.ts | [templates/data.md](templates/data.md)（仅 frontendOnly） |
| Edit A（纯表单） | [templates/edit-page.md](templates/edit-page.md) Variant A |
| Edit B（主子表） | [templates/edit-page.md](templates/edit-page.md) Variant B |

---

## tabs

多 Tab 页面，参考 `DemoForm.vue`：第一个 Tab 通常是「查询-列表」（可含 Drawer Edit），其余 Tab 可内嵌 `GvForm`。

### YAML 关键字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `pageType` | ✅ | `tabs` |
| `crud` | ✅ | 至少含 `search`；列表 Tab 的 add/edit/delete 同 crud-module |
| `editMode` | | 列表 Tab 编辑方式：`drawer`（默认）或 `inline` |
| `tabs` | ✅ | Tab 定义数组，见下 |
| `paths` | 有后端时 ✅ | 同 crud-module；`frontendOnly` 时省略 |

### tabs 数组项

```yaml
tabs:
  - name: list              # GvTabPane name，camelCase
    label: 查询-列表         # Tab 显示文案（可后续改 i18n）
    type: search-table      # 使用 ## 查询 + ## 表格
  - name: edit
    label: 新增-修改
    type: inline-form       # 使用 ## 编辑（Tab 内 GvForm，无 Drawer）
```

| type | 使用的配置表 | 生成内容 |
|------|-------------|---------|
| `search-table` | 查询 + 表格 | GvForm 搜索 + GvTable；add/edit 按 `editMode` |
| `inline-form` | 编辑 | Tab 内 GvForm + 保存按钮 |
| `form` | 编辑（或独立 ## Tab\<name\> 表） | 通用表单 Tab（组件演示等，后续扩展） |

> **约定**：`type: search-table` 的 Tab 通常只有一个；多个 `inline-form` / `form` Tab 可并列。复杂 Tab（多表格切换）见 `ClueCultivationIndex`，暂不在首版自动生成范围内。

### 配置表

| 表 | 条件 | 用途 |
|----|------|------|
| 查询 | 含 search-table Tab | 搜索表单 |
| 表格 | 含 search-table Tab | 列表列 |
| 编辑 | 含 inline-form Tab 或 editMode=inline | 内嵌表单字段 |
| 编辑 | editMode=drawer 且 add/edit | Drawer 表单（同 crud-module） |

### 输出文件

```
src/api/<api>.ts                               ← frontendOnly 时省略
src/views/<view>/<Component>Index.vue      ← GvTabs 容器
src/views/<view>/[module/]data.ts          ← 仅 frontendOnly
src/views/<view>/[module/]helper.tsx
src/views/<view>/[module/]types.d.ts
src/views/<view>/[module/]<Component>Edit.vue   ← editMode=drawer 时
src/locales/zh-CN.ts + en.ts
```

### 模板映射

| 文件 | 模板 |
|------|------|
| Index | [templates/index-page-tabs.md](templates/index-page-tabs.md) ✅ |
| Edit（drawer） | [templates/edit-page.md](templates/edit-page.md) Variant A |
| helper | [templates/helper.md#tabs](templates/helper.md#tabs) |
| i18n | [templates/i18n.md#tabs](templates/i18n.md#tabs) |

---

## form-only

纯编辑/配置页：整页一个（或多个分区）`GvForm`，无 `GvTable`、无搜索区。

### YAML 关键字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `pageType` | ✅ | `form-only` |
| `crud` | ✅ | `load, save` 或 `load, update`（无 search/add/delete） |
| `layout` | | 通常 `flat`；helper/types 与 Index 同目录 |
| `paths` | 有后端时 ✅ | `get`（或 `find`）+ `save`（或 `update`）；`frontendOnly` 时省略 |

```yaml
crud: load, save
paths:
  get: /sysconfig/getByKey
  save: /sysconfig/save
```

### 配置表

| 表 | 必填 | 用途 |
|----|------|------|
| 编辑 | ✅ | 表单字段（复用「编辑」表结构） |
| 查询 | — | 不使用 |
| 表格 | — | 不使用 |

### 输出文件

```
src/api/<api>.ts                               ← frontendOnly 时省略
src/views/<view>/<Component>.vue           ← 主表单页（非 Index 后缀）
src/views/<view>/[module/]data.ts          ← 仅 frontendOnly（mockFormModel）
src/views/<view>/helper.tsx
src/views/<view>/types.d.ts
src/locales/zh-CN.ts + en.ts
```

> 组件命名：`<Component>.vue`（如 `SystemConfig.vue`），与 `DemoForm.vue` 一致，不用 `Index` 后缀。

### 模板映射

| 文件 | 模板 |
|------|------|
| 主页面 | [templates/form-only-page.md](templates/form-only-page.md) ✅ |
| helper | [templates/helper.md#form-only](templates/helper.md#form-only) |
| types | [templates/types.md#form-only](templates/types.md#form-only) |
| API | [templates/api.md#form-only](templates/api.md#form-only) |
| i18n | [templates/i18n.md#form-only](templates/i18n.md#form-only) |

