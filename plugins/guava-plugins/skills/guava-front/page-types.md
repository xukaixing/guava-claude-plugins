# 页面类型（pageType）

guava-front 按 `pageType` 选择生成模板与输出文件。**省略时默认为 `crud-module`**。

---

## 类型总览

| pageType | 说明 | 参考页 | 模板 |
| -------- | ---- | ------ | ---- |
| `crud-module` | 搜索 + 表格 + Drawer | `sysMng/userMng2` | crud / edit |
| `tabs` | GvTabs 多 Tab | `demo/demoFormTabs` | tabs |
| `form-only` | 纯表单 | `sysMng/systemConfig` | form |
| `free` | 自由布局（看板 / 复合页 / 报表） | — | free |

---

## 决策树

```
需要列表查询？
  ├─ 否 → 纯表单页？
  │        ├─ 是 → pageType: form-only
  │        └─ 否（自定义布局/看板/复合页）→ pageType: free
  └─ 是 → 编辑入口形式？
           ├─ Drawer 弹层（标准管理页）→ pageType: crud-module
           └─ 多 Tab 合一（含 Tab 内嵌表单）→ pageType: tabs
```

---

## crud-module（默认）

标准 CRUD 管理页。

### YAML 关键字段

| 字段 | 必填 | 说明 |
| ---- | ---- | ---- |
| `pageType` | | 省略或 `crud-module` |
| `frontendOnly` | | `true` = 仅前端：无 api，列表用 `data.ts` |
| `layout` | | `module`（默认）或 `flat` |
| `editPage` | | add / edit 启用时是否生成 Edit.vue |
| `subTable` | | 是否主子表（Edit Variant B） |

### 配置表

| 表 | 必填 | 用途 |
| ---- | ---- | ---- |
| 查询 | ✅ | 搜索表单 |
| 表格 | ✅ | 列表列 |
| 编辑 | add / edit 时 | Drawer 表单 |
| 子表列 | subTable 时 | 主子表明细 |
| 示例数据 | frontendOnly 可选 | 填充 `data.ts` |

### 模板映射

| 文件 | 模板 |
| ---- | ---- |
| Index | [templates/crud.md](templates/crud.md) |
| data.ts | [templates/data.md](templates/data.md)（仅 frontendOnly） |
| Edit A（纯表单） | [templates/edit.md](templates/edit.md) Variant A |
| Edit B（主子表） | [templates/edit.md](templates/edit.md) Variant B |

---

## tabs

多 Tab 页面。第一个 Tab 通常是「查询-列表」，其余 Tab 可内嵌 `GvForm`。

### YAML 关键字段

| 字段 | 必填 | 说明 |
| ---- | ---- | ---- |
| `pageType` | ✅ | `tabs` |
| `editMode` | | 列表 Tab 编辑方式：`drawer`（默认）或 `inline` |
| `tabs` | ✅ | Tab 定义数组 |

### tabs 数组项

```yaml
tabs:
  - name: list
    label: 查询-列表
    type: search-table
  - name: edit
    label: 新增-修改
    type: inline-form
```

| type | 使用的配置表 | 生成内容 |
| ---- | ------------ | -------- |
| `search-table` | 查询 + 表格 | GvForm 搜索 + GvTable；add / edit 按 `editMode` |
| `inline-form` | 编辑 | Tab 内 GvForm + 保存按钮 |

### 模板映射

| 文件 | 模板 |
| ---- | ---- |
| Index | [templates/tabs.md](templates/tabs.md) |
| Edit（drawer） | [templates/edit.md](templates/edit.md) Variant A |
| helper | [templates/helper.md#tabs](templates/helper.md#tabs) |

---

## form-only

纯编辑 / 配置页：整页一个或多个分区 `GvForm`，无 `GvTable`、无搜索区。

### YAML 关键字段

| 字段 | 必填 | 说明 |
| ---- | ---- | ---- |
| `pageType` | ✅ | `form-only` |
| `layout` | | 通常 `flat` |

### 配置表

| 表 | 必填 | 用途 |
| ---- | ---- | ---- |
| 编辑 | ✅ | 表单字段（复用「编辑」表结构） |
| 查询 | — | 不使用 |
| 表格 | — | 不使用 |

> 组件命名：`<Component>.vue`（如 `SystemConfig.vue`），不用 `Index` 后缀。

### 模板映射

| 文件 | 模板 |
| ---- | ---- |
| 主页面 | [templates/form.md](templates/form.md) |
| helper | [templates/helper.md#form-only](templates/helper.md#form-only) |
| types | [templates/types.md#form-only](templates/types.md#form-only) |
| API | [templates/api.md#form-only](templates/api.md#form-only) |

---

## free（自由布局）

无固定查询 / 列表 / 编辑结构。适用于看板、仪表盘、复合操作页、报表页。

### YAML 关键字段

| 字段 | 必填 | 说明 |
| ---- | ---- | ---- |
| `feature` | ✅ | 业务域 |
| `title` | ✅ | 页面中文标题 |
| `view` | ✅ | `src/views/` 下路径 |
| `pageType` | ✅ | `free` |
| `frontendOnly` | | 通常 `true` |

### 配置结构

```markdown
## 页面描述
<自然语言描述页面布局意图>

## 组件清单
| 组件 | 用途 | 关键 props |

## 数据
<内联数据或数据获取逻辑>
```

### 生成规则

1. 解析 `## 页面描述` 理解布局意图
2. 解析 `## 组件清单` 确定 Gv* 组件
3. 解析 `## 数据` 提取内联数据
4. 每个组件查询 MCP 确认 props
5. 生成单文件 Vue 组件（遵循 vue.md 格式）

### 输出

```
src/views/<view>/<Feature>.vue    ← 唯一主页面
```

**不生成**：helper.tsx、types.d.ts、API 文件。
