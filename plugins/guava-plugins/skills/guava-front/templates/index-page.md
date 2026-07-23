# 列表页模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

生成 `src/views/<view>/<Base>Index.vue`，其中 `<view>` = YAML **`view` 原文**（勿用 pages 路径）。**仅生成 CRUD 配置中 enabled 的方法。**

## `frontendOnly: true`

- **禁止** `import … from '@/api/…'`
- 生成并 import [data.md](data.md)：`getListResult` / `filterListRecords` / `mockListRecords` / `listTransHash`
- `search*`：赋给 `search*Data` 的值 = 后台 **`datas`** 形态（含分页；`records[0]` 可为 `transHash`）
- `delete*`：有 `id` 时从 `mockListRecords` 移除并刷新；无 API
- add/edit：仍可用 Drawer；Edit 见 [edit-page.md](edit-page.md#frontendonly-true)；`save*Info` 仍用 `crud.insertResult` / `updateResult`（写入的行若含 dic 字段须为 `{c,v}`）

### 查询方法（替换默认 search）

```typescript
  import { getFormModel } from 'guava-ui';
  import { filterListRecords, getListResult, mockListRecords } from './module/data'; // flat: ./data

  const search<Feature>List = async () => {
    const fm = <feature>SearchFm.value;
    try {
      const query = fm ? getFormModel(fm) || {} : {};
      const filtered = filterListRecords(query);
      // 查询重置到第 1 页；分页字段对齐后台 datas
      search<Feature>Data.value = getListResult(filtered, {
        current: 1,
        size: search<Feature>Data.value?.size || 10,
      });
    } catch (e) {
      message(e, 'error');
    }
  };

  const delete<Feature> = (row: Recordable<any>, index: number) => {
    confirm(t('<i18nKey>.deleteConfirm'))
      .then(async () => {
        try {
          if (row.id) {
            const i = mockListRecords.findIndex((r) => String(r.id) === String(row.id));
            if (i >= 0) mockListRecords.splice(i, 1);
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
```

`save<Base>Info` 在 insert 时建议同步 `mockListRecords.push(payload.data)`，update 时按 `id` 写回 `mockListRecords`，再关 Drawer。

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
  // ↓ only if tableBar import enabled:
  // import { importXxxApi, exportXxxApi, findExportFieldsApi, saveExportFieldsApi } from '@/api/<apiModule>';
  // import { GvImportDialog } from '@/components/GvImportDialog';
  // import { GvExportDialog } from '@/components/GvExportDialog';
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
  /**
   * @todo: 查询<Feature>列表
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   */
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
  /**
   * @todo: 新增<Feature>
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   */
  const add<Feature> = () => {
    operateType.value = 'add';
    rowData.value = {};
    dialogVisible.value = true;
    title.value = t('<i18nKey>.add<Base>');
  };

  // ↓ edit enabled:
  /**
   * @todo: 编辑<Feature>
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   * @param row 当前行数据
   * @param _index 行索引
   */
  const edit<Feature> = (row: Recordable<any>, _index: number) => {
    operateType.value = 'update';
    rowData.value = row;
    dialogVisible.value = true;
    title.value = t('<i18nKey>.edit<Base>');
  };

  // ↓ delete enabled:
  /**
   * @todo: 删除<Feature>
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   * @param row 当前行数据
   * @param index 行索引
   */
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
  /**
   * @todo: 保存<Feature>信息回调
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   * @param payload 保存结果
   */
  const save<Base>Info = (payload: { type: 'update' | 'insert'; data: Recordable<any>; rownums?: number }) => {
    const tableData = search<Feature>Data.value;
    if (payload.type === 'update') crud.updateResult(tableData, payload.data, payload.rownums!);
    else crud.insertResult(tableData, payload.data);
    dialogVisible.value = false;
  };

  // ↓ only if tableBar custom buttons enabled（如 校验编辑行）:
  // const check<Feature> = () => { ... };

  // ↓ only if expand enabled: 展开行数据缓存
  // const expandMap = reactive<Recordable<Recordable<any>>>({});

  // ↓ only if expand enabled: 展开行事件
  // const loadExpandRow = async (row: Recordable<any>) => {
  //   const rowId = row.id;
  //   if (expandMap[rowId] || row._expandLoading) return;
  //   row._expandLoading = true;
  //   try {
  //     expandMap[rowId] = await fetchExpandTableData(row);
  //   } catch (e) {
  //     message(e, 'error');
  //   } finally {
  //     row._expandLoading = false;
  //   }
  // };
  // const expandChange = async (row: Recordable<any>, expandedRows: Recordable<any>[]) => {
  //   const expanded = expandedRows.includes(row);
  //   if (!expanded) return;
  //   await loadExpandRow(row);
  // };

  // @bizData
  <feature>SearchList.value = create<Feature>SearchList().value;
  <feature>TableHeadList.value = create<Feature>TableHeadList({
    edit<Feature>: edit<Feature>,    // ← edit enabled
    delete<Feature>: delete<Feature>, // ← delete enabled
    // ↓ only if expand enabled:
    // expandMap,
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
      :table-data="search<Feature>Data"
      @expand-change="expandChange">  <!-- ← only if expand enabled -->
      <GvButton @click="add<Feature>()">{{ t('common.add') }}</GvButton>  <!-- add enabled -->
      <!-- ↓ only if tableBar buttons enabled（自定义按钮，新增编辑行/校验编辑行 等） -->
      <!-- <GvButton @click="add()">{{ t('tableBar.addEditRow') }}</GvButton> -->
      <!-- <GvButton @click="check()">{{ t('tableBar.checkEditRow') }}</GvButton> -->
      <!-- ↓ only if tableBar import enabled: -->
      <!-- <template #import> -->
      <!--   <GvImportDialog :import="importXxxApi" :params="importParams" :cb="importCb" /> -->
      <!-- </template> -->
      <!-- ↓ only if tableBar export enabled: -->
      <!-- <template #export> -->
      <!--   <GvExportDialog :export="exportXxxApi" :findExportFields="findExportFieldsApi" :saveExportFields="saveExportFieldsApi" /> -->
      <!-- </template> -->
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
- `@hook` 放 `useI18n` + `useNotify`（`i18n: false` 时省略 `useI18n`）
- `@bizData` 放 helper `.value` 赋值
- Edit 组件传 `:title="title"`（与 salesSkills / companyBusiness 一致）
- 无 add/edit 时省略 dialog 相关 state 和 Edit 组件
- **`i18n: false`（默认）**：template 内 `t('xxx')` 替换为硬编码中文字符串；不 `import useI18n`
