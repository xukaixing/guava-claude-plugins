# Helper 配置工厂

> [\_shared.md](../_shared.md) · 查询字段 [search-conditions.md](../search-conditions.md)

生成 `helper.tsx`（module 在 `module/` 下）。`FormItem` / `TableHeadItem` / `Recordable` 为全局类型，**禁止 import**。

---

## 1. i18n 开关

| `i18n` | 行为 |
| ------ | ---- |
| `false`（**默认**） | label 直接写中文，**不 `import useI18n`**，工厂内**不** `const { t } = useI18n()` |
| `true` | label 使用 `t('i18nKey.xxx')`，需 `import useI18n` 并调用 |

> **关键**：`i18n: false` 时，整个 `helper.tsx` **禁止出现** `useI18n`。

---

## 2. 按操作选择生成

| 工厂函数 | 生成条件 | 数据来源 |
| ------- | -------- | -------- |
| `create<Feature>SearchList` | 始终 | 查询条件表 |
| `create<Feature>TableHeadList` | 始终 | 表格列 + 操作列 |
| `create<Feature>EditList` | add / edit enabled | 编辑表单表 |
| `create<Feature>EditTableHeadList` | hasSubTable | 子表列 |

---

## 3. 字段名前缀规则

| 配置位置 | 属性名 | `u@` 前缀 | 说明 |
| ------- | ------ | --------- | ---- |
| 查询条件（SearchList） | `field` | ✅ 保留 | 与后端查询参数一致 |
| 表格列（TableHeadList） | `prop` | ❌ 不带 | 纯字段名 |
| 编辑表单（EditList） | `field` | ❌ 不带 | 纯字段名 |

```typescript
// ✅ 正确
{ type: 'text', field: 'u@account', label: '用户账号', format: [0, 'isNumberLetter', 30] }  // 查询
{ label: '用户账号', prop: 'account', width: '120px' }                                       // 表格
{ type: 'text', field: 'account', label: '用户账号', format: [1, 'isNumberLetter', 30] }     // 编辑

// ❌ 错误
{ label: '用户账号', prop: 'u@account', width: '120px' }   // 表格不应带 u@
{ type: 'text', field: 'u@account', label: '用户账号' }    // 编辑不应带 u@
```

---

## 4. 操作列（必须，表格级）

操作列为表格级属性，在 `## 操作列` 单独声明（[config-template.md](../config-template.md#操作列--扩展列配置表格级)），**不写在表格列定义中**。

| 配置写法 | 生成结果 |
| ------- | -------- |
| `编辑,删除` | `content: ['编辑', '删除']` + `action: [actions.edit<Feature>, actions.delete<Feature>]` |
| `编辑` | 仅编辑按钮 |
| `编辑,停用,详情` | 多按钮，自定义名需在 `TableActions` 声明对应方法 |

- 按钮名与 `TableActions` 方法一一对应
- **不生成 `icon` 属性**，仅生成 `content` + `action`
- action 列 `label` 使用 `t('table.action')`

---

## 5. 扩展列（可选，表格级）

扩展列（`type: 'expand'`）为表格级属性，在 `## 扩展列` 单独声明。

| 配置写法 | 生成结果 |
| ------- | -------- |
| `expand` | 生成 expand 列 + `create<Feature>ExpandTableHeadList` + `expandMap` + `expandChange` |
| 空 / 不声明 | 不生成 |

展开行数据通过 `expandMap`（`reactive<Recordable<Recordable<any>>>`）缓存，行唯一标识为 `row.id`。

---

## 6. 查询条件默认值

**不使用 `default` 属性**，改用 `value`：

| 字段类型 | 默认值写法 |
| ------- | --------- |
| 非字典（text / date / number） | `value: '默认值'` |
| 字典（dic） | `showLabel: '显示文案'` + `value: { value: 'code', label: '显示文案' }` |

```typescript
// ❌ 错误
{ type: 'dic', field: 'status', default: '10601' }

// ✅ 正确 — 非字典
{ type: 'text', field: 'name', value: '测试' }

// ✅ 正确 — 字典
{ type: 'dic', field: 'status', showLabel: '启用', value: { value: '10601', label: '启用' } }
```

---

## 7. 数值列自动格式化

| 关键字 | 自动行为 |
| ------ | -------- |
| 「金额」「合计」 | `align: 'right'` + `amountFormat` 千分位 render |
| 「数量」 | `align: 'right'` |

```typescript
// 列名含「金额」「合计」时
{
  label: '订单金额',
  prop: 'amount',
  width: '120px',
  align: 'right',
  render: (scope) => <span>{amountFormat(scope.row.amount)}</span>,
}

// 列名含「数量」时
{ label: '购买数量', prop: 'qty', width: '100px', align: 'right' }
```

> `amountFormat` 从 `guava-ui` 导入：`import { GvTable, amountFormat } from 'guava-ui'`

---

## 8. format 差异

| 场景 | required | validator |
| ---- | -------- | --------- |
| 查询 | 始终 `0` | 见 [search-conditions.md](../search-conditions.md)；字典用 `isDic` |
| 编辑必填 | `1` | 同上；字典用 `idDic` |
| 编辑非必填 | `0` | 同上；字典用 `isDic` |
| `isDouble` | — | `format[3]` = 小数位数 |

---

## 9. 日期 / 时间字段按 label 关键字自动推导

### 查询条件（SearchList）

| label 含关键字 | validator | dateType |
| -------------- | --------- | -------- |
| 「日期」 | `isDate` | `daterange` |
| 「时间」 | `isDate` | `daterange` |

> 查询条件不区分「日期」/「时间」，一律走 `isDate` + `daterange`。

### 编辑 / 表单（EditList / FormList）

| label 含关键字 | validator | dateType |
| -------------- | --------- | -------- |
| 「日期」 | `isDate` | `date` |
| 「时间」 | `isDateTime` | `datetime` |

---

## 10. 只读与占用列

| 配置列 | 生成属性 | 规则 |
| ------ | -------- | ---- |
| 只读 | `readonly: true` | `Y` 时生成；空 → 不生成 |
| 占用列 | `colspan: N` | `≥2` 时生成；空 / 1 → 不生成；名称含「备注 / 地址 / 详情 / 描述」默认 `colspan: 3` |

---

## 11. 表单 / 表格类型速查

| type | 关键属性 |
| ---- | -------- |
| `text` | format |
| `dic` | dicType, dicRemote, multiple, cb, clear, filtercode |
| `date` | dateType |
| `textarea` | format, colspan |
| `switch`（表格 render） | remark=switch:handlerName |

---

## 12. 模板

```typescript
// ↓ i18n: true 时才导入 useI18n
import { ref } from 'vue';
import type { <Feature>TableActions, <Feature>EditActions } from './types';
// ↓ only if hasSubTable:
// import type { <Feature>EditTableActions } from './types';
// ↓ only if dicRemote in config:
// import { findDictFromTableApi } from '@/api/<apiModule>';
// ↓ only if expand enabled:
// import { ElForm, ElFormItem } from 'element-plus';
// import { GvTable, amountFormat } from 'guava-ui';

export const create<Feature>SearchList = () => {
  // ↓ i18n: true 时才解构 t
  // const { t } = useI18n();
  return ref<FormItem[]>([
    { type: 'text', format: [0, 'isNumberLetter', 30], label: '用户账号', field: 'u@account' },
    { type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'u@status' },
    { type: 'date', format: [0, 'isDate', 10], dateType: 'daterange', label: '创建时间', field: 'createTime' },
  ]);
};

// ↓ only if expand enabled
// export const create<Feature>ExpandTableHeadList = () => {
//   return ref<TableHeadItem[]>([
//     { label: '用户账号', prop: 'account' },
//     { label: '用户姓名', prop: 'userName' },
//   ]);
// };

export const create<Feature>TableHeadList = (actions: <Feature>TableActions) => {
  return ref<TableHeadItem[]>([
    // ↓ only if expand enabled
    // { type: 'expand', label: '展开', prop: 'expand', render: (scope) => { ... } },
    // 操作列（必须）— 无 icon
    { type: 'action', prop: '', label: '操作', content: ['编辑', '删除'], action: [actions.edit<Feature>, actions.delete<Feature>] },
    { label: '用户账号', prop: 'account', query: true, width: '120px' },
    { type: 'dic', label: '状态', prop: 'status', dicType: 'yxzt', width: '100px' },
    { type: 'date', label: '创建时间', prop: 'createTime', dateType: 'datetime', width: '180px' },
  ]);
};

// ↓ only if add/edit enabled
export const create<Feature>EditList = (actions: <Feature>EditActions, operateType = '') => {
  return ref<FormItem[]>([
    { type: 'text', format: [1, 'isNumberLetter', 30], label: '用户账号', field: 'account', disabled: operateType === 'update' },
    { type: 'dic', format: [1, 'idDic', 6], dicType: 'yxzt', label: '状态', field: 'status', cb: actions.dictCB, clear: actions.dictClearCB },
    { type: 'textarea', format: [0, 'isAny', 200], label: '备注', field: 'remark', colspan: 4 },
    { type: 'text', format: [0, 'isNumber', 20], label: '创建人', field: 'createBy', readonly: true },
  ]);
};

// ↓ only if hasSubTable
// export const create<Feature>EditTableHeadList = (actions: <Feature>EditTableActions) => { ... };

// ↓ only if ## 表格2 enabled
// export const create<Feature>TableHeadList2 = (actions: <Feature>TableActions2) => { ... };
```

---

## 13. form-only

**仅生成** `create<Feature>FormList`，不生成 SearchList / TableHeadList / EditList。

---

## 14. tabs

在 crud-module 基础上追加 `create<Feature>InlineEditList`（含 `inline-form` Tab 时）。
