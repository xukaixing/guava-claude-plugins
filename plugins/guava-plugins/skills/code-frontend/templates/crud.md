# 列表页模板

> [\_shared.md](../_shared.md)

生成 `src/views/<view>/<Base>Index.vue`。**仅生成 enabled 的方法。**

---

## 1. frontendOnly

- 禁止 `@/api` import，用 [data.md](data.md) 的 `getListResult` / `filterListRecords`
- 删除：有 `id` 时从 `mockListRecords` 移除；无 API

```typescript
import { getFormModel } from 'guava-ui';
import { filterListRecords, getListResult, mockListRecords } from './module/data';

const search<Feature>List = async () => {
  const fm = <feature>SearchFm.value;
  try {
    const query = fm ? getFormModel(fm) || {} : {};
    search<Feature>Data.value = getListResult(filterListRecords(query), { current: 1, size: search<Feature>Data.value?.size || 10 });
  } catch (e) { message(e, 'error'); }
};

const delete<Feature> = (row, index) => {
  confirm('确认删除？').then(async () => {
    try {
      if (row.id) { mockListRecords.splice(mockListRecords.findIndex((r) => r.id === row.id), 1); search<Feature>List(); message('删除成功', 'success'); }
      else crud.removeResult(search<Feature>Data.value, index);
    } catch (e) { message(e, 'error'); }
  }).catch(() => {});
};
```

---

## 2. 方法 / 路径 / 规则

| 操作 | 方法 | 条件 |
| ---- | ---- | ---- |
| 查询 | 配置 methodName | 始终 |
| 新增 | 配置 methodName | add |
| 编辑 | 配置 methodName | edit |
| 删除 | 配置 methodName | delete |
| 保存回调 | `save<Base>Info` | add/edit |

| layout | helper | Edit |
| ------ | ------ | ---- |
| `module` | `./module/helper` | `./module/<Base>Edit.vue` |
| `flat` | `./helper` | `./<Base>Edit.vue` |

---

## 3. 模板

```vue
<script setup lang="tsx">
  import type { FormInstance, TableInstance } from 'element-plus';
  import { nextTick, onMounted, reactive, ref } from 'vue';
  import { findXxxApi } from '@/api/<apiModule>';
  // add: import { saveXxxApi } from '@/api/<apiModule>';
  // edit: import { updateXxxApi } from '@/api/<apiModule>';
  // delete: import { deleteXxxApi } from '@/api/<apiModule>';
  import { crud } from '@/hook/service/useCrud';
  import { useNotify } from '@/hook/web/useNotify';
  import { useI18n } from '@/hook/web/useI18n';
  import { create<Feature>SearchList, create<Feature>TableHeadList } from './module/helper';
  import <Base>Edit from './module/<Base>Edit.vue';  // add/edit

  defineOptions({ name: '<Base>Index' });
  const { message, confirm } = useNotify();
  const { t } = useI18n();

  const <feature>SearchFm = ref<FormInstance>();
  const <feature>SearchList = ref<FormItem[]>([]);
  const <feature>TableList = ref<TableInstanceExp>();  // checkAllEdit/createEditRow 时用 TableInstanceExp
  const <feature>TableHeadList = ref<TableHeadItem[]>([]);
  const search<Feature>Data = ref<Recordable<any>>({});
  // add/edit:
  const dialogVisible = ref<boolean>(false);
  const rowData = ref<Recordable<any>>({});
  const operateType = ref<string>('');
  const title = ref<string>('');

  const search<Feature>List = async () => {
    const fm = <feature>SearchFm.value;
    const table = <feature>TableList.value;
    if (!fm || !table) return;
    try { search<Feature>Data.value = await crud.search(fm, table, findXxxApi); }
    catch (e) { message(e, 'error'); }
  };

  // ↓ add enabled
  const add<Feature> = () => {
    operateType.value = 'add'; rowData.value = {}; dialogVisible.value = true; title.value = '新增<Base>';
  };
  // ↓ edit enabled
  const edit<Feature> = (row: Recordable<any>, _index: number) => {
    operateType.value = 'update'; rowData.value = row; dialogVisible.value = true; title.value = '编辑<Base>';
  };
  // ↓ delete enabled
  const delete<Feature> = (row: Recordable<any>, index: number) => {
    confirm('确认删除？').then(async () => {
      try {
        if (row.id) { await crud.submit(deleteXxxApi, { id: row.id }); search<Feature>List(); message('success', '删除成功'); }
        else crud.removeResult(search<Feature>Data.value, index);
      } catch (e) { message(e, 'error'); }
    }).catch(() => {});
  };
  // ↓ add/edit enabled
  const save<Base>Info = (payload: { type: 'update' | 'insert'; data: Recordable<any>; rownums?: number }) => {
    if (payload.type === 'update') crud.updateResult(search<Feature>Data.value, payload.data, payload.rownums!);
    else crud.insertResult(search<Feature>Data.value, payload.data);
    dialogVisible.value = false;
  };

  // ↓ expand enabled
  const expandMap = reactive<Recordable<Recordable<any>>>({});
  const loadExpandRow = async (row: Recordable<any>) => {
    const id = row.id;
    if (expandMap[id] || row._expandLoading) return;
    row._expandLoading = true;
    try { expandMap[id] = await fetchExpandTableData(row); }
    catch (e) { message(e, 'error'); }
    finally { row._expandLoading = false; }
  };
  const expandChange = async (row: Recordable<any>, rows: Recordable<any>[]) => {
    if (!rows.includes(row)) return;
    await loadExpandRow(row);
  };

  <feature>SearchList.value = create<Feature>SearchList().value;
  <feature>TableHeadList.value = create<Feature>TableHeadList({ edit<Feature>, delete<Feature>, expandMap }).value;  // expand: expandMap

  onMounted(() => nextTick(() => search<Feature>List()));
</script>

<template>
  <div>
    <GvForm ref="<feature>SearchFm" ref-form="<feature>SearchFm" :divider="'搜索条件'" :form-list="<feature>SearchList">
      <GvSearchBar>
        <GvButton @click="search<Feature>List()">搜索</GvButton>
        <GvButton>重置</GvButton>
      </GvSearchBar>
    </GvForm>
    <GvTable ref="<feature>TableList" ref-table="<feature>TableList" :table-head="<feature>TableHeadList" :table-data="search<Feature>Data"
      @expand-change="expandChange">  <!-- expand -->
      <GvButton @click="add<Feature>()">新增</GvButton>  <!-- add -->
    </GvTable>
    <<Base>Edit v-model:visible="dialogVisible" :row-data="rowData" :operate-type="operateType" :title="title" @saved="save<Base>Info" />
  </div>
</template>
```

---

## 4. 关键规则

- 删除：`crud.submit(api, { id: row.id })`
- `@hook`：`useI18n` + `useNotify`（`i18n: false` 时省略）
- 无 add/edit：省略 dialog state 和 Edit 组件
- `i18n: false`：template 内 `t('xxx')` 替换为中文；不 `import useI18n`
- TableInstance：有 `checkAllEdit()` / `createEditRow()` 时用 `TableInstanceExp`
