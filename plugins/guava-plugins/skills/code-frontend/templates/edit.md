# 编辑页模板

> [\_shared.md](../_shared.md) · [\_common.md](_common.md)（文件头 / i18n / dictCB / frontendOnly 片段）

生成 `module/<Base>Edit.vue`（layout=module）或 `<Base>Edit.vue`（flat）。

**变体结构**：§3 是完整基座（Variant A）；Variant B / C / D 均为「基座 + 增量」——按增量表在基座上打补丁，禁止整段复制另写。

---

## 1. frontendOnly

禁止 `@/api` import；保存方法体替换为 [\_common.md §4.2](_common.md#42-编辑页保存edit) 的 `emit('saved', ...)` 版本（基座其余不变）。

---

## 2. Footer 按钮配置

配置中的 `## 按钮` 小节定义 Drawer/Dialog footer 的操作按钮。视觉稿格式写作 `### 按钮`（`## 编辑表单` 下子节），顿号 / 逗号分隔，语义相同。

### 配置格式

```markdown
## 按钮
保存,取消

# 或自定义按钮：
## 按钮
保存,取消,发布
```

### 按钮生成规则

| 配置按钮 | 生成内容 |
| -------- | -------- |
| `保存` | `<GvButton type="primary" confirm="false" @click="<feature>Save">保存</GvButton>` |
| `取消` | `<GvButton @click="isShow = false">取消</GvButton>` |
| 自定义（如 `发布`） | `<GvButton type="primary" confirm="false" @click="<feature>Publish">发布</GvButton>` |

### 生成逻辑

- `## 按钮` 省略时，默认生成 `保存`
- 多个按钮用逗号分隔，按声明顺序从左到右排列
- `取消` 按钮：仅生成 `isShow = false` 逻辑，**不**生成对应方法
- 自定义按钮：需在 `@methods` 区生成对应 `<feature><ButtonName>` 方法（PascalCase 方法名）
- 所有按钮放在 `<template #footer>` 内

### 示例

配置：
```markdown
## 按钮
保存,取消,发布
```

生成 template：
```vue
<template #footer>
  <GvButton type="primary" confirm="false" @click="<feature>Save">保存</GvButton>
  <GvButton @click="isShow = false">取消</GvButton>
  <GvButton type="primary" confirm="false" @click="<feature>Publish">发布</GvButton>
</template>
```

---

## 2.1 只读描述子区（GvDescriptions）

视觉稿格式下，`## 编辑表单` 中标注 `（GvDescriptions）` 的子区渲染为**只读**描述块（不进展单校验 / 提交），与 `（GvForm）` 子区并存于同一 Drawer：

```vue
<script lang="tsx" setup>
// helper.tsx 生成：export const build<Feature><Section>InfoHeadList = (): DescItemHead[] => [...]
import { build<Feature>LoginInfoHeadList } from './helper';

// @data
const <feature>LoginInfoHeadList = build<Feature>LoginInfoHeadList();
</script>

<template>
  <!-- 分区标题 = 子标题去注解文本 -->
  <GvDescriptions :item-head="<feature>LoginInfoHeadList" :item-data="props.rowData" />
  <!-- GvForm 子区照旧 -->
</template>
```

- 表结构 `名称|字段|占用列|类型|扩展`，映射规则同 [info.md](info.md)（`span` / `dicType`）
- props（`item-head` / `item-data`）以 MCP `get_props` GvDescriptions 为准
- 编辑 / 新增均展示（数据来自 `rowData`，新增时为空对象）

---

## 2.2 弹窗子表单（`扩展=suffixBtn=…`）

字段 `扩展=suffixBtn=<图标名>:<子表单>(<容器>)`（`类型=text`）的生成：

| 部分 | 生成 |
| ---- | ---- |
| 图标 | helper FormItem 追加 `suffixIcon: '<图标名>'`（GvInput prop，属性查 MCP `get_props` GvInput） |
| 点击行为 | `<Feature>EditActions` 追加 `open<Section>: () => void`（`<Section>` = 子表单标题 PascalCase）；图标点击事件名以 MCP `get_props` GvInput 实际暴露为准，当前版本若无 icon 点击事件，方法体留 `@todo` 注释待 guava-ui 补齐 |
| 子表单 | 目标 `## 编辑表单 - <子表单>（GvDialog/GvDrawer…）` 小节生成独立 Edit 子组件 `<Base><Section>Edit.vue`（容器 / 宽度取小节注解） |

父组件持有子表单弹窗开关并挂载子组件：

```vue
<script setup lang="tsx">
// @data
const <section>EditVisible = ref(false);

// @methods
/**
 * @todo: 打开<子表单标题>
 */
const open<Section> = () => {
  <section>EditVisible.value = true;
};
</script>

<template>
  <div>
    <!-- 主 GvDrawer / GvForm 照旧 -->
    <<Base><Section>Edit v-model:visible="<section>EditVisible" />
  </div>
</template>
```

- 子组件复用 §3 基座模板（frontendOnly 时同 §1），容器为 GvDialog 时 `size` 取注解宽度
- 子表单 `## 按钮` 独立配置（省略默认 `保存`）；`saved` 事件由父组件按需回填触发字段

---

## 3. 基座：Variant A 纯表单

`## 编辑表单` 仅一个表（无 `###` 子标题）时使用。其余变体由此打增量补丁。

```vue
<!--
 * @title: <模块中文标题>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->
<script lang="tsx" setup>
import { save<Feature>Api, update<Feature>Api } from '@/api/<apiModule>';
import { crud } from '@/hook/service/useCrud';
import { propTypes, useUtil } from '@/hook/service/useUtil';
import { useNotify } from '@/hook/web/useNotify';
import type { FormInstance } from 'element-plus';
import { ref, watch, computed } from 'vue';
import { create<Feature>EditList } from './helper';

defineOptions({ name: '<Base>Edit' });
const props = defineProps({ visible: propTypes.bool.def(false), rowData: propTypes.object, operateType: propTypes.string, title: propTypes.string });
const emit = defineEmits(['update:visible', 'saved']);
const { message } = useNotify();
const { getFormModel } = useUtil();

const <feature>EditFm = ref<FormInstance>();
const <feature>EditList = ref<FormItem[]>([]);
const formKey = computed(() => (!props.visible ? 'closed' : (props.rowData?.id ?? `add-${props.operateType}`)));
const isShow = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) });

const <feature>Save = async () => {
  const fm = <feature>EditFm.value;
  if (!fm) return;
  try {
    if (props.rowData?.id) { const d = await crud.update(fm, props.rowData.id, update<Feature>Api); if (d) emit('saved', { type: 'update', data: d, rownums: props.rowData?.rownums }); }
    else { const d = await crud.save(fm, save<Feature>Api, true); if (d) emit('saved', { type: 'insert', data: d }); }
  } catch (e) { message(e, 'error'); }
};

const dictCB = (_, __, ___) => {};
const dictClearCB = (_, __, ___) => {};
const init = () => { const row = props.rowData; if (row?.id) crud.setEditValue(<feature>EditList.value, row); else crud.resetEditValue(<feature>EditList.value); };

<feature>EditList.value = create<Feature>EditList({ dictCB, dictClearCB }, props.operateType).value;
watch(() => ({ visible: props.visible, rowId: props.rowData?.id, operateType: props.operateType }), ({ visible }) => { if (visible) init(); });
</script>

<template>
  <div>
    <GvDrawer :title="props.title || (props.rowData?.id ? '编辑' : '新增')" v-model:visible="isShow" size="50%">
      <GvForm :key="formKey" ref="<feature>EditFm" ref-form="<feature>EditFm" :divider="'编辑信息'" :form-list="<feature>EditList" />
      <template #footer>
        <GvButton type="primary" confirm="false" @click="<feature>Save">保存</GvButton>
      </template>
    </GvDrawer>
  </div>
</template>
```

---

## 4. Variant B：主子表 = 基座 + 增量

`subTable: true`（旧版）启用。基座 §3 上做以下补丁：

| 增量点 | 内容 |
| --- | --- |
| import 追加 | `find/save/delete<Feature>DtlApi`、`nextTick`、`create<Feature>EditTableHeadList` |
| @data 追加 | `<feature>DtlTableList`（TableInstance）、`<feature>DtlTableHeadList`、`search<Feature>DtlData`、`masterId = ref<number>(0)` |
| @methods 追加 | Dtl 四方法（见下，B / D 共用） |
| `<feature>Save` 修改 | insert 分支成功后追加 `masterId.value = d.id` |
| init 修改 | 编辑分支：`masterId.value = row.id` + `nextTick(() => find<Feature>Dtl())`；新增分支：`masterId.value = 0`、`search<Feature>DtlData.value = {}` |
| @bizData 追加 | `<feature>DtlTableHeadList.value = create<Feature>EditTableHeadList({ save<Feature>Dtl, delete<Feature>Dtl }).value` |
| template | `size="80%"`；GvForm 后插入子表块（见下） |

Dtl 四方法（B / D 的 table tab 共用，D 中把 `Dtl` 换成 `<TabName>`）：

```typescript
const find<Feature>Dtl = async () => { if (!<feature>DtlTableList.value) return; try { search<Feature>DtlData.value = await crud.searchNoFm(<feature>DtlTableList.value, find<Feature>DtlApi, { <feature>Id: masterId.value }); } catch (e) { message(e, 'error'); } };
const add<Feature>Dtl = () => { if (<feature>DtlTableList.value) search<Feature>DtlData.value.records.unshift({ id: null, <feature>Id: masterId.value }); };
const save<Feature>Dtl = async (row) => { try { const d = await crud.submit(save<Feature>DtlApi, row); if (d) row.id = d.id; } catch (e) { message(e, 'error'); } };
const delete<Feature>Dtl = async (row, idx) => { try { if (row.id) await crud.submit(delete<Feature>DtlApi, { id: row.id }); crud.removeResult(search<Feature>DtlData.value, idx); } catch (e) { message(e, 'error'); } };
```

template 增量（插在 GvForm 与 footer 之间）：

```vue
<div v-show="masterId !== 0">
  <GvTable ref="<feature>DtlTableList" ref-table="<feature>DtlTableList" :table-head="<feature>DtlTableHeadList" :table-data="search<Feature>DtlData">
    <GvButton @click="add<Feature>Dtl()">新增</GvButton>
  </GvTable>
</div>
```

---

## 5. Variant C：多分区表单 = 基座 + 增量

`## 编辑` 下含多个 `###` 子标题时启用。每个子标题生成一对 `Fm` / `List` 与一个 `:divider` = 子标题文本的 `GvForm`。

| 增量点 | 内容 |
| --- | --- |
| import | `create<Feature>EditList` 换成 `create<Feature><Section1>List, create<Feature><Section2>List, …` |
| @data | 单个 `<feature>EditFm` / `<feature>EditList` 换成每子区一对 `<feature><Section>Fm` / `<feature><Section>List` |
| @computed 追加 | `const formRefs = computed(() => [<feature><S1>Fm.value, <feature><S2>Fm.value, ...].filter(Boolean))` |
| `<feature>Save` 主体替换 | 多分区版（见下，C / D 共用） |
| init 修改 | 每子区 `crud.setEditValue(<feature><Section>List.value, row)` / `crud.resetEditValue(...)` |
| @bizData | 每子区工厂独立赋值（各收 `(actions, props.operateType)`） |
| template | GvForm ×N：首区 `:key="formKey"`，其余 `:key="`${formKey}-<section>`"`，`:divider` = 各子标题文本 |

`<feature>Save` 多分区版（C / D 共用）：

```typescript
const <feature>Save = async () => {
  const fmNodes = formRefs.value;
  if (!fmNodes.length) return;
  try {
    const ok = await crud.checkForms(fmNodes);
    if (!ok) return;
    let model = {};
    fmNodes.forEach((fm) => { model = { ...model, ...getFormModel(fm) }; });
    if (props.rowData?.id) { const d = await crud.update(fmNodes[0], props.rowData.id, update<Feature>Api, model); if (d) emit('saved', { type: 'update', data: { ...props.rowData, ...d }, rownums: props.rowData?.rownums }); }
    else { const d = await crud.save(fmNodes[0], save<Feature>Api, true, model); if (d) emit('saved', { type: 'insert', data: d }); }
  } catch (e) { message(e, 'error'); }
};
```

---

## 6. Variant D：多分区 + 多 Tab = Variant C 增量 + 下列增量

`## 编辑` 含多个 `###` 子标题**且**含 `## 标签页` 时启用。先打 §5（Variant C）全部增量，再打：

| 增量点 | 内容 |
| --- | --- |
| import 追加 | Tab 相关 API（`find/save/delete<Feature><TabName>Api` 按需）+ `create<Feature><TabName>TableHeadList` / `create<Feature><TabName>List` |
| @data 追加 | `activeTab = ref('<第一个 tab 的 name>')`；table tab：`<feature><Tab>TableList` / `...TableHeadList` / `search<Feature><Tab>Data`；form tab：`<feature><Tab>Fm` / `...List`；`masterId = ref<number>(0)` |
| `<feature>Save` 修改 | insert 分支成功后追加 `masterId.value = d.id` |
| @methods 追加 | table tab：§4「Dtl 四方法」换 `<TabName>` 复用；form tab：`save<Feature><TabName>`（见下）；`handleTabClick` |
| init 修改 | 编辑分支：`masterId.value = row.id` + 各 form tab `setEditValue` + `nextTick` 拉各 table tab；新增分支：`masterId = 0`、清空 table tab 数据、各 form tab `resetEditValue` |
| @bizData 追加 | Tab 工厂赋值（table 收 actions、form 收 `{ dictCB, dictClearCB }`） |
| template | C 的各 GvForm 之后插入 `<GvTabs>` 块（见下） |

form tab 保存方法：

```typescript
const save<Feature><TabName> = async () => {
  const fm = <feature><TabName>Fm.value;
  if (!fm) return;
  try {
    const model = getFormModel(fm) || {};
    const d = await crud.submit(save<Feature><TabName>Api, { <feature>Id: masterId.value, ...model });
    if (d) message('success', '保存成功');
  } catch (e) { message(e, 'error'); }
};
const handleTabClick = (tab: TabsPaneContext) => { activeTab.value = tab.paneName as string; };
```

template 增量（`GvTabs` 插在 GvForm 分区之后、footer 之前）：

```vue
<GvTabs v-model="activeTab" @tab-click="handleTabClick">
  <GvTabPane name="orderDtl" :label="'订单明细'">
    <div v-show="masterId !== 0">
      <GvTable ref="<feature>OrderDtlTableList" ref-table="<feature>OrderDtlTableList" :table-head="<feature>OrderDtlTableHeadList" :table-data="search<Feature>OrderDtlData">
        <GvButton @click="add<Feature>OrderDtl()">新增</GvButton>  <!-- 工具栏按钮从 buttons 生成 -->
      </GvTable>
    </div>
  </GvTabPane>
  <GvTabPane name="remark" :label="'备注信息'">
    <GvForm ref="<feature>RemarkInfoFm" ref-form="<feature>RemarkInfoFm" :divider="'备注信息'" :form-list="<feature>RemarkInfoList" />
    <div class="form-actions"><GvButton type="primary" @click="save<Feature>RemarkInfo()">保存</GvButton></div>
  </GvTabPane>
</GvTabs>
```

---

## 7. Tab 页类型（`## 标签页`）

每个 Tab 根据 `type` 生成（完整 YAML 示例见 [config-parser.md](../config-parser.md#29-多-tab-页) / [config-template.md](../config-template.md#多分区编辑--多-tab-页)）：

| type | 生成内容 | 数据 |
| ---- | -------- | ---- |
| `table` | `GvTable` + 工具栏按钮（`buttons` 生成），`v-show="masterId !== 0"` | `crud.searchNoFm` 按 masterId 拉取；工厂 `create<Feature><TabName>TableHeadList` |
| `form` | `GvForm` + 保存按钮（`buttons` 生成），始终显示 | `crud.setEditValue` / `crud.resetEditValue` 回填，`crud.submit(api)` 保存；工厂 `create<Feature><TabName>List` |

---

## 8. 规则

- 容器：`GvDrawer` / `GvDialog`；Props 用 `useUtil().propTypes`
- `@hook`：`useI18n` + `useNotify`（`i18n: false` 时省略，见 [\_common.md §2](_common.md#2-i18n-开关)）
- `@watch`：`({ visible }) => { if (visible) init(); }`
- Variant B/D：`v-show="masterId !== 0"`，`size="80%"`
- Footer 按钮：按 `## 按钮` 配置生成，省略时默认 `保存`
- frontendOnly / dictCB：见 [\_common.md](_common.md)
