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

## 6. 查询默认值

不用 `default`，用 `value`。字典用 `showLabel` + `value: { value: 'code', label: '文案' }`。

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
    { type: 'text', format: [0, 'isNumberLetter', 30], label: '用户账号', field: 'u@account' },
    { type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'u@status' },
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
    { type: 'text', format: [1, 'isNumberLetter', 30], label: '用户账号', field: 'account', disabled: operateType === 'update' },
    { type: 'dic', format: [1, 'idDic', 6], dicType: 'yxzt', label: '状态', field: 'status', cb: actions.dictCB, clear: actions.dictClearCB },
    { type: 'textarea', format: [0, 'isAny', 200], label: '备注', field: 'remark', colspan: 4 },
    { type: 'text', format: [0, 'isNumber', 20], label: '创建人', field: 'createBy', readonly: true },
  ]);
```

---

## 10. form-only / tabs

- form-only：仅 `create<Feature>FormList`
- tabs：追加 `create<Feature>InlineEditList`（含 `inline-form` Tab 时）
