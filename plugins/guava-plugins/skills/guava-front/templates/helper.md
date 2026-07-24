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

### 配置格式

#### 简写（默认子表表格）

```markdown
## 扩展列
expand
```

#### 完整配置（自定义 render 内容）

```markdown
## 扩展列
expand:
  type: table          # table | custom | both（默认 table）
  columns:             # type=table 或 both 时必填
    - label: 用户账号
      prop: account
    - label: 用户姓名
      prop: userName
  template:            # type=custom 或 both 时可选，自定义模板内容
    <div class="expand-custom">
      <p>自定义内容：{scope.row.fieldName}</p>
    </div>
  api:                 # 有后端时指定 API 端点（可选）
    find: /xxx/findDtl
```

### 配置项说明

| 字段 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| `type` | `string` | | `table`（子表表格）\| `custom`（自定义 div）\| `both`（两者组合），默认 `table` |
| `columns` | `array` | table/both 时 | 子表列定义，每项含 `label` / `prop` / `width` / `type` |
| `template` | `string` | | 自定义模板内容（JSX 片段），支持 `{scope.row.xxx}` 插值 |
| `api` | `object` | | 后端 API 配置（有后端时） |

### 生成结果

| 配置写法 | 生成结果 |
| ------- | -------- |
| `expand`（简写） | 子表表格（自动推断列）+ `expandMap` + `expandChange` + `fetchExpandTableData` |
| `type: table` | 子表表格（使用配置的 columns）+ 数据拉取 |
| `type: custom` | 自定义 div 内容（使用配置的 template） |
| `type: both` | 自定义 template + 子表表格组合 |
| 空 / 不声明 | 不生成 |

展开行数据通过 `expandMap`（`reactive<Recordable<Recordable<any>>>`）缓存，行唯一标识为 `row.id`。

### expand render 模板

参考 `demo/demoTable/module/helper.tsx` 的 expand 列模式。

#### type=table 时

只展示子表表格，**不带 ElForm**：

```typescript
// 子表列定义
const expand<Feature>HeadList: TableHeadItem[] = [
  { label: '用户账号', prop: 'account' },
  { label: '用户姓名', prop: 'userName' },
];

// expand 列（含 render）
{
  type: 'expand',
  label: '展开',
  prop: 'expand',
  render: (scope) => {
    const rowId = scope.row.id;
    const expandData = actions.expandMap[rowId];
    return (
      <div v-loading={!!scope.row._expandLoading}>
        <GvTable
          refTable={`<feature>ExpandTable-${scope.$index}`}
          tableHead={expand<Feature>HeadList}
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
```

#### type=custom 时

只展示自定义 div 内容：

```typescript
{
  type: 'expand',
  label: '展开',
  prop: 'expand',
  render: (scope) => {
    return (
      <div class="expand-custom">
        <p>自定义内容：{scope.row.userName}</p>
        <p>账号：{scope.row.account}</p>
      </div>
    );
  },
},
```

#### type=both 时

自定义 div + 子表表格组合：

```typescript
{
  type: 'expand',
  label: '展开',
  prop: 'expand',
  render: (scope) => {
    const rowId = scope.row.id;
    const expandData = actions.expandMap[rowId];
    return (
      <div v-loading={!!scope.row._expandLoading}>
        <!-- 自定义内容 -->
        <div class="expand-custom">
          <p>自定义内容：{scope.row.userName}</p>
        </div>
        <!-- 子表表格 -->
        <GvTable
          refTable={`<feature>ExpandTable-${scope.$index}`}
          tableHead={expand<Feature>HeadList}
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
```

### 数据拉取函数（Index 页声明，type=table 或 both 时）

```typescript
/**
 * 展开行时按需拉取子表数据；已加载过则直接复用 expandMap 缓存
 */
const loadExpandRow = async (row: Recordable<any>) => {
  const rowId = row.id;
  if (expandMap[rowId] || row._expandLoading) return;
  row._expandLoading = true;
  try {
    expandMap[rowId] = await fetchExpandTableData(row);
  } catch (e) {
    message(e, 'error');
  } finally {
    row._expandLoading = false;
  }
};

const expandChange = async (row: Recordable<any>, expandedRows: Recordable<any>[]) => {
  const expanded = expandedRows.includes(row);
  if (!expanded) return;
  await loadExpandRow(row);
};
```

### 子表数据获取函数（helper.tsx 或 api.ts，type=table 或 both 时）

```typescript
// frontendOnly 时：mock 数据
export const fetchExpandTableData = (row: Recordable<any>): Promise<Recordable<any>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        records: [
          { account: `${row.account}-sub1`, userName: `${row.userName}-子账号1` },
          { account: `${row.account}-sub2`, userName: `${row.userName}-子账号2` },
        ],
        total: 2, size: 10, current: 1, pages: 1,
      });
    }, 400);
  });

// 有后端时：调用 API
export const find<Feature>DtlApi = (datas: Recordable<any>) => {
  const { fetch } = useFetch();
  return fetch.post(`${server.<gateway>}/<apiEndpoint>`, datas);
};
```

### Index 页 GvTable 绑定

```vue
<GvTable
  ...
  @expand-change="expandChange">
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
import { ElForm, ElFormItem } from 'element-plus';
import { GvTable } from 'guava-ui';

export const create<Feature>SearchList = () => {
  // ↓ i18n: true 时才解构 t
  // const { t } = useI18n();
  return ref<FormItem[]>([
    { type: 'text', format: [0, 'isNumberLetter', 30], label: '用户账号', field: 'u@account' },
    { type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'u@status' },
    { type: 'date', format: [0, 'isDate', 10], dateType: 'daterange', label: '创建时间', field: 'createTime' },
  ]);
};

// ↓ only if expand enabled — 子表列（type=table 或 both 时）
const expand<Feature>HeadList: TableHeadItem[] = [
  { label: '用户账号', prop: 'account' },
  { label: '用户姓名', prop: 'userName' },
  { label: '工号', prop: 'userSn' },
  { label: '联系方式', prop: 'mobile' },
];

// ↓ only if expand enabled — 子表数据获取（type=table 或 both 时，frontendOnly 用 mock）
export const fetchExpandTableData = (row: Recordable<any>): Promise<Recordable<any>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        records: [
          { account: `${row.account}-sub1`, userName: `${row.userName}-子账号1` },
          { account: `${row.account}-sub2`, userName: `${row.userName}-子账号2` },
        ],
        total: 2, size: 10, current: 1, pages: 1,
      });
    }, 400);
  });

export const create<Feature>TableHeadList = (actions: <Feature>TableActions) => {
  return ref<TableHeadItem[]>([
    // ↓ only if expand enabled — 展开列（含 render）
    // type=table: 只展示子表表格（无 ElForm）
    // type=custom: 只展示自定义 div
    // type=both: 自定义 div + 子表表格
    {
      type: 'expand',
      label: '展开',
      prop: 'expand',
      render: (scope) => {
        const rowId = scope.row.id;
        const expandData = actions.expandMap[rowId];
        return (
          <div v-loading={!!scope.row._expandLoading}>
            <!-- type=custom 或 both 时：自定义内容 -->
            <!-- <div class="expand-custom"><p>{scope.row.userName}</p></div> -->
            <!-- type=table 或 both 时：子表表格 -->
            <GvTable
              refTable={`<feature>ExpandTable-${scope.$index}`}
              tableHead={expand<Feature>HeadList}
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
