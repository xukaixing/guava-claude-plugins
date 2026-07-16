# Helper 配置工厂模板

> [_shared.md](../_shared.md) · 查询字段 [search-conditions.md](../search-conditions.md)

生成 `helper.tsx`（module 在 `module/` 下）。`ItemForm`/`TableHeadItem`/`Recordable` 为全局类型，禁止 import。

## 按操作选择生成

| 工厂函数 | 生成条件 | 数据来源 |
|---------|---------|---------|
| `create<Feature>SearchList` | 始终 | 查询条件表 |
| `create<Feature>TableHeadList` | 始终 | 表格列 + action 列规则 |
| `create<Feature>EditList` | add/edit enabled | 编辑表单表 |
| `create<Feature>EditTableHeadList` | hasSubTable | 子表列 |

## SearchList 签名

| 场景 | 签名 |
|------|------|
| 无字典联动 | `create<Feature>SearchList = () => { ... }` |
| 有字典 cb/clear | `create<Feature>SearchList = (handlers: FormHandlers) => { ... }` |

## Action 列规则

| enabled 操作 | content | action |
|-------------|---------|--------|
| edit + delete | `[t('common.edit'), t('common.delete')]` | `[actions.edit*, actions.delete*]` |
| 仅 edit | `[t('common.edit')]` | `[actions.edit*]` |
| 仅 delete | `[t('common.delete')]` | `[actions.delete*]` |
| 无 | 不生成 action 列 | — |

action 列 `label` 使用 `t('table.action')`。

## 模板

```typescript
import { ref } from 'vue';
import { useI18n } from '@/hook/web/useI18n';
import type { <Feature>TableActions, <Feature>EditActions } from './types';
// ↓ only if hasSubTable:
import type { <Feature>EditTableActions } from './types';
// ↓ only if dicRemote in config:
import { findDictFromTableApi } from '@/api/<apiModule>';

export const create<Feature>SearchList = () => {
  const { t } = useI18n();
  return ref<FormItem[]>([
    {
      type: 'text',
      format: [0, 'isNumberLetter', 30],
      label: t('<i18nKey>.account'),
      field: 'u@account',
    },
    {
      type: 'dic',
      format: [0, 'isDic', 6],
      dicType: 'yxzt',
      label: t('<i18nKey>.status'),
      field: 'u@status',
    },
    {
      type: 'date',
      format: [0, 'isDate', 10],
      dateType: 'daterange',
      label: t('<i18nKey>.createTime'),
      field: 'createTime',
    },
  ]);
};

export const create<Feature>TableHeadList = (actions: <Feature>TableActions) => {
  const { t } = useI18n();
  return ref<TableHeadItem[]>([
    {
      type: 'action',
      label: t('table.action'),
      prop: '',
      content: [t('common.edit')],
      action: [actions.edit<Feature>],
    },
    { label: t('<i18nKey>.account'), prop: 'account', query: true, width: '120px' },
    { type: 'dic', label: t('<i18nKey>.status'), prop: 'status', dicType: 'yxzt', width: '100px' },
    { type: 'date', label: t('<i18nKey>.createTime'), prop: 'createTime', dateType: 'datetime', width: '180px' },
  ]);
};

// ↓ only if add/edit enabled:
export const create<Feature>EditList = (actions: <Feature>EditActions, operateType = '') => {
  const { t } = useI18n();
  return ref<FormItem[]>([
    {
      type: 'text',
      format: [1, 'isNumberLetter', 30],
      label: t('<i18nKey>.account'),
      field: 'account',
      disabled: operateType === 'update',  // ← remark=disabledOnEdit
    },
    {
      type: 'dic',
      format: [1, 'idDic', 6],
      dicType: 'yxzt',
      label: t('<i18nKey>.status'),
      field: 'status',
      cb: actions.dictCB,
      clear: actions.dictClearCB,
    },
    {
      type: 'textarea',
      format: [0, 'isAny', 200],
      label: t('<i18nKey>.remark'),
      field: 'remark',
    },
  ]);
};

// ↓ only if hasSubTable:
export const create<Feature>EditTableHeadList = (actions: <Feature>EditTableActions) => {
  const { t } = useI18n();
  return ref<TableHeadItem[]>([
    {
      type: 'action',
      label: t('table.action'),
      prop: '',
      width: 'auto',
      content: [t('table.save'), t('table.delete')],
      action: [actions.save<Feature>Dtl, actions.delete<Feature>Dtl],
    },
    { label: t('<i18nKey>.fieldKey'), prop: 'fieldName', width: '150px' },
  ]);
};
```

## format 差异

| 场景 | required | validator（必填） |
|------|----------|-------------------|
| 查询 | 始终 `0` | 见 [search-conditions.md](../search-conditions.md)；字典用 `isDic` |
| 编辑必填 | `1` | 同上；字典用 `idDic` |
| 编辑非必填 | `0` | 同上；字典用 `isDic` |
| `isDouble` | — | `format[3]` = 小数位数 |

**查询 SearchList 与编辑 EditList / FormList 每条 FormItem 都必须带 `format[1]` 校验类型**，取值对齐 guava-ui `packages/utils/gv.validate.ts`。

## 表单/表格类型速查

| type | 关键属性 |
|------|---------|
| `text` | format |
| `dic` | dicType, dicRemote, multiple, cb, clear, filtercode |
| `date` | dateType |
| `textarea` | format, colspan |
| `switch`（表格 render） | remark=switch:handlerName |

## form-only

**仅生成** `create<Feature>FormList`，不生成 SearchList / TableHeadList / EditList。

| 工厂函数 | 生成条件 | 数据来源 |
|---------|---------|---------|
| `create<Feature>FormList` | 始终 | 编辑表（整页表单字段） |

字段 `format` 规则与 EditList 相同（必填 `1` + `idDic`，非必填 `0` + `isDic`；**每条须有 validator**）。**无** `operateType` / `disabledOnEdit`（纯配置页通常无新增/编辑模式区分；若扩展需要可保留）。

```typescript
import { ref } from 'vue';
import { useI18n } from '@/hook/web/useI18n';
import type { <Feature>FormActions } from './types';
// ↓ only if dicRemote in config:
import { findDictFromTableApi } from '@/api/<apiModule>';

// <title>-表单
export const create<Feature>FormList = (actions: <Feature>FormActions) => {
  const { t } = useI18n();
  return ref<FormItem[]>([
    {
      type: 'text',
      format: [1, 'isAny', 60],
      label: t('<i18nKey>.siteName'),
      field: 'siteName',
    },
    {
      type: 'dic',
      format: [0, 'isDic', 6],
      dicType: 'yxzt',
      label: t('<i18nKey>.maintenanceMode'),
      field: 'maintenanceMode',
      cb: actions.dictCB,
      clear: actions.dictClearCB,
    },
    {
      type: 'textarea',
      format: [0, 'isAny', 200],
      label: t('<i18nKey>.remark'),
      field: 'remark',
    },
  ]);
};
```

无字典字段时：

```typescript
export const create<Feature>FormList = () => {
  const { t } = useI18n();
  return ref<FormItem[]>([ /* ... */ ]);
};
```

---

## tabs

在 crud-module 工厂基础上，**含 `inline-form` Tab 时追加** `create<Feature>InlineEditList`。

| 工厂函数 | 生成条件 | 数据来源 |
|---------|---------|---------|
| `create<Feature>SearchList` | 含 search-table Tab | 查询表 |
| `create<Feature>TableHeadList` | 含 search-table Tab | 表格列 |
| `create<Feature>EditList` | editMode=drawer 且 add/edit | 编辑表（Drawer） |
| `create<Feature>InlineEditList` | 含 inline-form Tab | 编辑表（Tab 内嵌，同字段） |

`InlineEditList` 与 `EditList` 字段相同，签名**无** `operateType`；`disabledOnEdit` 扩展列在 inline 中**不生效**。

```typescript
// <title>-Tab 内嵌编辑表单
export const create<Feature>InlineEditList = (actions: <Feature>InlineEditActions) => {
  const { t } = useI18n();
  return ref<FormItem[]>([
    {
      type: 'text',
      format: [1, 'isNumberLetter', 30],
      label: t('<i18nKey>.account'),
      field: 'account',
    },
    {
      type: 'dic',
      format: [1, 'idDic', 6],
      dicType: 'yxzt',
      label: t('<i18nKey>.status'),
      field: 'status',
      cb: actions.dictCB,
      clear: actions.dictClearCB,
    },
  ]);
};
```

Index 与 Edit 可共用 `EditActions` / `InlineEditActions`（结构相同：`dictCB` + `dictClearCB`）。

---
