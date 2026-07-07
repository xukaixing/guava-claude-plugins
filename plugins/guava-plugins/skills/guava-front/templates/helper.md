# Helper 配置工厂模板

生成 `src/views/<viewPath>/module/helper.tsx`（layout=module）或 `src/views/<viewPath>/helper.tsx`（layout=flat）。

**关键**：`ItemForm`、`TableHeadItem`、`Recordable` 是全局类型，禁止 import。

> 查询条件详见 [search-conditions.md](../search-conditions.md)

## 已存在文件

文件已存在时 **Write 整文件覆盖**，按当前配置的查询/表格/编辑字段重新生成。禁止跳过。

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

| 场景 | required | 字典 validator |
|------|----------|---------------|
| 查询 | 始终 `0` | `isDic` |
| 编辑必填 | `1` | `idDic` |
| 编辑非必填 | `0` | `isDic` |

## 表单/表格类型速查

| type | 关键属性 |
|------|---------|
| `text` | format |
| `dic` | dicType, dicRemote, multiple, cb, clear, filtercode |
| `date` | dateType |
| `textarea` | format, colspan |
| `switch`（表格 render） | remark=switch:handlerName |
