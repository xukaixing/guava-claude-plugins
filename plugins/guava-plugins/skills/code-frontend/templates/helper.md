# Helper 配置工厂

> [\_shared.md](../_shared.md) · 查询字段 [search-conditions.md](../search-conditions.md)

生成 `helper.tsx`。`FormItem` / `TableHeadItem` / `Recordable` 为全局类型，**禁止 import**。

---

## 1. i18n 开关

| `i18n` | 行为 |
| ------ | ---- |
| `false`（默认） | label 写中文，不 `import useI18n`，不 `const { t } = useI18n()` |
| `true` | label 用 `t('i18nKey.xxx')` |

> `i18n: false` 时整个文件**禁止** `useI18n`。

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

| 位置 | 属性 | `u@` |
| ---- | ---- | ---- |
| 查询 | `field` | ✅ |
| 表格 | `prop` | ❌ |
| 编辑 | `field` | ❌ |

---

## 4. 操作列（必须，表格级）

`## 操作列` 单独声明。`编辑,删除` → `content: ['编辑','删除']` + `action: [actions.edit<Feature>, actions.delete<Feature>]`。**无 icon**。

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

不用 `default`，用 `value`。

| 字段类型 | 写法 | 示例 |
| -------- | ---- | ---- |
| 文本 / 数字等 | `value: 'xxx'` | `value: 'zhangsan'` |
| 字典 | `value: '<dictCode>'` + `showLabel: '<displayText>'` | `value: '100601', showLabel: '集团公司'` |

- `value` 适用于所有字段类型（`text`、`number`、`dic`、`textarea` 等）
- 字典需额外提供 `showLabel`，值与 `value` 一一对应
- 查询 / 编辑表单均可使用

---

## 7. 数值列格式化

| 关键字 | 行为 |
| ------ | ---- |
| 「金额」「合计」 | `align: 'right'` + `amountFormat` render |
| 「数量」 | `align: 'right'` |

`amountFormat` 从 `guava-ui` 导入。

---

## 8. format / 日期 / 只读 / 占用列

- format: `[required, validator, maxlength, decimal?]`，查询 `required=0`
- 日期查询一律 `isDate` + `daterange`；编辑按 label 关键字推导
- 只读 `Y` → `readonly: true`；占用列 `≥2` → `colspan: N`

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

**规则**：
- 函数名 = `create<Feature><SectionName>List`，SectionName 为子标题去空格转 PascalCase
- 每个工厂函数接收 `(actions: <Feature>EditActions, operateType = '')` 参数
- 每个工厂函数独立管理自己的 `FormItem[]`

```typescript
// 基本信息
export const create<Feature>BasicInfoList = (actions: <Feature>EditActions, operateType = '') =>
  ref<FormItem[]>([
    { type: 'text', format: [1, 'isNumberLetter', 30], label: '用户账号', field: 'account', disabled: operateType === 'update' },
    { type: 'dic', format: [1, 'idDic', 6], dicType: 'zzjb', label: '组织级别', field: 'orgLevel', value: '100601', showLabel: '集团公司', cb: actions.dictCB, clear: actions.dictClearCB },
    { type: 'dic', format: [1, 'idDic', 6], dicType: 'yxzt', label: '状态', field: 'status', cb: actions.dictCB, clear: actions.dictClearCB },
  ]);

// 开票信息
export const create<Feature>InvoiceInfoList = (actions: <Feature>EditActions, operateType = '') =>
  ref<FormItem[]>([
    { type: 'text', format: [1, 'isAny', 100], label: '发票抬头', field: 'invoiceTitle' },
    { type: 'text', format: [0, 'isAny', 20], label: '税号', field: 'taxNo' },
  ]);
```

---

## 11. 多 Tab 页（Variant D）

`## 标签页` 中每个 Tab 根据 `type` 生成对应的 helper 工厂函数：

| Tab type | 工厂函数命名 | 返回类型 |
| -------- | ------------ | -------- |
| `table` | `create<Feature><TabName>TableHeadList` | `ref<TableHeadItem[]>` |
| `form` | `create<Feature><TabName>List` | `ref<FormItem[]>` |

**规则**：
- TabName 为 `name` 字段转 PascalCase（如 `orderDtl` → `OrderDtl`）
- `table` 类型工厂接收 actions 参数（含 `save`、`delete` 等回调）
- `form` 类型工厂接收 `(actions: <Feature>TabEditActions)` 参数

```typescript
// Tab 表格列
export const create<Feature>OrderDtlTableHeadList = (actions: <Feature>OrderDtlTableActions) =>
  ref<TableHeadItem[]>([
    { type: 'action', prop: '', label: '操作', content: ['编辑', '删除'], action: [actions.save<Feature>OrderDtl, actions.delete<Feature>OrderDtl] },
    { label: '商品名称', prop: 'productName', width: '150px' },
    { label: '数量', prop: 'quantity', width: '100px' },
    { label: '单价', prop: 'price', width: '120px' },
  ]);

// Tab 表单
export const create<Feature>RemarkInfoList = (actions: <Feature>TabEditActions) =>
  ref<FormItem[]>([
    { type: 'textarea', format: [0, 'isAny', 200], label: '备注', field: 'remark', colspan: 3 },
  ]);
```

---

## 12. 明细展开（Detail Table）

操作列自定义按钮 + 展开明细表格模式（参考 [detail.md](detail.md)）。适用于「用户登录明细」等关联数据异步拉取场景。

### 配置触发

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

### helper 工厂函数

```typescript
export const buildLoginLogHeadList = (): TableHeadItem[] => [
  { label: '登录IP', prop: loginIp, width: '150px' },
  { label: '所属地区', prop: 'loginDivision' },
  { label: '浏览器', prop: 'browser' },
  { label: '登录时间', prop: 'loginTime', width: '180px' },
];
```

### 命名规则

| 配置 name | helper 函数名 | Index 方法名 |
| --------- | ------------- | ----------- |
| `loginLog` | `buildLoginLogHeadList` | `showLoginLog` |
| `orderDtl` | `buildOrderDtlHeadList` | `showOrderDtl` |

### 操作列追加按钮

```typescript
{
  type: 'action',
  prop: '',
  label: '操作',
  content: ['编辑', '删除', '用户登录明细'],
  icon: ['el-icon-edit', 'gv-icon-tingyong', 'gv-icon-daiban'],
  action: [actions.editRow, actions.delRow, actions.showLoginLog],
},
```

### 与 Expand 的区别

| 项 | Expand | Detail |
| -- | ------ | ------ |
| 触发 | 行首图标 | 操作列按钮 |
| 配置 | `## 扩展列` | `## 明细` |
| 数据拉取 | `fetchExpandTableData` | `crud.fetchTable` |

---

## 13. 详情页（Info / GvDescriptions）

只读详情展示模式，使用 `GvDescriptions` 组件在 Drawer 中展示字段（参考 [info.md](info.md)）。

### 配置触发

```markdown
## 详情
| 名称 | 字段 | 占用列 | 类型 | 扩展 |
| 用户账号 | account | 1 | | |
| 性别 | sex | 1 | dic | dic=xb |
| 备注 | remark | 2 | | |
```

### helper 工厂函数

```typescript
export const buildUserInfoHeadList = (): DescItemHead[] => [
  { prop: 'account', label: '用户账号' },
  { prop: 'userName', label: '用户姓名' },
  { prop: 'sex', label: '性别', dicType: 'xb' },
  { prop: 'birthDate', label: '出生日期' },
  { prop: 'mobile', label: '联系方式' },
  { prop: 'email', label: '邮箱' },
  { prop: 'status', label: '状态', dicType: 'yxzt' },
  { prop: 'remark', label: '备注', span: 2 },
];
```

### 命名规则

| 场景 | helper 函数名 | 返回类型 |
| ---- | ------------- | -------- |
| crud-module infoPage | `build<Feature>InfoHeadList` | `DescItemHead[]` |
| 独立 infoPage 模板 | `build<Feature>InfoHeadList` | `DescItemHead[]` |

### DescItemHead 属性映射

| 属性 | 配置列 | 说明 |
| ---- | ------ | ---- |
| `prop` | 字段 | 对应 `itemData` 中的字段 key |
| `label` | 名称 | 描述项标签文本 |
| `span` | 占用列 | 列占用栅格数，默认 1 |
| `dicType` | 类型=dic 时，扩展 `dic=编码` | 字典编码，自动转换 `{c,v}` → 文案 |
| `formatter` | — | 自定义格式化函数 `(value, itemData) => string` |
| `render` | — | 自定义渲染 `(value, itemData) => VNode \| string` |
| `labelWidth` | — | 自定义标签宽度 |
| `align` | — | 内容对齐方式 |

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
