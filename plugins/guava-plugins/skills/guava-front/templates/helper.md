# Helper 配置工厂模板

> [_shared.md](../_shared.md) · 查询字段 [search-conditions.md](../search-conditions.md)

生成 `helper.tsx`（module 在 `module/` 下）。`ItemForm`/`TableHeadItem`/`Recordable` 为全局类型，禁止 import。

## `i18n` 开关

| `i18n` | 行为 |
|--------|------|
| `false`（**默认**） | label 直接写硬编码中文（如 `label: '用户账号'`），不 `import useI18n`，工厂函数内不 `const { t } = useI18n()` |
| `true` | label 使用 `t('i18nKey.xxx')`，需 `import useI18n` 并在工厂内调用 `useI18n()` |

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

## 操作列（必须，表格级）

操作列为表格级属性，在 `## 操作列` 单独声明（见 [config-template.md](../config-template.md#操作列--扩展列配置)），**不写在表格列定义中**。

| 配置写法 | 生成结果 |
|---------|---------|
| `编辑,删除` | `content: ['编辑', '删除']` + `action: [actions.edit<Feature>, actions.delete<Feature>]` |
| `编辑` | 仅编辑按钮 |
| `编辑,停用,详情` | 多按钮，自定义名需在 `TableActions` 声明对应方法 |

按钮名与 `TableActions` 方法一一对应：`编辑` → `edit<Feature>`，`删除` → `delete<Feature>`，自定义名（如 `停用`）→ 需在 `TableActions` 声明对应方法（如 `disable<Feature>`）。

**不生成 `icon` 属性**，仅生成 `content` + `action`。

action 列 `label` 使用 `t('table.action')`。

## 扩展列（可选，表格级）

扩展列（`type: 'expand'`）为表格级属性，在 `## 扩展列` 单独声明，**不写在表格列定义中**。

| 配置写法 | 生成结果 |
|---------|---------|
| `expand` | 生成 expand 列 + `create<Feature>ExpandTableHeadList` 子表列工厂 + `expandMap` 缓存 + `expandChange` 事件 |
| 空 / 不声明 | 不生成 expand 列 |

展开行数据通过 `expandMap`（`reactive<Recordable<Recordable<any>>>`）缓存，行唯一标识为 `row.id`。

## 模板

```typescript
import { ref } from 'vue';
import { useI18n } from '@/hook/web/useI18n';
import type { <Feature>TableActions, <Feature>EditActions } from './types';
// ↓ only if hasSubTable:
import type { <Feature>EditTableActions } from './types';
// ↓ only if dicRemote in config:
import { findDictFromTableApi } from '@/api/<apiModule>';
// ↓ only if expand enabled:
import { ElForm, ElFormItem } from 'element-plus';
import { GvTable } from 'guava-ui';

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

// ↓ only if expand enabled: 展开行子表列
export const create<Feature>ExpandTableHeadList = () => {
  const { t } = useI18n();
  return ref<TableHeadItem[]>([
    { label: t('<i18nKey>.account'), prop: 'account' },
    { label: t('<i18nKey>.userName'), prop: 'userName' },
    { label: t('<i18nKey>.userSn'), prop: 'userSn' },
    { label: t('<i18nKey>.mobile'), prop: 'mobile' },
  ]);
};

export const create<Feature>TableHeadList = (actions: <Feature>TableActions) => {
  const { t } = useI18n();
  return ref<TableHeadItem[]>([
    // ↓ only if expand enabled: 扩展列（可选，配置扩展列含 expand 时生成）
    {
      type: 'expand',
      label: t('table.expand'),
      prop: 'expand',
      render: (scope) => {
        const rowId = scope.row.id;
        const expandData = actions.expandMap[rowId];
        return (
          <div v-loading={!!scope.row._expandLoading}>
            <ElForm label-position="left" inline class="gv-table-expand">
              <ElFormItem label={t('<i18nKey>.userName')}>
                <span>{scope.row.userName}</span>
              </ElFormItem>
              <ElFormItem label={t('<i18nKey>.account')}>
                <span>{scope.row.account}</span>
              </ElFormItem>
            </ElForm>
            <GvTable
              refTable={`<feature>ExpandTable-${scope.$index}`}
              tableHead={create<Feature>ExpandTableHeadList().value}
              tableType="expand"
              tableData={expandData}
              isShowPage={false}
              preserveExpanded={true}
              style={{ maxWidth: '60%', width: 'auto' }}
            />
          </div>
        );
      },
    },
    // 操作列（必须）— 按钮由 ## 操作列 配置推导，无 icon
    {
      type: 'action',
      prop: '',
      label: t('table.action'),
      content: [t('common.edit'), t('common.delete')],
      action: [actions.edit<Feature>, actions.delete<Feature>],
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
      colspan: 4,              // ← 占用列=4（空/1 则不生成）
    },
    {
      type: 'text',
      format: [0, 'isNumber', 20],
      label: t('<i18nKey>.createBy'),
      field: 'createBy',
      readonly: true,           // ← 只读=Y（空则不生成）
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

## 只读与占用列

| 配置列 | 生成属性 | 规则 |
|--------|---------|------|
| 只读 | `readonly: true` | `Y` 时生成；空 → 不生成 |
| 占用列 | `colspan: N` | 数字 N（≥2）时生成 `colspan: N`；空/1 → 不生成（默认占 1 列）；名称含「备注/地址/详情/审核意见/描述/说明」时默认 `colspan: 3` |

```typescript
{
  type: 'text',
  format: [0, 'isNumber', 20],
  label: t('<i18nKey>.createBy'),
  field: 'createBy',
  readonly: true,           // ← 只读=Y
},
{
  type: 'textarea',
  format: [0, 'isAny', 200],
  label: t('<i18nKey>.remark'),
  field: 'remark',
  colspan: 4,               // ← 占用列=4
},
```

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
