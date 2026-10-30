# 列表页模板

> [\_shared.md](../_shared.md) · [\_common.md](_common.md)（文件头 / i18n / frontendOnly 片段）

生成 `src/views/<view>/<Base>Index.vue`。**仅生成 enabled 的方法。**

---

## 1. frontendOnly

禁止 `@/api` import；查询 / 删除片段直接用 [\_common.md §4.1](_common.md#41-列表页查询--删除crud--tabs)（数据来自 [data.md](data.md)）。

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
<!-- 文件头注释块见 [_common.md §1](_common.md#1-vue-文件头注释)，原样置于本文件顶部 -->
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
      <!-- ↓ 工具栏按钮由 ### 表格工具栏（或精简格式 ## 表格工具栏）驱动，未配置时仅保留「新增」 -->
      <GvButton @click="add<Feature>()">新增</GvButton>  <!-- add -->
      <!-- 例：配置「新增、导入、导出」→
      <GvButton @click="add<Feature>()">新增</GvButton>
      <GvButton @click="import<Feature>()">导入</GvButton>
      <GvButton @click="export<Feature>()">导出</GvButton> -->
    </GvTable>
    <<Base>Edit v-model:visible="dialogVisible" :row-data="rowData" :operate-type="operateType" :title="title" @saved="save<Base>Info" />
  </div>
</template>
```

### 3.3 工具栏按钮映射

| 按钮名 | 生成方法 | 行为 |
| ------ | -------- | ---- |
| 新增 | `add<Feature>()` | 打开 Drawer，`operateType = 'add'` |
| 导入 | `import<Feature>()` | 占位（`// TODO: 导入`） |
| 导出 | `export<Feature>()` | 占位（`// TODO: 导出`） |
| 批量删除 | `batchDelete<Feature>()` | 占位（`// TODO: 批量删除`，接 selection） |
| 其他 | `<按钮名><Feature>()` | 同名占位方法 |

- 按钮文案**原样写入、不去重**（顿号 / 逗号分隔）
- 未配置工具栏小节时保持默认单个「新增」按钮（`editPage` 启用时）

---

## 4. 编辑页多分区与多 Tab 配置

### 4.1 多分区编辑（Variant C）

`## 编辑` 下用 `###` 子标题拆分多个表单区域，每个子标题生成一个 `:divider` = 子标题文本的 `GvForm`。配置示例见 [config-parser.md](../config-parser.md#27-多分区编辑)；Edit 变体见 [edit.md](edit.md) §5；工厂命名与保存合并规则见 [helper.md](helper.md) §10。

### 4.2 多分区 + 多 Tab 页（Variant D）

在 4.1 基础上增加 `## 标签页` 小节，编辑框下方渲染 `GvTabs`。YAML 完整示例见 [config-parser.md](../config-parser.md#29-多-tab-页)，Edit 变体见 [edit.md](edit.md) §6。

**Tab type 生成规则**：

| type | 生成内容 | 数据拉取 |
| ---- | -------- | -------- |
| `table` | `GvTable`（含操作列）+ 工具栏按钮 | `crud.searchNoFm` 按 masterId 拉取 |
| `form` | `GvForm` + 保存按钮 | `crud.setEditValue` 回填 / `crud.resetEditValue` 重置 |

### 4.3 配置推导

| 配置特征 | 使用的 Edit 变体 |
| -------- | ---------------- |
| `## 编辑` 仅一个表（无 `###`） | Variant A 纯表单 |
| `## 编辑` 多个 `###` 子标题 | Variant C 多分区表单 |
| `## 编辑` 多个 `###` + `## 标签页` | Variant D 多分区 + 多 Tab |
| `subTable: true`（旧版） | Variant B 主子表 |

---

## 5. 明细展开（Detail Table）

操作列自定义按钮 + 行内展开子表。触发 = 操作列按钮，配置 = `## 明细`，数据 = `crud.fetchTable`，helper 命名 `build<Feature><DetailName>HeadList`，Index 方法 `show<DetailName>`。

> 完整规则（配置格式 / icon / 多明细 / API 命名推导）见 [detail.md](detail.md)——以该文件为唯一真相。

---

## 6. 关键规则

- 删除：`crud.submit(api, { id: row.id })`
- `@hook`：`useI18n` + `useNotify`（`i18n: false` 时省略，见 [\_common.md §2](_common.md#2-i18n-开关)）
- 无 add/edit：省略 dialog state 和 Edit 组件
- TableInstance：有 `checkAllEdit()` / `createEditRow()` 时用 `TableInstanceExp`
- 多分区编辑：逐子区 `fm.validate()` 校验 + `getFormModel` 合并 + `crud.submit` 提交（edit.md §5）
- 多 Tab：`table` 类型用 `v-show="masterId !== 0"` 控制显隐，`form` 类型始终显示
- 明细展开：见 [detail.md](detail.md)，本节不重复
