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

## 4. 编辑页多分区与多 Tab 配置

### 4.1 多分区编辑（Variant C）

`## 编辑` 下用 `###` 子标题拆分多个表单区域，每个子标题生成一个 `GvDivider` + `GvForm`：

```markdown
## 编辑
### 基本信息
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 用户账号 | account | text | Y | isNumberLetter | 30 | N | 1 | disabledOnEdit |

### 开票信息
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 发票抬头 | invoiceTitle | text | Y | isAny | 100 | N | 1 | |
```

**生成规则**：
- 每个 `###` 子标题生成一个 `GvForm`，`:divider` 设为子标题文本（如 `'基本信息'`、`'开票信息'`）
- helper 工厂函数命名为 `create<Feature><SectionName>List`（如 `create<Feature>BasicInfoList`、`create<Feature>InvoiceInfoList`）
- 保存时用 `crud.checkForms(fmNodes)` 校验所有表单，`getFormModel` 依次合并数据
- 编辑回填 / 新增重置：对每个表单 list 分别调用 `crud.setEditValue` / `crud.resetEditValue`

### 4.2 多分区 + 多 Tab 页（Variant D）

在 4.1 基础上增加 `## 标签页` 小节，编辑框下方渲染 `GvTabs`：

```markdown
## 标签页
- name: orderDtl
  label: 订单明细
  type: table
  columns:
    - label: 商品名称
      prop: productName
    - label: 数量
      prop: quantity
  buttons: 新增,删除
  api:
    list: /order/findOrderDtl
    save: /order/saveOrderDtl
    delete: /order/deleteOrderDtl

- name: remark
  label: 备注信息
  type: form
  fields:
    - { label: '备注', field: 'remark', type: 'textarea', format: [0, 'isAny', 200] }
  buttons: 保存
  api:
    save: /order/saveRemark
```

**Tab type 生成规则**：

| type | 生成内容 | 数据拉取 |
| ---- | -------- | -------- |
| `table` | `GvTable`（含操作列）+ 工具栏按钮 | `crud.searchNoFm` 按 masterId 拉取 |
| `form` | `GvForm` + 保存按钮 | `crud.setEditValue` 回填 / `crud.resetEditValue` 重置 |

**配置字段说明**：

| 字段 | 必填 | 说明 |
| ---- | ---- | ---- |
| `name` | ✅ | Tab 标识 / `GvTabPane` 的 `name` |
| `label` | ✅ | Tab 显示文本 / `GvTabPane` 的 `label` |
| `type` | ✅ | `table`（列表）或 `form`（表单） |
| `columns` | type=table 时 | 表格列配置 |
| `fields` | type=form 时 | 表单字段配置（复用 FormItem 结构） |
| `buttons` | | 工具栏按钮，逗号分隔 |
| `api` | | 相关 API 端点 |

### 4.3 配置推导

| 配置特征 | 使用的 Edit 变体 |
| -------- | ---------------- |
| `## 编辑` 仅一个表（无 `###`） | Variant A 纯表单 |
| `## 编辑` 多个 `###` 子标题 | Variant C 多分区表单 |
| `## 编辑` 多个 `###` + `## 标签页` | Variant D 多分区 + 多 Tab |
| `subTable: true`（旧版） | Variant B 主子表 |

---

## 5. 关键规则

- 删除：`crud.submit(api, { id: row.id })`
- `@hook`：`useI18n` + `useNotify`（`i18n: false` 时省略）
- 无 add/edit：省略 dialog state 和 Edit 组件
- `i18n: false`：template 内 `t('xxx')` 替换为中文；不 `import useI18n`
- TableInstance：有 `checkAllEdit()` / `createEditRow()` 时用 `TableInstanceExp`
- 多分区编辑：`crud.checkForms(fmNodes)` 校验 + `getFormModel` 合并
- 多 Tab：`table` 类型用 `v-show="masterId !== 0"` 控制显隐，`form` 类型始终显示
