# 多 Tab 列表页模板

> [\_shared.md](../_shared.md) · [page-types.md#tabs](../page-types.md#tabs)

生成 `<Base>Index.vue`，外层 GvTabs，Tab 按 `tabs[].type` 渲染。

## 生成清单

| 文件              | 模板                                                      | 条件                                      |
| ----------------- | --------------------------------------------------------- | ----------------------------------------- |
| API               | [api.md](api.md)                                          | 同 crud-module                            |
| types.d.ts        | [types.md](types.md) + [types.md#tabs](types.md#tabs)     | 含 inline-form 时追加 `InlineEditActions` |
| helper.tsx        | [helper.md](helper.md) + [helper.md#tabs](helper.md#tabs) | Search + Table + Edit + InlineEditList    |
| `<Base>Index.vue` | 本文                                                      | 始终                                      |
| `<Base>Edit.vue`  | [edit-page.md](edit-page.md) Variant A                    | `editMode: drawer` 且 add/edit            |
| i18n              | [i18n.md](i18n.md#tabs)                                   | Tab label + CRUD key                      |

## 目标结构

```
GvTabs
├── Tab type=search-table  → GvForm(搜索) + GvTable + [Drawer Edit]
└── Tab type=inline-form   → GvForm(编辑) + 保存按钮
```

`type: form`（组件演示 Tab）暂不在自动生成范围。

## 与 crud-module Index 的差异

| 项目        | crud-module           | tabs                                 |
| ----------- | --------------------- | ------------------------------------ |
| 根容器      | `<div>`               | `<GvTabs>` + `<GvTabPane>`           |
| 搜索/表格   | 页面主体              | 仅在 `search-table` Tab 内           |
| Drawer Edit | add/edit 时           | `editMode: drawer`（默认）时生成     |
| inline 保存 | —                     | `save{Component}Inline`              |
| helper      | Search / Table / Edit | 追加 `create{Feature}InlineEditList` |

## editMode

| 值               | 列表 Tab 新增/编辑              | Edit.vue |
| ---------------- | ------------------------------- | -------- |
| `drawer`（默认） | Drawer 弹层                     | ✅ 生成  |
| `inline`         | 跳转 inline-form Tab 并填充表单 | 不生成   |

首版实现 **`drawer`**；`editMode: inline` 文档预留，生成时等同 drawer。

## Tab i18n key 推导

`tabs[].name` → `tab` + PascalCase(name)：

| name   | i18n key  | 初始中文值   |
| ------ | --------- | ------------ |
| `list` | `tabList` | tabs[].label |
| `edit` | `tabEdit` | tabs[].label |

## import 路径

同 [index-page.md](index-page.md)。

## 模板（search-table + inline-form + drawer）

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
  import { saveXxxApi, updateXxxApi } from '@/api/<apiModule>';   // inline-form / drawer
  import { deleteXxxApi } from '@/api/<apiModule>';               // delete enabled
  import { crud } from '@/hook/service/useCrud';
  import { useUtil } from '@/hook/service/useUtil';
  import { useNotify } from '@/hook/web/useNotify';
  import { useI18n } from '@/hook/web/useI18n';
  import {
    create<Feature>SearchList,
    create<Feature>TableHeadList,
    create<Feature>InlineEditList,
  } from './helper';
  import <Base>Edit from './<Base>Edit.vue';                     // editMode=drawer

  defineOptions({ name: '<Base>Index' });

  const { message, confirm } = useNotify();
  const { t } = useI18n();
  const { getFormModel } = useUtil();

  const currentTab = ref<string>('<firstTabName>');
  // search-table Tab
  const <feature>SearchFm = ref<FormInstance>();
  const <feature>SearchList = ref<FormItem[]>([]);
  const <feature>TableList = ref<TableInstance>();
  const <feature>TableHeadList = ref<TableHeadItem[]>([]);
  const search<Feature>Data = ref<Recordable<any>>({});
  const dialogVisible = ref<boolean>(false);
  const rowData = ref<Recordable<any>>({});
  const operateType = ref<string>('');
  const title = ref<string>('');
  // inline-form Tab
  const <feature>InlineEditFm = ref<FormInstance>();
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
    title.value = t('<i18nKey>.add<Base>');
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
    title.value = t('<i18nKey>.edit<Base>');
  };

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
   * @todo: Tab 内嵌表单保存
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   */
  const save<Feature>Inline = async () => {
    const fm = <feature>InlineEditFm.value;
    if (!fm) return;
    const model = getFormModel(fm);
    try {
      if (model?.id) {
        await crud.update(fm, model.id, updateXxxApi);
      } else {
        await crud.save(fm, saveXxxApi, true);
      }
    } catch (e) {
      message(e, 'error');
    }
  };

  /**
   * @todo: Tab 切换处理
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   * @param pane 当前 Tab 面板
   * @param _ev 点击事件
   */
  const handleTabClick = (pane: TabsPaneContext, _ev: Event) => {
    if (pane.paneName === '<inlineTabName>') {
      crud.resetEditValue(<feature>InlineEditList.value);
    }
  };

  const inlineDictCB: DictSelectedFn = (_res, _field, _dicType) => {};
  const inlineDictClearCB: DictSelectedFn = (_res, _field, _dicType) => {};

  <feature>SearchList.value = create<Feature>SearchList().value;
  <feature>TableHeadList.value = create<Feature>TableHeadList({ edit<Feature>, delete<Feature> }).value;
  <feature>InlineEditList.value = create<Feature>InlineEditList({ dictCB: inlineDictCB, dictClearCB: inlineDictClearCB }).value;

  onMounted(() => {
    nextTick(() => search<Feature>List());
  });
</script>

<template>
  <div>
    <GvTabs
      v-model="currentTab"
      @tab-click="handleTabClick">
      <GvTabPane
        :label="t('<i18nKey>.tabList')"
        name="list">
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
          <GvButton @click="add<Feature>()">{{ t('common.add') }}</GvButton>
        </GvTable>
      </GvTabPane>
      <GvTabPane
        :label="t('<i18nKey>.tabEdit')"
        name="edit">
        <GvForm
          ref="<feature>InlineEditFm"
          ref-form="<feature>InlineEditFm"
          :divider="t('<i18nKey>.<feature>Management')"
          :form-list="<feature>InlineEditList" />
        <GvButton
          type="primary"
          confirm="false"
          @click="save<Feature>Inline">
          {{ t('common.save') }}
        </GvButton>
      </GvTabPane>
    </GvTabs>
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

- `currentTab` 默认值为 `tabs[0].name`
- 列表 Tab CRUD 逻辑与 [index-page.md](index-page.md) 完全一致
- `create{Feature}InlineEditList` 字段与 `create{Feature}EditList` 相同，**无** `operateType` 参数（inline Tab 不做 disabledOnEdit）
- 切换到 inline-form Tab 时 `resetEditValue` 清空表单
- inline 保存根据 `model.id` 选择 `crud.update` / `crud.save`
- Drawer Edit 仍用 [edit-page.md](edit-page.md) + `create{Feature}EditList`
- **禁止**在 tabs 页使用 legacy `build*` helper

## 条件生成

| 配置                          | 生成内容                                             |
| ----------------------------- | ---------------------------------------------------- |
| 无 `inline-form` Tab          | 不生成 InlineEditList / inline 保存 / 第二个 TabPane |
| 无 `search-table` Tab         | 不生成 Search/Table（罕见，校验应拒绝）              |
| `editMode: drawer` + add/edit | 生成 Edit.vue                                        |
| 无 add/edit                   | 不生成 Drawer、表格工具栏新增按钮                    |
