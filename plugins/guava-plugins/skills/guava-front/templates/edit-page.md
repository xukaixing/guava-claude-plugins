# 编辑页模板

生成 `src/views/<viewPath>/module/<Base>Edit.vue`（layout=module）或 `src/views/<viewPath>/<Base>Edit.vue`（layout=flat）。两种变体由 `hasSubTable` 决定。

## 已存在文件

文件已存在时 **Write 整文件覆盖**。保留原 `@date`，更新 `@LastEditTime`、`@LastEditors`，`@version` 末位 +1。禁止跳过。

---

## Variant A：纯表单（无子表格）

```vue
<!--
 * @title: <Feature>编辑页
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.0
-->
<script lang="tsx" setup>
  import { save<Feature>Api, update<Feature>Api } from '@/api/<apiModule>';
  import { crud } from '@/hook/service/useCrud';
  import { propTypes, useUtil } from '@/hook/service/useUtil';
  import { useNotify } from '@/hook/web/useNotify';
  import type { FormInstance } from 'element-plus';
  import { ref, watch, computed } from 'vue';
  import { useI18n } from '@/hook/web/useI18n';
  import { create<Feature>EditList } from './helper';

  // @define name
  defineOptions({ name: '<Base>Edit' });

  // @props
  const props = defineProps({
    visible: propTypes.bool.def(false),
    rowData: propTypes.object,
    operateType: propTypes.string,
    title: propTypes.string,
  });

  // @emit
  const emit = defineEmits(['update:visible', 'saved']);

  // @hook
  const { message } = useNotify();
  const { t } = useI18n();
  const { getFormModel } = useUtil();

  // @data
  const <feature>EditFm = ref<FormInstance>();
  const <feature>EditList = ref<FormItem[]>([]);
  const formKey = computed(() => {
    if (!props.visible) return 'closed';
    return props.rowData?.id ?? `add-${props.operateType}`;
  });

  // @computed
  const isShow = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
  });

  // @methods
  const <feature>Save = async () => {
    const fm = <feature>EditFm.value;
    if (!fm) return;
    try {
      if (props.rowData?.id) {
        const updateData = await crud.update(fm, props.rowData.id, update<Feature>Api);
        if (updateData) emit('saved', { type: 'update', data: updateData, rownums: props.rowData?.rownums });
      } else {
        const saveData = await crud.save(fm, save<Feature>Api, true);
        if (saveData) emit('saved', { type: 'insert', data: saveData });
      }
    } catch (e) {
      message(e, 'error');
    }
  };

  const dictCB: DictSelectedFn = (_res, _field, _dicType) => {};
  const dictClearCB: DictSelectedFn = (_res, _field, _dicType) => {};

  const init = () => {
    const rowData = props.rowData;
    if (rowData?.id) crud.setEditValue(<feature>EditList.value, rowData);
    else crud.resetEditValue(<feature>EditList.value);
  };

  // @bizData
  <feature>EditList.value = create<Feature>EditList({ dictCB, dictClearCB }, props.operateType).value;

  // @watch
  watch(
    () => ({
      visible: props.visible,
      rowId: props.rowData?.id,
      operateType: props.operateType,
    }),
    ({ visible }) => {
      if (visible) init();
    },
  );
</script>

<template>
  <div>
    <GvDrawer
      :title="props.title || (props.rowData?.id ? t('<i18nKey>.edit<Base>') : t('<i18nKey>.add<Base>'))"
      v-model:visible="isShow"
      size="50%">
      <GvForm
        :key="formKey"
        ref="<feature>EditFm"
        ref-form="<feature>EditFm"
        :divider="t('<i18nKey>.<feature>Management')"
        :form-list="<feature>EditList" />
      <template #footer>
        <GvButton type="primary" confirm="false" @click="<feature>Save">
          {{ t('common.save') }}
        </GvButton>
      </template>
    </GvDrawer>
  </div>
</template>
```

---

## Variant B：表单 + 子表格（主子表）

基于 SalesSkillsEdit / CompanyBusinessEdit 模式。

```vue
<script lang="tsx" setup>
  import { save<Feature>Api, update<Feature>Api } from '@/api/<apiModule>';
  // ↓ sub-table APIs:
  import { find<Feature>DtlApi, save<Feature>DtlApi, delete<Feature>DtlApi } from '@/api/<apiModule>';
  import { crud } from '@/hook/service/useCrud';
  import { propTypes, useUtil } from '@/hook/service/useUtil';
  import { useNotify } from '@/hook/web/useNotify';
  import type { FormInstance, TableInstance } from 'element-plus';
  import { ref, watch, computed, nextTick } from 'vue';
  import { useI18n } from '@/hook/web/useI18n';
  import { create<Feature>EditList, create<Feature>EditTableHeadList } from './helper';

  // @define name
  defineOptions({ name: '<Base>Edit' });

  // @props, @emit, @hook (same as Variant A)

  // @data
  const <feature>EditFm = ref<FormInstance>();
  const <feature>EditList = ref<FormItem[]>([]);
  // ↓ sub-table:
  const <feature>DtlTableList = ref<TableInstance>();
  const <feature>DtlTableHeadList = ref<TableHeadItem[]>([]);
  const search<Feature>DtlData = ref<Recordable<any>>({});
  const masterId = ref<number>(0);
  // formKey, isShow (same as Variant A)

  // @methods
  const <feature>Save = async () => {
    const fm = <feature>EditFm.value;
    if (!fm) return;
    try {
      if (props.rowData?.id) {
        const updateData = await crud.update(fm, props.rowData.id, update<Feature>Api);
        if (updateData) emit('saved', { type: 'update', data: updateData, rownums: props.rowData?.rownums });
      } else {
        const saveData = await crud.save(fm, save<Feature>Api, true);
        if (saveData) {
          masterId.value = saveData.id;
          emit('saved', { type: 'insert', data: saveData });
        }
      }
    } catch (e) {
      message(e, 'error');
    }
  };

  // 查询子表数据
  const find<Feature>Dtl = async () => {
    if (!<feature>DtlTableList.value) return;
    try {
      search<Feature>DtlData.value = await crud.searchNoFm(
        <feature>DtlTableList.value,
        find<Feature>DtlApi,
        { <feature>Id: masterId.value }
      );
    } catch (e) {
      message(e, 'error');
    }
  };

  // 新增明细行
  const add<Feature>Dtl = () => {
    if (!<feature>DtlTableList.value) return;
    search<Feature>DtlData.value.records.unshift({
      id: null,
      <feature>Id: masterId.value,
      // ... default field values
    });
  };

  // 保存明细行
  const save<Feature>Dtl = async (row: Recordable<any>, _index: number) => {
    try {
      const data = await crud.submit(save<Feature>DtlApi, row);
      if (data) row.id = data.id;
    } catch (e) {
      message(e, 'error');
    }
  };

  // 删除明细行
  const delete<Feature>Dtl = async (row: Recordable<any>, index: number) => {
    try {
      if (row.id) await crud.submit(delete<Feature>DtlApi, { id: row.id });
      crud.removeResult(search<Feature>DtlData.value, index);
    } catch (e) {
      message(e, 'error');
    }
  };

  const dictCB: DictSelectedFn = (_res, _field, _dicType) => {};
  const dictClearCB: DictSelectedFn = (_res, _field, _dicType) => {};

  const init = () => {
    const rowData = props.rowData;
    if (rowData?.id) {
      crud.setEditValue(<feature>EditList.value, rowData);
      masterId.value = rowData.id;
      nextTick(() => find<Feature>Dtl());
    } else {
      masterId.value = 0;
      search<Feature>DtlData.value = {};
      crud.resetEditValue(<feature>EditList.value);
    }
  };

  // @bizData
  <feature>EditList.value = create<Feature>EditList({ dictCB, dictClearCB }, props.operateType).value;
  <feature>DtlTableHeadList.value = create<Feature>EditTableHeadList({ save<Feature>Dtl, delete<Feature>Dtl }).value;

  // @watch (same as Variant A)
</script>

<template>
  <div>
    <GvDrawer
      :title="props.title || (props.rowData?.id ? t('<i18nKey>.edit<Base>') : t('<i18nKey>.add<Base>'))"
      v-model:visible="isShow"
      size="80%">
      <GvForm
        :key="formKey"
        ref="<feature>EditFm"
        ref-form="<feature>EditFm"
        :divider="t('<i18nKey>.basicInfo')"
        :form-list="<feature>EditList"
        label-width="85" />
      <div v-show="masterId !== 0">
        <GvTable
          ref="<feature>DtlTableList"
          ref-table="<feature>DtlTableList"
          :table-head="<feature>DtlTableHeadList"
          :table-data="search<Feature>DtlData">
          <GvButton @click="add<Feature>Dtl">{{ t('tableBar.add') }}</GvButton>
        </GvTable>
      </div>
      <template #footer>
        <GvButton type="primary" confirm="false" @click="<feature>Save">
          {{ t('common.save') }}
        </GvButton>
      </template>
    </GvDrawer>
  </div>
</template>
```

## 关键规则（两种变体通用）

- 容器使用 `GvDrawer`（非 `el-dialog`）
- Props 类型使用 `useUtil().propTypes`：`visible`/`rowData`/`operateType`
- `@hook` 放 `useI18n()` + `useNotify()`（非 `@data`）
- `@bizData` 放 helper `.value` 赋值
- `@watch` 模式：`({ visible }) => { if (visible) init(); }`
- 表单使用 `formKey` computed 触发响应式重渲染

## Variant B 专属规则

- 子表数据用 `crud.searchNoFm()` 获取（无搜索表单）
- `v-show="masterId !== 0"` 控制子表显隐
- Drawer 尺寸 `size="80%"`（比纯表单的 `50%` 更宽）
