# 多 Tab 列表页

> [\_shared.md](../_shared.md) · [page-types.md#tabs](../page-types.md#tabs)

生成 `<Base>Index.vue`，外层 `GvTabs`。

---

## 与 crud-module 差异

| 项目 | crud-module | tabs |
| ---- | ----------- | ---- |
| 根容器 | `<div>` | `<GvTabs>` + `<GvTabPane>` |
| 搜索/表格 | 页面主体 | 仅 `search-table` Tab |
| Drawer Edit | add/edit 时 | `editMode: drawer` 时 |
| inline 保存 | — | `save{Component}Inline` |
| helper | Search/Table/Edit | 追加 `create{Feature}InlineEditList` |

---

## 模板

```vue
<script setup lang="tsx">
  import type { FormInstance, TableInstance, TabsPaneContext } from 'element-plus';
  import { nextTick, onMounted, ref } from 'vue';
  import { findXxxApi } from '@/api/<apiModule>';
  import { saveXxxApi, updateXxxApi, deleteXxxApi } from '@/api/<apiModule>';
  import { crud } from '@/hook/service/useCrud';
  import { useUtil } from '@/hook/service/useUtil';
  import { useNotify } from '@/hook/web/useNotify';
  import { useI18n } from '@/hook/web/useI18n';
  import { create<Feature>SearchList, create<Feature>TableHeadList, create<Feature>EditList, create<Feature>InlineEditList } from './module/helper';
  import <Base>Edit from './module/<Base>Edit.vue';  // editMode=drawer

  defineOptions({ name: '<Base>Index' });
  const { message, confirm } = useNotify();
  const { t } = useI18n();
  const { getFormModel } = useUtil();

  const <feature>SearchFm = ref<FormInstance>();
  const <feature>SearchList = ref<FormItem[]>([]);
  const <feature>TableList = ref<TableInstanceExp>();
  const <feature>TableHeadList = ref<TableHeadItem[]>([]);
  const search<Feature>Data = ref<Recordable<any>>({});
  const dialogVisible = ref<boolean>(false);
  const rowData = ref<Recordable<any>>({});
  const operateType = ref<string>('');
  const activeTab = ref('list');
  const <feature>InlineFm = ref<FormInstance>();
  const <feature>InlineEditList = ref<FormItem[]>([]);

  const search<Feature>List = async () => {
    const fm = <feature>SearchFm.value;
    const table = <feature>TableList.value;
    if (!fm || !table) return;
    try { search<Feature>Data.value = await crud.search(fm, table, findXxxApi); }
    catch (e) { message(e, 'error'); }
  };

  const add<Feature> = () => { operateType.value = 'add'; rowData.value = {}; dialogVisible.value = true; };
  const edit<Feature> = (row, _) => { operateType.value = 'update'; rowData.value = row; dialogVisible.value = true; };
  const delete<Feature> = (row, index) => {
    confirm('确认删除？').then(async () => {
      try { if (row.id) { await crud.submit(deleteXxxApi, { id: row.id }); search<Feature>List(); message('success', '删除成功'); } else crud.removeResult(search<Feature>Data.value, index); }
      catch (e) { message(e, 'error'); }
    }).catch(() => {});
  };
  const save<Base>Info = (payload) => { if (payload.type === 'update') crud.updateResult(search<Feature>Data.value, payload.data, payload.rownums!); else crud.insertResult(search<Feature>Data.value, payload.data); dialogVisible.value = false; };
  const save<Feature>Inline = async () => { const fm = <feature>InlineFm.value; if (!fm) return; try { const ok = await crud.save(fm, saveXxxApi); if (ok) message('success', '保存成功'); } catch (e) { message(e, 'error'); } };
  const handleTabClick = (tab: TabsPaneContext) => { activeTab.value = tab.paneName as string; };

  const dictCB = (_, __, ___) => {};
  const dictClearCB = (_, __, ___) => {};

  <feature>SearchList.value = create<Feature>SearchList().value;
  <feature>TableHeadList.value = create<Feature>TableHeadList({ edit<Feature>, delete<Feature> }).value;
  <feature>InlineEditList.value = create<Feature>InlineEditList({ dictCB, dictClearCB }).value;

  onMounted(() => nextTick(() => search<Feature>List()));
</script>

<template>
  <div>
    <GvTabs v-model="activeTab" @tab-click="handleTabClick">
      <GvTabPane name="list" :label="'查询-列表'">
        <GvForm ref="<feature>SearchFm" ref-form="<feature>SearchFm" :divider="'搜索条件'" :form-list="<feature>SearchList">
          <GvSearchBar>
            <GvButton @click="search<Feature>List()">搜索</GvButton>
            <GvButton>重置</GvButton>
          </GvSearchBar>
        </GvForm>
        <GvTable ref="<feature>TableList" ref-table="<feature>TableList" :table-head="<feature>TableHeadList" :table-data="search<Feature>Data">
          <GvButton @click="add<Feature>()">新增</GvButton>
        </GvTable>
      </GvTabPane>
      <GvTabPane name="edit" :label="'新增-修改'">
        <GvForm ref="<feature>InlineFm" ref-form="<feature>InlineFm" :divider="'编辑信息'" :form-list="<feature>InlineEditList" />
        <div class="form-actions"><GvButton type="primary" @click="save<Feature>Inline()">保存</GvButton></div>
      </GvTabPane>
    </GvTabs>
    <<Base>Edit v-model:visible="dialogVisible" :row-data="rowData" :operate-type="operateType" :title="rowData?.id ? '编辑' : '新增'" @saved="save<Base>Info" />
  </div>
</template>
```
