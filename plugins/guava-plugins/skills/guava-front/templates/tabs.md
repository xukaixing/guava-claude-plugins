# 多 Tab 列表页

> [\_shared.md](../_shared.md) · [page-types.md#tabs](../page-types.md#tabs)

生成 `<Base>Index.vue`，外层 GvTabs，Tab 按 `tabs[].type` 渲染。

---

## 1. 与 crud-module 的差异

| 项目 | crud-module | tabs |
| ---- | ----------- | ---- |
| 根容器 | `<div>` | `<GvTabs>` + `<GvTabPane>` |
| 搜索 / 表格 | 页面主体 | 仅在 `search-table` Tab 内 |
| Drawer Edit | add / edit 时 | `editMode: drawer`（默认）时生成 |
| inline 保存 | — | `save{Component}Inline` |
| helper | Search / Table / Edit | 追加 `create{Feature}InlineEditList` |

---

## 2. editMode

| 值 | 列表 Tab 新增 / 编辑 | Edit.vue |
| -- | -------------------- | -------- |
| `drawer`（默认） | Drawer 弹层 | ✅ 生成 |
| `inline` | 跳转 inline-form Tab | 不生成 |

---

## 3. Tab i18n key

`tabs[].name` → `tab` + PascalCase(name)：

| name | i18n key |
| ---- | -------- |
| `list` | `tabList` |
| `edit` | `tabEdit` |

---

## 4. 模板（search-table + inline-form + drawer）

```vue
<!--
 * @title: <title>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->
<script setup lang="tsx">
  import type { FormInstance, TableInstance, TabsPaneContext } from 'element-plus';
  import { nextTick, onMounted, ref } from 'vue';
  import { findXxxApi } from '@/api/<apiModule>';
  import { saveXxxApi, updateXxxApi } from '@/api/<apiModule>';
  import { deleteXxxApi } from '@/api/<apiModule>';
  import { crud } from '@/hook/service/useCrud';
  import { useUtil } from '@/hook/service/useUtil';
  import { useNotify } from '@/hook/web/useNotify';
  import { useI18n } from '@/hook/web/useI18n';
  import { create<Feature>SearchList, create<Feature>TableHeadList, create<Feature>EditList, create<Feature>InlineEditList } from './module/helper';
  import <Base>Edit from './module/<Base>Edit.vue';  // ← editMode=drawer

  // @define name
  defineOptions({ name: '<Base>Index' });

  // @hook
  const { message, confirm } = useNotify();
  const { t } = useI18n();
  const { getFormModel } = useUtil();

  // @data
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

  /**
   * @todo: 新增<Feature>
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   */
  const add<Feature> = () => {
    operateType.value = 'add';
    rowData.value = {};
    dialogVisible.value = true;
  };

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
  };

  /**
   * @todo: 删除<Feature>
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   * @param row 当前行数据
   * @param index 行索引
   */
  const delete<Feature> = (row: Recordable<any>, index: number) => {
    confirm('确认删除该记录？')
      .then(async () => {
        try {
          if (row.id) {
            await crud.submit(deleteXxxApi, { id: row.id });
            search<Feature>List();
            message('删除成功', 'success');
          } else {
            crud.removeResult(search<Feature>Data.value, index);
          }
        } catch (e) {
          message(e, 'error');
        }
      })
      .catch(() => {});
  };

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

  /**
   * @todo: 内嵌表单保存
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   */
  const save<Feature>Inline = async () => {
    const fm = <feature>InlineFm.value;
    if (!fm) return;
    try {
      const ok = await crud.save(fm, saveXxxApi);
      if (ok) message('保存成功', 'success');
    } catch (e) {
      message(e, 'error');
    }
  };

  const handleTabClick = (tab: TabsPaneContext) => {
    activeTab.value = tab.paneName as string;
  };

  const dictCB: DictSelectedFn = (_res, _field, _dicType) => {};
  const dictClearCB: DictSelectedFn = (_res, _field, _dicType) => {};

  // @bizData
  <feature>SearchList.value = create<Feature>SearchList().value;
  <feature>TableHeadList.value = create<Feature>TableHeadList({ edit<Feature>, delete<Feature> }).value;
  <feature>InlineEditList.value = create<Feature>InlineEditList({ dictCB, dictClearCB }).value;

  // @mounted
  onMounted(() => {
    nextTick(() => search<Feature>List());
  });
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
        <div class="form-actions">
          <GvButton type="primary" @click="save<Feature>Inline()">保存</GvButton>
        </div>
      </GvTabPane>
    </GvTabs>
    <<Base>Edit v-model:visible="dialogVisible" :row-data="rowData" :operate-type="operateType" :title="rowData?.id ? '编辑' : '新增'" @saved="save<Base>Info" />
  </div>
</template>
```
