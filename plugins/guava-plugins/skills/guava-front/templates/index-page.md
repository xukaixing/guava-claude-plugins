# 列表页模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

生成 `src/views/<viewPath>/<Base>Index.vue`。**仅生成 CRUD 配置中 enabled 的方法。**

## 方法生成条件

| 操作     | 方法             | 条件             |
| -------- | ---------------- | ---------------- |
| 查询     | 配置 methodName  | 始终             |
| 新增     | 配置 methodName  | add enabled      |
| 编辑     | 配置 methodName  | edit enabled     |
| 删除     | 配置 methodName  | delete enabled   |
| 保存回调 | `save<Base>Info` | add/edit enabled |

## import 路径

| layout   | helper import     | Edit import               |
| -------- | ----------------- | ------------------------- |
| `module` | `./module/helper` | `./module/<Base>Edit.vue` |
| `flat`   | `./helper`        | `./<Base>Edit.vue`        |

## 模板

```vue
<!--
 * @title: <moduleTitle>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->
<script setup lang="tsx">
  import type { FormInstance, TableInstance } from 'element-plus';
  import { nextTick, onMounted, ref } from 'vue';
  import { findXxxApi } from '@/api/<apiModule>';         // ← always
  import { saveXxxApi } from '@/api/<apiModule>';        // ← add enabled
  import { updateXxxApi } from '@/api/<apiModule>';     // ← edit enabled
  import { deleteXxxApi } from '@/api/<apiModule>';     // ← delete enabled
  import { crud } from '@/hook/service/useCrud';
  import { useNotify } from '@/hook/web/useNotify';
  import { useI18n } from '@/hook/web/useI18n';
  import { create<Feature>SearchList, create<Feature>TableHeadList } from './module/helper';
  import <Base>Edit from './module/<Base>Edit.vue';     // ← add/edit + generateEditPage

  // @define name
  defineOptions({ name: '<Base>Index' });

  // @hook
  const { message, confirm } = useNotify();
  const { t } = useI18n();

  // @data
  const <feature>SearchFm = ref<FormInstance>();
  const <feature>SearchList = ref<FormItem[]>([]);
  const <feature>TableList = ref<TableInstance>();
  const <feature>TableHeadList = ref<TableHeadItem[]>([]);
  const search<Feature>Data = ref<Recordable<any>>({});
  // ↓ add/edit enabled:
  const dialogVisible = ref<boolean>(false);
  const rowData = ref<Recordable<any>>({});
  const operateType = ref<string>('');
  const title = ref<string>('');

  // @methods
  const search<Feature>List = async () => {
    const fm = <feature>SearchFm.value;
    const table = <feature>TableList.value;
    if (!fm || !table) return;
    try {
      search<Feature>Data.value = await crud.search(fm, table, findXxxApi);
    } catch (e) {
      message(e, 'error');
    }
  };

  // ↓ add enabled:
  const add<Feature> = () => {
    operateType.value = 'add';
    rowData.value = {};
    dialogVisible.value = true;
    title.value = t('<i18nKey>.add<Base>');
  };

  // ↓ edit enabled:
  const edit<Feature> = (row: Recordable<any>, _index: number) => {
    operateType.value = 'update';
    rowData.value = row;
    dialogVisible.value = true;
    title.value = t('<i18nKey>.edit<Base>');
  };

  // ↓ delete enabled:
  const delete<Feature> = (row: Recordable<any>, index: number) => {
    confirm(t('<i18nKey>.deleteConfirm'))
      .then(async () => {
        try {
          if (row.id) {
            await crud.submit(deleteXxxApi, { id: row.id });
            search<Feature>List();
            message(t('<i18nKey>.deleteSuccess'), 'success');
          } else {
            crud.removeResult(<feature>TableList.value, index);
          }
        } catch (e) {
          message(e, 'error');
        }
      })
      .catch(() => {});
  };

  // ↓ add/edit enabled:
  const save<Base>Info = (payload: { type: 'update' | 'insert'; data: Recordable<any>; rownums?: number }) => {
    const tableData = search<Feature>Data.value;
    if (payload.type === 'update') crud.updateResult(tableData, payload.data, payload.rownums!);
    else crud.insertResult(tableData, payload.data);
    dialogVisible.value = false;
  };

  // @bizData
  <feature>SearchList.value = create<Feature>SearchList().value;
  <feature>TableHeadList.value = create<Feature>TableHeadList({
    edit<Feature>: edit<Feature>,    // ← edit enabled
    delete<Feature>: delete<Feature>, // ← delete enabled
  }).value;

  // @mounted
  onMounted(() => {
    nextTick(() => {
      search<Feature>List();
    });
  });
</script>

<template>
  <div>
    <GvForm
      ref="<feature>SearchFm"
      ref-form="<feature>SearchFm"
      :divider="t('searchBar.searchFilter')"
      :form-list="<feature>SearchList">
      <GvSearchBar>
        <GvButton @click="search<Feature>List()">{{ t('common.search') }}</GvButton>
        <GvButton>{{ t('searchBar.reset') }}</GvButton>
      </GvSearchBar>
    </GvForm>
    <GvTable
      ref="<feature>TableList"
      ref-table="<feature>TableList"
      :table-head="<feature>TableHeadList"
      :table-data="search<Feature>Data">
      <GvButton @click="add<Feature>()">{{ t('common.add') }}</GvButton>  <!-- add enabled -->
    </GvTable>
    <<Base>Edit
      v-model:visible="dialogVisible"
      :row-data="rowData"
      :operate-type="operateType"
      :title="title"
      @saved="save<Base>Info" />
  </div>
</template>
```

## 关键规则

- 删除使用 `crud.submit(api, { id: row.id })`
- `@hook` 放 `useI18n` + `useNotify`
- `@bizData` 放 helper `.value` 赋值
- Edit 组件传 `:title="title"`（与 salesSkills / companyBusiness 一致）
- 无 add/edit 时省略 dialog 相关 state 和 Edit 组件
