# Helper 配置工厂

> [\_shared.md](../_shared.md) · [\_common.md](_common.md)（i18n / dictCB 片段）· 查询字段 [search-conditions.md](../search-conditions.md)

生成 `helper.tsx`。`FormItem` / `TableHeadItem` / `Recordable` 为全局类型，**禁止 import**。

---

## 1. i18n 开关

label 中文 / `t()` 规则见 [\_common.md §2](_common.md#2-i18n-开关)；i18n: true 时的 key 规则见 [i18n.md](i18n.md)。

---

## 2. 工厂函数选择

| 函数 | 条件 | 数据源 |
| ---- | ---- | ------ |
| `create<Feature>SearchList` | 始终 | 查询表 |
| `create<Feature>TableHeadList` | 始终 | 表格列 + 操作列 |
| `create<Feature>EditList` | add/edit | 编辑表 |
| `create<Feature>EditTableHeadList` | hasSubTable | 子表列 |

---

## 3. 字段名前缀

`u@` 规则：**查询 `field` 带 `u@`，表格 `prop` / 编辑 `field` 不带**（视觉稿格式可选）。详见 [search-conditions.md](../search-conditions.md#5-字段名前缀)。

---

## 4. 操作列（必须，表格级）

`## 操作列` 单独声明。`编辑,删除` → `content: ['编辑','删除']` + `action: [actions.edit<Feature>, actions.delete<Feature>]`。**无 icon**。

**视觉稿格式行内声明（优先）**：表格内 `类型: action:编辑,编辑` 行 → 操作列，按钮名原样写入 `content`（**不去重**）；无行内声明时回落 `## 操作列` / `### 操作列` 小节。

| 按钮名 | 回调映射 |
| ------ | -------- |
| 编辑 | `actions.edit<Feature>` |
| 删除 | `actions.delete<Feature>` |
| 详情 / 查看 | `actions.info<Feature>` |
| 其他 | `actions.<按钮名>` 同名占位（方法体注释引用 `### 操作列规则` 描述） |

---

## 5. 扩展列（可选，表格级）

### 配置

```markdown
## 扩展列
expand                    # 简写 = type: table

# 或完整配置：
expand:
  type: table             # table | custom | both
  columns:
    - label: 用户账号
      prop: account
  template:               # type=custom/both 时
    <div>{scope.row.xxx}</div>
```

### 生成逻辑

| type | 生成内容 |
| ---- | -------- |
| `table` | 子表 `GvTable`（无 ElForm）+ `fetchExpandTableData` + `expandMap` |
| `custom` | 仅自定义 div（`template` 配置） |
| `both` | 自定义 div + 子表 `GvTable` |

### expand 数据拉取（type=table/both 时，Index 页声明）

```typescript
const loadExpandRow = async (row) => {
  const rowId = row.id;
  if (expandMap[rowId] || row._expandLoading) return;
  row._expandLoading = true;
  try { expandMap[rowId] = await fetchExpandTableData(row); }
  catch (e) { message(e, 'error'); }
  finally { row._expandLoading = false; }
};
const expandChange = async (row, expandedRows) => {
  if (!expandedRows.includes(row)) return;
  await loadExpandRow(row);
};
```

### types.d.ts 追加

```typescript
export interface <Feature>TableActions {
  edit<Feature>: TableRowFn;
  delete<Feature>: TableRowFn;
  expandMap: Recordable<Recordable<any>>;  // ← expand enabled
}
```

---

## 6. 默认值

不用 `default`，用 `value`（字典配 `showLabel` 与 `value` 一一对应）。写法与规则见 [search-conditions.md](../search-conditions.md#4-字典字段)。

---

## 7. 数值列格式化 / 表格视觉稿扩展

| 关键字 | 行为 |
| ------ | ---- |
| 「金额」「合计」或 `扩展=amount` | `align: 'right'` + `amountFormat` render |
| 「数量」或 `扩展=align: right` | `align: 'right'` |
| `扩展=align: left` | `align: 'left'`（官方 API 可选值仅 `left` / `right`） |
| `扩展=type=tag` | 标签列，render GvTag（颜色 / props 查 MCP `get_props` GvTable） |
| `固定=Y` | `fixed`（方向查 MCP：操作列右固定、数据列左固定） |

`amountFormat` 从 `guava-ui` 导入。以上属性名生成前以 MCP `get_props` GvTable head 类型为准。

### 7.1 多级表头（`类型=multiHeader`）

表格 7 列表中 `类型` 填 `multiHeader`、**组名写在「名称」列、字段留空**的行 = 分组起始行；其后连续带字段的行归入该组作子列（直到下一个 `multiHeader` 行 / 操作列行 / 表尾）：

```markdown
| 资金信息 |       |     |   | multiHeader |   |                 |
| 余额     | djJe  | 120 |   |             |   | align: right    |
| 可用金额 | djKy  |     |   |             |   | sum, decimal: 2 |
```

兼容旧格式：`类型=multi:<分组名>`（字段留空，组名在类型列）视为同一语义，`multiLabel` 取 `:` 后分组名。

生成一个 TableHeadItem，位置 = 分组起始行处：

```typescript
{
  label: '资金信息',        // 分组行「名称」；缺省 '多级表头'
  prop: 'multiHeader',     // 分组行「字段」；留空固定 'multiHeader'
  multiLabel: '资金信息',   // 分组行「名称」（旧格式 multi:<分组名> 取 : 后部分）
  heads: [
    { label: '余额', prop: 'djJe', width: 120, align: 'right' },
    { label: '可用金额', prop: 'djKy', sum: true, decimal: 2 },
  ],
}
```

| 子列配置 | 生成 heads item 属性 |
| ---- | ---- |
| 名称 / 字段 / 宽度 | `label` / `prop` / `width` |
| `扩展=align: left/right` | `align` |
| `扩展=amount` | `align: 'right'` + `render` 调 `amountFormat` |
| `扩展=sum` | `sum: true`（开启合计） |
| `扩展=decimal: N` | `decimal: N`（小数位，默认 2） |

- 子列不支持「筛选」「固定」「类型」（dic / date / tag 等）
- 有 render 需求时在生成代码中手写 `render: (scope) => ...`，配置表不表达
- `multiLabel` / `heads` / `sum` / `decimal` 属性名生成前以 MCP `get_props` GvTable head 类型为准

---

## 8. format / 日期 / 只读 / 占用列

- format: `[required, validator, maxlength, decimal?]`，查询 `required=0`
- 日期查询一律 `isDate` + `daterange`；编辑按 label 关键字推导
- 只读 `Y` → `readonly: true`；占用列 `≥2` → `colspan: N`
- `扩展=suffixBtn=<图标名>:<子表单>(<容器>)`（编辑表单 `type: 'text'` 项）→ FormItem 追加 `suffixIcon: '<图标名>'` + 点击回调 `actions.open<Section>`（`<Section>` = 子表单标题 PascalCase）；图标点击事件名以 MCP `get_props` GvInput 实际暴露为准，无该事件时方法体留 `@todo` 注释（guava-ui 需补 suffixIcon 点击事件）

---

## 9. 模板

```typescript
import { ref } from 'vue';
import type { <Feature>TableActions, <Feature>EditActions } from './types';
// expand 时: import { GvTable } from 'guava-ui';

export const create<Feature>SearchList = () =>
  ref<FormItem[]>([
    { type: 'text', format: [0, 'isNumberLetter', 30], label: '用户账号', field: 'u@account', value: 'admin' },
    { type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'u@status', value: '1', showLabel: '启用' },
    { type: 'date', format: [0, 'isDate', 10], dateType: 'daterange', label: '创建时间', field: 'createTime' },
  ]);

// expand 时子表列
const expand<Feature>HeadList: TableHeadItem[] = [
  { label: '用户账号', prop: 'account' },
  { label: '用户姓名', prop: 'userName' },
];

// expand 时数据获取（frontendOnly mock）
export const fetchExpandTableData = (row: Recordable<any>): Promise<Recordable<any>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ records: [{ account: row.account + '-sub1' }], total: 1, size: 10, current: 1, pages: 1 });
    }, 400);
  });

export const create<Feature>TableHeadList = (actions: <Feature>TableActions) =>
  ref<TableHeadItem[]>([
    // expand 时
    { type: 'expand', label: '展开', prop: 'expand', render: (scope) => {
      const expandData = actions.expandMap[scope.row.id];
      return (<div v-loading={!!scope.row._expandLoading}>
        {/* custom 时: <div class="expand-custom">...</div> */}
        <GvTable refTable={`<feature>ExpandTable-${scope.$index}`} tableHead={expand<Feature>HeadList}
          tableType="expand" tableData={expandData} isShowPage={false} preserveExpanded={true}
          style={{ maxWidth: '60%', width: 'auto' }} />
      </div>);
    }},
    { type: 'action', prop: '', label: '操作', content: ['编辑', '删除'], action: [actions.edit<Feature>, actions.delete<Feature>] },
    { label: '用户账号', prop: 'account', query: true, width: '120px' },
    { type: 'dic', label: '状态', prop: 'status', dicType: 'yxzt', width: '100px' },
    { type: 'date', label: '创建时间', prop: 'createTime', dateType: 'datetime', width: '180px' },
  ]);

// add/edit 时
export const create<Feature>EditList = (actions: <Feature>EditActions, operateType = '') =>
  ref<FormItem[]>([
    { type: 'text', format: [1, 'isNumberLetter', 30], label: '用户账号', field: 'account', disabled: operateType === 'update', value: 'admin' },
    { type: 'dic', format: [1, 'idDic', 6], dicType: 'zzjb', label: '组织级别', field: 'orgLevel', value: '100601', showLabel: '集团公司', cb: actions.dictCB, clear: actions.dictClearCB },
    { type: 'dic', format: [1, 'idDic', 6], dicType: 'yxzt', label: '状态', field: 'status', cb: actions.dictCB, clear: actions.dictClearCB },
    { type: 'textarea', format: [0, 'isAny', 200], label: '备注', field: 'remark', colspan: 4 },
    { type: 'text', format: [0, 'isNumber', 20], label: '创建人', field: 'createBy', readonly: true },
  ]);
```

---

## 10. 多分区编辑（Variant C / D）

`## 编辑` 下含多个 `###` 子标题时，每个子标题生成独立的 helper 工厂函数：

| 子标题 | 工厂函数命名 | 示例 |
| ------ | ------------ | ------ |
| `### 基本信息` | `create<Feature>BasicInfoList` | `createUserBasicInfoList` |
| `### 开票信息` | `create<Feature>InvoiceInfoList` | `createUserInvoiceInfoList` |
| `### 登录信息（GvDescriptions）` | `build<Feature>LoginInfoHeadList`（`DescItemHead[]`，见 §13） | `buildUserLoginInfoHeadList` |

**规则**：
- 函数名 = `create<Feature><SectionName>List` / `build<Feature><Section>InfoHeadList`，SectionName 为子标题去空格转 PascalCase（组件注解 `(GvForm)` / `(GvDescriptions)` 不计入）；**SectionName 已以 `List` 结尾时不重复追加**（如「登录列表」→ `LoginList` → `create<Feature>LoginList`，禁止 `…LoginListList`）
- GvDescriptions 子区表结构 `名称|字段|占用列|类型|扩展`，只读、不进表单校验与提交
- 每个工厂函数接收 `(actions: <Feature>EditActions, operateType = '')` 参数，独立管理自己的 `FormItem[]`
- 字段项写法与 §9 模板相同（format / dicType / cb / colspan / readonly 等按配置表生成）

---

## 11. 多 Tab 页（Variant D）

`## 标签页` 中每个 Tab 根据 `type` 生成对应的 helper 工厂函数：

| Tab type | 工厂函数命名 | 返回类型 |
| -------- | ------------ | -------- |
| `table` | `create<Feature><TabName>TableHeadList` | `ref<TableHeadItem[]>` |
| `form` | `create<Feature><TabName>List` | `ref<FormItem[]>` |

**规则**：
- TabName 为 `name` 字段转 PascalCase（如 `orderDtl` → `OrderDtl`）
- `table` 类型工厂接收 actions 参数（含 `save`、`delete` 等回调），列含操作列 `content: ['编辑', '删除']` + `action: [actions.save<Feature><TabName>, actions.delete<Feature><TabName>]`
- `form` 类型工厂接收 `(actions: <Feature>TabEditActions)` 参数（字典字段时）
- 字段项写法与 §9 模板相同；Tab `table` 列不支持「筛选」「固定」时用 render 手写

---

## 12. 明细展开（Detail Table）

操作列自定义按钮 + 展开明细表格模式，适用于「用户登录明细」等关联数据异步拉取场景。完整生成规则（配置 / Index 方法 / 操作列追加）见 [detail.md](detail.md)；helper 侧只记命名：

| 配置 name | helper 工厂函数 | Index 方法名 |
| --------- | ------------- | ----------- |
| `loginLog` | `buildLoginLogHeadList`（`TableHeadItem[]`） | `showLoginLog` |
| `orderDtl` | `buildOrderDtlHeadList` | `showOrderDtl` |

与 Expand 的区别：触发 = 操作列按钮（非行首图标），配置 = `## 明细`（非 `## 扩展列`），数据 = `crud.fetchTable`（非 `fetchExpandTableData`）。

---

## 13. 详情页（Info / GvDescriptions）

只读详情展示模式，使用 `GvDescriptions` 组件（配置格式 / 工厂示例 / `DescItemHead` 属性映射见 [info.md](info.md)）。helper 侧命名：

| 场景 | helper 函数名 | 返回类型 |
| ---- | ------------- | -------- |
| crud-module infoPage | `build<Feature>InfoHeadList` | `DescItemHead[]` |
| 编辑表单内（GvDescriptions）子区 | `build<Feature><Section>InfoHeadList` | `DescItemHead[]` |

### 与 Edit / Detail 的区别

| 项 | Edit | Info | Detail |
| -- | ---- | ---- | ------ |
| 用途 | 新增/编辑 | 只读展示 | 关联数据展开 |
| 核心组件 | GvForm | GvDescriptions | GvTable |
| helper 返回 | `FormItem[]` | `DescItemHead[]` | `TableHeadItem[]` |
| 数据流向 | 表单 → 保存 | itemData → 展示 | API → 子表 |

---

## 14. form-only / tabs

- form-only：仅 `create<Feature>FormList`
- tabs：追加 `create<Feature>InlineEditList`（含 `inline-form` Tab 时）
