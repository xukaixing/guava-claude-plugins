> GvCrud 是 guava-ui 的 CRUD 工具函数集合，非 Vue 组件。通过 import { crud } from 'guava-ui' 使用。

# Crud 工具函数

::: tip
`GvCrud` 不是 Vue 组件，而是 CRUD 工具函数集合。通过 `import { crud } from 'guava-ui'` 或 `import { crud } from '@/hook/service/useCrud'` 使用。
:::

## 导入

```typescript
import { crud } from 'guava-ui';
// 或
import { crud } from '@/hook/service/useCrud';
```

## API

### Crud Methods

| 方法名 | 说明 | 参数 | 返回 |
| ------ | ---- | ---- | ---- |
| search | 查询列表（有表单有表格） | `(fmNode: FormInstance, tabNode: TableInstance, fetch: AsyncFn)` | `Promise<Recordable>` |
| searchNoFm | 查询列表（无表单，仅表格） | `(tabNode: TableInstance, fetch: AsyncFn, data: any)` | `Promise<Recordable>` |
| fetchData | 通用获取数据（无分页） | `(fetch: AsyncFn, data: any)` | `Promise<any>` |
| fetchTable | 获取表格数据（带分页） | `(fetch: AsyncFn, data: any, tabNode?: TableInstance \| null)` | `Promise<any>` |
| submit | 通用提交（带成功提示） | `(fetch: AsyncFn, datas: any, hasMsg?: boolean, msg?: string)` | `Promise<any>` |
| save | 保存表单（新增） | `(fmNode: FormInstance, fetch: AsyncFn, check?: boolean, msg?: string)` | `Promise<Recordable \| null>` |
| update | 更新表单（编辑） | `(fmNode: FormInstance, id: number, fetch: Async2Fn, check?: boolean, msg?: string)` | `Promise<Recordable \| null>` |
| toNewPageSearch | 分页查询 | `(tabNode: ComponentInternalInstance \| null, filterConditions: Recordable, fetch: AsyncFn, pageInfo: PageInfo)` | `Promise<Recordable>` |
| insertResult | 表格插入行（本地） | `(searchData: Recordable, result: any)` | `boolean` |
| updateResult | 表格更新行（本地） | `(searchData: any, result: any, rownums: number)` | `boolean` |
| removeResult | 表格删除行（本地） | `(searchData: any, index: number)` | `boolean` |
| setEditValue | 设置表单编辑值（回填） | `(formList: FormItem[], rowData: Recordable)` | `boolean` |
| resetEditValue | 重置表单编辑值 | `(formList: FormItem[])` | `boolean` |
| checkForms | 校验多个表单 | `(fmNodes: FormInstance[])` | `Promise<boolean>` |

### 类型说明

| 类型 | 说明 |
| ---- | ---- |
| `AsyncFn` | `(data: any) => Promise<{ datas: any }>` — 标准 API 函数签名 |
| `Async2Fn` | `(id: number, data: any) => Promise<{ datas: any }>` — 带 ID 的 API 函数 |
| `FormInstance` | Element Plus 表单实例类型 |
| `TableInstance` | Element Plus 表格实例类型 |
| `FormItem` | guava-ui 表单域配置类型 |
| `Recordable` | `{ [key: string]: any }` |

### 方法详解

#### search — 查询列表（有表单）

```typescript
const search = async () => {
  const fm = demoSearchFm.value;
  const table = demoResultList.value;
  if (!fm || !table) return;
  resultData.value = await crud.search(fm, table, findUsersApi);
};
```

- 自动校验表单 → 拼接查询条件（含分页）→ 调用 API → 返回结果
- 查询条件与 fetch 保存在 table 实例上，供分页复用

#### searchNoFm — 查询列表（无表单）

```typescript
const search = async () => {
  const table = demoResultList.value;
  if (!table) return;
  resultData.value = await crud.searchNoFm(table, findUsersApi, {});
};
```

- 无表单时使用，直接传 data 对象

#### fetchData — 通用获取数据

```typescript
const data = await crud.fetchData(findDetailApi, { id: rowId });
```

- 简单的 API 调用，返回 `res.datas`

#### fetchTable — 获取表格数据（带分页）

```typescript
const data = await crud.fetchTable(findUsersApi, searchParams, tableRef.value);
```

- 自动合并分页信息，保存 fetch 到 table 实例

#### submit — 通用提交

```typescript
await crud.submit(saveApi, formData);
await crud.submit(saveApi, formData, true, '自定义成功提示');
```

- 自动显示成功提示（默认中文/英文根据语言设置）
- `hasMsg=false` 禁用提示

#### save — 保存表单（新增）

```typescript
const ok = await crud.save(fmNode.value, saveApi);
if (ok) {
  // 保存成功
}
```

- 自动校验表单 → 拼接保存条件 → 调用 API
- `check=false` 跳过校验

#### update — 更新表单（编辑）

```typescript
const ok = await crud.update(fmNode.value, rowId, updateApi);
if (ok) {
  // 更新成功
}
```

- 与 save 类似，但第一个参数是 ID（用于 URL 参数）

#### setEditValue — 回填表单

```typescript
const edit = (row: Recordable) => {
  crud.setEditValue(editFormList.value, row);
  dialogVisible.value = true;
};
```

- 将行数据回填到 formList（自动处理字典、日期、多选等类型）
- 先调用 resetEditValue 清空，再逐字段赋值

#### resetEditValue — 重置表单

```typescript
crud.resetEditValue(editFormList.value);
```

- 清空所有字段值（text/textarea/number → ''，dic → '' + showLabel → ''）
- `keep: true` 或 `type: 'blank'` 的字段不重置

#### insertResult / updateResult / removeResult — 本地行操作

```typescript
// 新增行后插入到列表开头
crud.insertResult(resultData.value, newRow);

// 更新行后同步到列表
crud.updateResult(resultData.value, updatedRow, row.rownums);

// 删除行
crud.removeResult(resultData.value, index);
```

- 直接修改 `searchData.records` 数组
- 用于前端编辑行（inline edit）场景

#### checkForms — 校验多个表单

```typescript
const allValid = await crud.checkForms([fm1.value, fm2.value]);
if (allValid) {
  // 所有表单校验通过
}
```

- 依次校验多个表单实例
- 任一表单校验失败返回 false

#### toNewPageSearch — 分页查询

```typescript
const data = await crud.toNewPageSearch(
  tableRef.value,
  filterConditions,
  fetchApi,
  { currentpagenum: 2, recordsperpage: 10 }
);
```

- 翻页时复用已保存的查询条件，仅更新分页参数

## 示例源码（已内嵌，无需 press）

### CrudSearch

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { crud } from 'guava-ui';
import { findUsersApi } from '@/api/admin/user';
import { buildSearchFilter, buildTableHeadList } from './module/helper';

const demoSearchFm = ref();
const demoResultList = ref();
const resultData = ref({});

const search = async () => {
  const fm = demoSearchFm.value;
  const table = demoResultList.value;
  if (!fm || !table) return;
  resultData.value = await crud.search(fm, table, findUsersApi);
};

const searchFilter = computed(() => buildSearchFilter({}));
const tableHeadList = computed(() => buildTableHeadList({}));

onMounted(() => {
  nextTick(() => search());
});
</script>

<template>
  <div>
    <GvForm ref="demoSearchFm" ref-form="demoSearchFm" :form-list="searchFilter">
      <GvSearchBar>
        <GvButton @click="search()">搜索</GvButton>
      </GvSearchBar>
    </GvForm>
    <GvTable ref="demoResultList" ref-table="demoResultList" :table-head="tableHeadList" :table-data="resultData" />
  </div>
</template>
```

### CrudEdit

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { crud } from 'guava-ui';
import { saveUserApi, updateUserApi } from '@/api/admin/user';
import { createUserEditList } from './module/helper';

const editFm = ref();
const dialogVisible = ref(false);
const operateType = ref('');
const rowData = ref({});
const editFormList = ref(createUserEditList());

const edit = (row: Recordable) => {
  operateType.value = 'update';
  rowData.value = row;
  crud.setEditValue(editFormList.value, row);
  dialogVisible.value = true;
};

const add = () => {
  operateType.value = 'create';
  crud.resetEditValue(editFormList.value);
  dialogVisible.value = true;
};

const saveRow = async () => {
  if (operateType.value === 'create') {
    const ok = await crud.save(editFm.value, saveUserApi);
    if (ok) dialogVisible.value = false;
  } else {
    const ok = await crud.update(editFm.value, rowData.value.id, updateUserApi);
    if (ok) dialogVisible.value = false;
  }
};
</script>

<template>
  <GvDialog v-model:visible="dialogVisible" title="编辑" width="600px">
    <GvForm ref="editFm" ref-form="editFm" :form-list="editFormList" />
    <template #footer>
      <GvButton @click="saveRow()">保存</GvButton>
      <GvButton @click="dialogVisible = false">取消</GvButton>
    </template>
  </GvDialog>
</template>
```

### CrudInlineEdit

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { crud } from 'guava-ui';
import { saveUserApi, updateUserApi } from '@/api/admin/user';

const tableRef = ref();
const resultData = ref({ records: [], total: 0 });

const addRow = () => {
  tableRef.value?.createEditRow?.(0);
};

const saveRow = async (row: Recordable, index: number) => {
  if (row._isNew) {
    const ok = await crud.save(tableRef.value, saveUserApi);
    if (ok) {
      crud.insertResult(resultData.value, ok);
      tableRef.value?.deleteEditRow?.(index);
    }
  } else {
    const ok = await crud.update(tableRef.value, row.id, updateUserApi);
    if (ok) {
      crud.updateResult(resultData.value, ok, row.rownums);
      tableRef.value?.deleteEditRow?.(index);
    }
  }
};

const deleteRow = (index: number) => {
  crud.removeResult(resultData.value, index);
};
</script>

<template>
  <GvTable ref="tableRef" ref-table="tableRef" :table-head="tableHeadList" :table-data="resultData">
    <GvButton @click="addRow()">新增编辑行</GvButton>
  </GvTable>
</template>
```
