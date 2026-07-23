# Guava Page Config

> 复制下方内容，改 YAML 头 + 配置表即可。文件清单、方法名、API 函数名由 skill **自动推导**，无需手写。

**页面类型**由 `pageType` 决定，详见 [page-types.md](page-types.md)。省略时默认为 `crud-module`。

| pageType | 配置模板 | 示例 |
|----------|---------|------|
| `crud-module`（默认） | 下方默认块 | `src/pages/sysMng/userMng.md` |
| `tabs` | [tabs 配置块](#tabs-配置) | `src/pages/demo/demoFormTabs.md` |
| `form-only` | [form-only 配置块](#form-only-配置) | `src/pages/sysMng/systemConfig.md` |

## crud-module 配置（默认）

```markdown
---
feature: userMng          # 必填，camelCase
title: 用户管理            # 必填，中文标题
view: sysMng/userMng2     # 必填 → src/views/sysMng/userMng2/（可与 pages 文件名不同）
pageType: crud-module     # 可选，省略时等同 crud-module
layout: module            # 可选 module | flat，默认 module
editPage: true            # 可选，add/edit 有时默认 true
subTable: false           # 可选，主子表
# ↓ 有后端时声明 api 节点；frontendOnly: true 时整个节点省略
api:
  module: admin/user          # API 文件路径 → src/api/admin/user.ts
  base: /sysuser              # 后端根路径（注释参考用）
  operations:                 # 操作端点（key = 操作名，自动生成方法名 + API 名）
    list: /sysuser/findUsers
    create: /sysuser/saveUser
    update: /sysuser/updateUser/{id}
    delete: /sysuser/deleteUser
---

## 查询
<!-- 校验列必填，取值见 search-conditions.md（对齐 gv.validate.ts） -->

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
<!-- 校验列必填；字典必填用 idDic，非必填用 isDic；只读=Y→readonly: true；占用列=数字→colspan: N -->

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit |
| 状态 | status | dic | Y | idDic | 6 | N | 1 | dic=yxzt |
| 手机 | mobile | text | | isPhone | 11 | N | 1 | |
| 创建人 | createBy | text | | isAny | 30 | Y | 1 | |
| 备注 | remark | textarea | | isAny | 200 | N | 3 | |
```

### 仅前端（`frontendOnly: true`）

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
| 用户姓名 | userName | text | isAny | 60 | |

## 表格
| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| 用户账号 | account | 150 | Y | |
| 用户姓名 | userName | 150 | Y | |
| 状态 | status | 100 | | dic:yxzt |

## 操作列

编辑,删除

## 表格工具栏

新增编辑行,校验编辑行
import,export

## 编辑
<!-- 校验列必填；只读/占用列规则同上 -->
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | |
| 用户姓名 | userName | text | Y | isAny | 60 | N | 1 | |
| 状态 | status | dic | Y | idDic | 6 | N | 1 | dic=yxzt |
| 创建人 | createBy | text | | isAny | 30 | Y | 1 | |
| 备注 | remark | textarea | | isAny | 200 | N | 3 | |

## 示例数据
| id | account | userName | status |
| 1 | admin | 管理员 | 10601 |
| 2 | demo | 演示 | 10602 |
```

生成：`src/views/demo/userMngLocal/module/data.ts` + Index/Edit/helper…，**无** `src/api`。详见 [templates/data.md](templates/data.md)。

## tabs 配置

```markdown
---
feature: demoFormTabs
title: Demo 多 Tab 表单
view: demo/demoFormTabs
pageType: tabs
layout: flat
editMode: drawer          # drawer | inline（列表 Tab 编辑方式）
tabs:
  - name: list
    label: 查询-列表
    type: search-table
  - name: edit
    label: 新增-修改
    type: inline-form
# ↓ 有后端时声明 api 节点
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
<!-- 校验列必填，取值见 search-conditions.md -->
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 站点名称 | siteName | text | Y | isAny | 60 | N | 1 | |
| 维护模式 | maintenanceMode | dic | | isDic | 6 | N | 1 | dic=yxzt |
| 备注 | remark | textarea | | isAny | 200 | N | 3 | |
```

> form-only **不需要** ## 查询 / ## 表格 表；**编辑表校验列仍必填**。

## YAML 头说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `feature` | ✅ | 业务域，如 `userMng` |
| `title` | ✅ | 页面中文标题 |
| `view` | ✅ | **唯一**决定 `src/views/<view>/`；勿用 pages 路径代替 |
| `pageType` | | `crud-module`（默认）\| `tabs` \| `form-only` |
| `layout` | | `module`（默认）或 `flat` |
| `component` | | Vue 组件前缀，省略时从 feature 推导 |
| `i18n` | | 多语言分组，省略时用 feature |
| `editPage` | | crud-module：是否生成 Edit 页 |
| `subTable` | | crud-module：是否主子表 |
| `editMode` | | tabs：列表 Tab 编辑方式 `drawer`（默认）\| `inline` |
| `tabs` | tabs 时 ✅ | Tab 定义数组，见 [page-types.md](page-types.md#tabs) |
| `api` | 有后端时 ✅ | 后端 API 节点；`frontendOnly: true` 时省略 |
| `api.module` | 有后端时 ✅ | API 文件路径，如 `admin/user` → `src/api/admin/user.ts` |
| `api.base` | | 后端根路径（注释参考） |
| `api.operations` | 有后端时 ✅ | 操作端点映射（key = 操作名） |

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

## 操作列 / 扩展列配置（表格级，单独声明）

操作列与扩展列为**表格级属性**，在 `## 表格` 下方通过独立的 `## 操作列` / `## 扩展列` 小节声明，**不写在表格列定义中**。

### `## 操作列`（必须）

逗号分隔的中文按钮名，生成 `content` + `action`：

```markdown
## 操作列
编辑,删除
```

| 按钮名 | 对应 TableActions 方法 |
|--------|----------------------|
| `编辑` | `edit<Feature>` |
| `删除` | `delete<Feature>` |
| 自定义（如 `停用`） | 需在 `types.d.ts` 的 `TableActions` 声明对应方法 |

生成结果示例：
```typescript
{
  type: 'action',
  prop: '',
  label: t('table.action'),
  content: ['编辑', '删除'],
  action: [actions.edit<Feature>, actions.delete<Feature>],
}
```

**不生成 `icon` 属性**。

### `## 扩展列`（可选）

含 `expand` 时生成展开列：

```markdown
## 扩展列
expand
```

展开列自动生成：
- `create<Feature>ExpandTableHeadList` 子表列工厂
- `expandMap`（`reactive<Recordable<Recordable<any>>>`）行数据缓存
- `expandChange` 事件（展开时按需拉取子表数据）
- Index 页 GvTable 绑定 `@expand-change="expandChange"`

## 表格工具栏配置（可选，表格级）

表格工具栏为 GvTable 上方的按钮区域，在 `## 表格工具栏` 单独声明。

格式：两行
- 第 1 行：逗号分隔的中文按钮名（生成 `<GvButton>`）
- 第 2 行：`import,export`（可选，生成 `#import` / `#export` 插槽）

### 配置示例

```markdown
## 表格工具栏
新增编辑行,校验编辑行
import,export
```

### 按钮名与方法对应

| 按钮名 | 对应方法（自动推导） |
|--------|---------------------|
| 首个按钮（如 `新增编辑行`） | 默认绑定 `add<Feature>`（add enabled 时）；自定义方法需在 Index 声明 |
| 其他按钮（如 `校验编辑行`） | 需在 Index 声明对应方法（如 `check<Feature>`） |

### 生成结果示例

```vue
<GvTable ...>
  <GvButton @click="add<Feature>()">新增编辑行</GvButton>
  <GvButton @click="check<Feature>()">校验编辑行</GvButton>
  <template #import>
    <GvImportDialog :import="importApi" :params="importParams" :cb="importCb" />
  </template>
  <template #export>
    <GvExportDialog :export="exportApi" :findExportFields="findExportFieldsApi" :saveExportFields="saveExportFieldsApi" />
  </template>
</GvTable>
```

import/export 所需的 API 函数需在 YAML `paths` 中声明：
```yaml
paths:
  import: /xxx/import
  export: /xxx/export
  findExportFields: /xxx/findExportFields
  saveExportFields: /xxx/saveExportFields
```

不声明 `## 表格工具栏` 时，仅生成默认的"新增"按钮（add enabled 时）。

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

字段 `format` / 校验类型（查询 + 编辑均必填）详见 [search-conditions.md](search-conditions.md)，与 guava-ui `gv.validate.ts` 对齐。

## 改进（可选，二次优化）

在配置末尾追加 `## 改进` 小节，可对首次生成的代码进行局部调整。生成完所有文件后，逐条读取改进项并应用到代码。

### 格式

```markdown
## 改进
- 改进项 1（自然语言描述）
- 改进项 2
- ...
```

### 示例

```markdown
## 改进
- 编辑页 Drawer 宽度改为 60%（默认 50%）
- 表格列「用户账号」增加 fixed: left
- 查询条件中「状态」默认选中「启用」状态（10601）
- 操作列按钮「删除」增加二次确认提示文案："确认删除该用户？"
```

### 支持的改进类型

| 类型 | 描述 | 对应修改 |
|------|------|---------|
| Drawer 宽度 | 调整编辑页抽屉宽度 | Edit 组件 `size` 属性 |
| 表格列属性 | fixed / width / align 等 | helper `TableHeadItem` |
| 查询默认值 | 设置搜索条件初始值 | `SearchList` 默认值 |
| 操作列文案 | 按钮文案、确认提示 | Index action 逻辑 |
| 表单字段 | 顺序、默认值 | `EditList` 调整 |
| 样式 | 内联样式、class | template 样式 |
