# 编辑页模板

> [\_shared.md](../_shared.md)

生成 `module/<Base>Edit.vue`（layout=module）或 `<Base>Edit.vue`（flat）。

---

## 1. frontendOnly

- 禁止 `@/api` import
- `emit('saved', ...)` 替代 `crud.save/update`

```typescript
const <feature>Save = async () => {
  const fm = <feature>EditFm.value;
  if (!fm) return;
  try {
    const model = getFormModel(fm) || {};
    if (props.rowData?.id) emit('saved', { type: 'update', data: { ...props.rowData, ...model }, rownums: props.rowData?.rownums });
    else emit('saved', { type: 'insert', data: { ...model, id: model.id || `local-${Date.now()}` } });
  } catch (e) { message(e, 'error'); }
};
```

---

## 2. Footer 按钮配置

配置中的 `## 按钮` 小节定义 Drawer/Dialog footer 的操作按钮。

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

## 3. Variant A：纯表单

```vue
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

## 4. Variant B：主子表

```vue
<script lang="tsx" setup>
import { save<Feature>Api, update<Feature>Api } from '@/api/<apiModule>';
import { find<Feature>DtlApi, save<Feature>DtlApi, delete<Feature>DtlApi } from '@/api/<apiModule>';
import { crud } from '@/hook/service/useCrud';
import { propTypes, useUtil } from '@/hook/service/useUtil';
import { useNotify } from '@/hook/web/useNotify';
import type { FormInstance, TableInstance } from 'element-plus';
import { ref, watch, computed, nextTick } from 'vue';
import { create<Feature>EditList, create<Feature>EditTableHeadList } from './helper';

defineOptions({ name: '<Base>Edit' });
const props = defineProps({ visible: propTypes.bool.def(false), rowData: propTypes.object, operateType: propTypes.string, title: propTypes.string });
const emit = defineEmits(['update:visible', 'saved']);
const { message } = useNotify();
const { getFormModel } = useUtil();

const <feature>EditFm = ref<FormInstance>();
const <feature>EditList = ref<FormItem[]>([]);
const <feature>DtlTableList = ref<TableInstance>();
const <feature>DtlTableHeadList = ref<TableHeadItem[]>([]);
const search<Feature>DtlData = ref<Recordable<any>>({});
const masterId = ref<number>(0);
const formKey = computed(() => (!props.visible ? 'closed' : (props.rowData?.id ?? `add-${props.operateType}`)));
const isShow = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) });

const <feature>Save = async () => {
  const fm = <feature>EditFm.value;
  if (!fm) return;
  try {
    if (props.rowData?.id) { const d = await crud.update(fm, props.rowData.id, update<Feature>Api); if (d) emit('saved', { type: 'update', data: d, rownums: props.rowData?.rownums }); }
    else { const d = await crud.save(fm, save<Feature>Api, true); if (d) { masterId.value = d.id; emit('saved', { type: 'insert', data: d }); } }
  } catch (e) { message(e, 'error'); }
};

const find<Feature>Dtl = async () => { if (!<feature>DtlTableList.value) return; try { search<Feature>DtlData.value = await crud.searchNoFm(<feature>DtlTableList.value, find<Feature>DtlApi, { <feature>Id: masterId.value }); } catch (e) { message(e, 'error'); } };
const add<Feature>Dtl = () => { if (<feature>DtlTableList.value) search<Feature>DtlData.value.records.unshift({ id: null, <feature>Id: masterId.value }); };
const save<Feature>Dtl = async (row) => { try { const d = await crud.submit(save<Feature>DtlApi, row); if (d) row.id = d.id; } catch (e) { message(e, 'error'); } };
const delete<Feature>Dtl = async (row, idx) => { try { if (row.id) await crud.submit(delete<Feature>DtlApi, { id: row.id }); crud.removeResult(search<Feature>DtlData.value, idx); } catch (e) { message(e, 'error'); } };

const dictCB = (_, __, ___) => {};
const dictClearCB = (_, __, ___) => {};
const init = () => { const row = props.rowData; if (row?.id) { crud.setEditValue(<feature>EditList.value, row); masterId.value = row.id; nextTick(() => find<Feature>Dtl()); } else { masterId.value = 0; search<Feature>DtlData.value = {}; crud.resetEditValue(<feature>EditList.value); } };

<feature>EditList.value = create<Feature>EditList({ dictCB, dictClearCB }, props.operateType).value;
<feature>DtlTableHeadList.value = create<Feature>EditTableHeadList({ save<Feature>Dtl, delete<Feature>Dtl }).value;
watch(() => ({ visible: props.visible, rowId: props.rowData?.id, operateType: props.operateType }), ({ visible }) => { if (visible) init(); });
</script>

<template>
  <div>
    <GvDrawer :title="props.title || (props.rowData?.id ? '编辑' : '新增')" v-model:visible="isShow" size="80%">
      <GvForm :key="formKey" ref="<feature>EditFm" ref-form="<feature>EditFm" :divider="'基本信息'" :form-list="<feature>EditList" label-width="85" />
      <div v-show="masterId !== 0">
        <GvTable ref="<feature>DtlTableList" ref-table="<feature>DtlTableList" :table-head="<feature>DtlTableHeadList" :table-data="search<Feature>DtlData">
          <GvButton @click="add<Feature>Dtl()">新增</GvButton>
        </GvTable>
      </div>
      <template #footer>
        <GvButton type="primary" confirm="false" @click="<feature>Save()">保存</GvButton>
      </template>
    </GvDrawer>
  </div>
</template>
```

---

## 5. Variant C：多分区表单

配置中 `## 编辑` 下含多个 `###` 子标题时启用。每个子标题生成一个 `GvForm`，保存时合并所有表单数据。

```vue
<script lang="tsx" setup>
import { save<Feature>Api, update<Feature>Api } from '@/api/<apiModule>';
import { crud } from '@/hook/service/useCrud';
import { propTypes, useUtil } from '@/hook/service/useUtil';
import { useNotify } from '@/hook/web/useNotify';
import type { FormInstance } from 'element-plus';
import { ref, watch, computed } from 'vue';
import { create<Feature>BasicInfoList, create<Feature>InvoiceInfoList } from './helper';

defineOptions({ name: '<Base>Edit' });
const props = defineProps({ visible: propTypes.bool.def(false), rowData: propTypes.object, operateType: propTypes.string, title: propTypes.string });
const emit = defineEmits(['update:visible', 'saved']);
const { message } = useNotify();
const { getFormModel } = useUtil();

const <feature>BasicInfoFm = ref<FormInstance>();
const <feature>BasicInfoList = ref<FormItem[]>([]);
const <feature>InvoiceInfoFm = ref<FormInstance>();
const <feature>InvoiceInfoList = ref<FormItem[]>([]);
const formKey = computed(() => (!props.visible ? 'closed' : (props.rowData?.id ?? `add-${props.operateType}`)));
const isShow = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) });
const formRefs = computed(() => [<feature>BasicInfoFm.value, <feature>InvoiceInfoFm.value].filter(Boolean));

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

const dictCB = (_, __, ___) => {};
const dictClearCB = (_, __, ___) => {};
const init = () => {
  const row = props.rowData;
  if (row?.id) { crud.setEditValue(<feature>BasicInfoList.value, row); crud.setEditValue(<feature>InvoiceInfoList.value, row); }
  else { crud.resetEditValue(<feature>BasicInfoList.value); crud.resetEditValue(<feature>InvoiceInfoList.value); }
};

<feature>BasicInfoList.value = create<Feature>BasicInfoList({ dictCB, dictClearCB }, props.operateType).value;
<feature>InvoiceInfoList.value = create<Feature>InvoiceInfoList({ dictCB, dictClearCB }, props.operateType).value;
watch(() => ({ visible: props.visible, rowId: props.rowData?.id, operateType: props.operateType }), ({ visible }) => { if (visible) init(); });
</script>

<template>
  <div>
    <GvDrawer :title="props.title || (props.rowData?.id ? '编辑' : '新增')" v-model:visible="isShow" size="60%">
      <GvForm :key="formKey" ref="<feature>BasicInfoFm" ref-form="<feature>BasicInfoFm" :divider="'基本信息'" :form-list="<feature>BasicInfoList" />
      <GvForm :key="`${formKey}-invoice`" ref="<feature>InvoiceInfoFm" ref-form="<feature>InvoiceInfoFm" :divider="'开票信息'" :form-list="<feature>InvoiceInfoList" />
      <template #footer>
        <GvButton type="primary" confirm="false" @click="<feature>Save">保存</GvButton>
      </template>
    </GvDrawer>
  </div>
</template>
```

---

## 6. Variant D：多分区表单 + 多 Tab 页

配置中 `## 编辑` 含多个 `###` 子标题**且**含 `## 标签页` 时启用。编辑框下方渲染 `GvTabs`，Tab 页支持 `table`（列表）和 `form`（表单）两种类型。

```vue
<script lang="tsx" setup>
import { save<Feature>Api, update<Feature>Api } from '@/api/<apiModule>';
import { find<Feature>OrderDtlApi, save<Feature>OrderDtlApi, delete<Feature>OrderDtlApi } from '@/api/<apiModule>';
import { crud } from '@/hook/service/useCrud';
import { propTypes, useUtil } from '@/hook/service/useUtil';
import { useNotify } from '@/hook/web/useNotify';
import type { FormInstance, TableInstance, TabsPaneContext } from 'element-plus';
import { ref, watch, computed, nextTick } from 'vue';
import { create<Feature>BasicInfoList, create<Feature>InvoiceInfoList, create<Feature>OrderDtlTableHeadList, create<Feature>RemarkInfoList } from './helper';

defineOptions({ name: '<Base>Edit' });
const props = defineProps({ visible: propTypes.bool.def(false), rowData: propTypes.object, operateType: propTypes.string, title: propTypes.string });
const emit = defineEmits(['update:visible', 'saved']);
const { message } = useNotify();
const { getFormModel } = useUtil();

// 编辑表单
const <feature>BasicInfoFm = ref<FormInstance>();
const <feature>BasicInfoList = ref<FormItem[]>([]);
const <feature>InvoiceInfoFm = ref<FormInstance>();
const <feature>InvoiceInfoList = ref<FormItem[]>([]);
const formKey = computed(() => (!props.visible ? 'closed' : (props.rowData?.id ?? `add-${props.operateType}`)));
const isShow = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) });
const formRefs = computed(() => [<feature>BasicInfoFm.value, <feature>InvoiceInfoFm.value].filter(Boolean));

// Tab 页数据
const activeTab = ref('orderDtl');
const <feature>OrderDtlTableList = ref<TableInstance>();
const <feature>OrderDtlTableHeadList = ref<TableHeadItem[]>([]);
const search<Feature>OrderDtlData = ref<Recordable<any>>({});
const <feature>RemarkInfoFm = ref<FormInstance>();
const <feature>RemarkInfoList = ref<FormItem[]>([]);
const masterId = ref<number>(0);

const <feature>Save = async () => {
  const fmNodes = formRefs.value;
  if (!fmNodes.length) return;
  try {
    const ok = await crud.checkForms(fmNodes);
    if (!ok) return;
    let model = {};
    fmNodes.forEach((fm) => { model = { ...model, ...getFormModel(fm) }; });
    if (props.rowData?.id) { const d = await crud.update(fmNodes[0], props.rowData.id, update<Feature>Api, model); if (d) emit('saved', { type: 'update', data: { ...props.rowData, ...d }, rownums: props.rowData?.rownums }); }
    else { const d = await crud.save(fmNodes[0], save<Feature>Api, true, model); if (d) { masterId.value = d.id; emit('saved', { type: 'insert', data: d }); } }
  } catch (e) { message(e, 'error'); }
};

// Tab 列表方法
const find<Feature>OrderDtl = async () => { if (!<feature>OrderDtlTableList.value) return; try { search<Feature>OrderDtlData.value = await crud.searchNoFm(<feature>OrderDtlTableList.value, find<Feature>OrderDtlApi, { <feature>Id: masterId.value }); } catch (e) { message(e, 'error'); } };
const add<Feature>OrderDtl = () => { if (<feature>OrderDtlTableList.value) search<Feature>OrderDtlData.value.records.unshift({ id: null, <feature>Id: masterId.value }); };
const save<Feature>OrderDtl = async (row) => { try { const d = await crud.submit(save<Feature>OrderDtlApi, row); if (d) row.id = d.id; } catch (e) { message(e, 'error'); } };
const delete<Feature>OrderDtl = async (row, idx) => { try { if (row.id) await crud.submit(delete<Feature>OrderDtlApi, { id: row.id }); crud.removeResult(search<Feature>OrderDtlData.value, idx); } catch (e) { message(e, 'error'); } };

// Tab 表单方法
const save<Feature>RemarkInfo = async () => { const fm = <feature>RemarkInfoFm.value; if (!fm) return; try { const model = getFormModel(fm) || {}; const d = await crud.submit(save<Feature>RemarkApi, { <feature>Id: masterId.value, ...model }); if (d) message('success', '保存成功'); } catch (e) { message(e, 'error'); } };

const handleTabClick = (tab: TabsPaneContext) => { activeTab.value = tab.paneName as string; };

const dictCB = (_, __, ___) => {};
const dictClearCB = (_, __, ___) => {};
const init = () => {
  const row = props.rowData;
  if (row?.id) {
    crud.setEditValue(<feature>BasicInfoList.value, row);
    crud.setEditValue(<feature>InvoiceInfoList.value, row);
    masterId.value = row.id;
    crud.setEditValue(<feature>RemarkInfoList.value, row);
    nextTick(() => find<Feature>OrderDtl());
  } else {
    masterId.value = 0;
    search<Feature>OrderDtlData.value = {};
    crud.resetEditValue(<feature>BasicInfoList.value);
    crud.resetEditValue(<feature>InvoiceInfoList.value);
    crud.resetEditValue(<feature>RemarkInfoList.value);
  }
};

<feature>BasicInfoList.value = create<Feature>BasicInfoList({ dictCB, dictClearCB }, props.operateType).value;
<feature>InvoiceInfoList.value = create<Feature>InvoiceInfoList({ dictCB, dictClearCB }, props.operateType).value;
<OrderDtlTableHeadList.value = create<OrderDtlTableHeadList({ save<OrderDtl, delete<OrderDtl }).value;
<RemarkInfoList.value = create<Feature>RemarkInfoList({ dictCB, dictClearCB }).value;
watch(() => ({ visible: props.visible, rowId: props.rowData?.id, operateType: props.operateType }), ({ visible }) => { if (visible) init(); });
</script>

<template>
  <div>
    <GvDrawer :title="props.title || (props.rowData?.id ? '编辑' : '新增')" v-model:visible="isShow" size="80%">
      <GvForm :key="formKey" ref="<feature>BasicInfoFm" ref-form="<feature>BasicInfoFm" :divider="'基本信息'" :form-list="<feature>BasicInfoList" />
      <GvForm :key="`${formKey}-invoice`" ref="<feature>InvoiceInfoFm" ref-form="<feature>InvoiceInfoFm" :divider="'开票信息'" :form-list="<feature>InvoiceInfoList" />
      <GvTabs v-model="activeTab" @tab-click="handleTabClick">
        <GvTabPane name="orderDtl" :label="'订单明细'">
          <div v-show="masterId !== 0">
            <GvTable ref="<feature>OrderDtlTableList" ref-table="<feature>OrderDtlTableList" :table-head="<feature>OrderDtlTableHeadList" :table-data="search<Feature>OrderDtlData">
              <GvButton @click="add<Feature>OrderDtl()">新增</GvButton>
            </GvTable>
          </div>
        </GvTabPane>
        <GvTabPane name="remark" :label="'备注信息'">
          <GvForm ref="<feature>RemarkInfoFm" ref-form="<feature>RemarkInfoFm" :divider="'备注信息'" :form-list="<feature>RemarkInfoList" />
          <div class="form-actions"><GvButton type="primary" @click="save<Feature>RemarkInfo()">保存</GvButton></div>
        </GvTabPane>
      </GvTabs>
      <template #footer>
        <GvButton type="primary" confirm="false" @click="<feature>Save">保存</GvButton>
      </template>
    </GvDrawer>
  </div>
</template>
```

---

## 7. Tab 页类型（Variant D）

`## 标签页` 小节定义编辑框下方的 Tab 页，支持两种类型：

| type | 说明 | 生成内容 |
| ---- | ---- | -------- |
| `table` | 列表子表 | `GvTable` + 工具栏按钮，数据用 `crud.searchNoFm` 按 masterId 拉取 |
| `form` | 表单 Tab | `GvForm` + 保存按钮，数据用 `crud.setEditValue` / `crud.resetEditValue` |

### 配置格式

```markdown
## 标签页
- name: orderDtl
  label: 订单明细
  type: table
  columns:
    - label: 商品名称
      prop: productName
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

### 生成规则

- **table 类型**：
  - 工具栏按钮：从 `buttons` 生成（如 新增、删除）
  - 数据拉取：`crud.searchNoFm` 按 masterId 拉取
  - 新增/删除：`crud.submit` 调用对应 API
  - 显隐控制：`v-show="masterId !== 0"`（新增时隐藏）
  - helper 工厂：`create<Feature><TabName>TableHeadList`

- **form 类型**：
  - 表单字段：从 `fields` 生成（复用 Edit 表结构）
  - 保存按钮：从 `buttons` 生成
  - 数据回填：编辑时 `crud.setEditValue`，新增时 `crud.resetEditValue`
  - 保存方法：`crud.submit` 调用 `api.save`
  - helper 工厂：`create<Feature><TabName>List`
  - 始终显示（不参与 masterId 显隐控制）

---

## 8. 规则

- 容器：`GvDrawer` / `GvDialog`；Props 用 `useUtil().propTypes`
- `@hook`：`useI18n` + `useNotify`（`i18n: false` 时省略）
- `@watch`：`({ visible }) => { if (visible) init(); }`
- Variant B/D：`v-show="masterId !== 0"`，`size="80%"`
- Footer 按钮：按 `## 按钮` 配置生成，省略时默认 `保存`
- Variant C/D：多表单用 `crud.checkForms(fmNodes)` 校验，`getFormModel` 合并
- Variant D Tab `table`：`crud.searchNoFm` 按 masterId 拉数据，工具栏按钮从 `buttons` 生成
- Variant D Tab `form`：`crud.setEditValue` / `crud.resetEditValue` 回填，`crud.submit` 保存
