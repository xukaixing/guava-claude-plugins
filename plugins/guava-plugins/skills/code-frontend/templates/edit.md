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

## 5. 规则

- 容器：`GvDrawer` / `GvDialog`；Props 用 `useUtil().propTypes`
- `@hook`：`useI18n` + `useNotify`（`i18n: false` 时省略）
- `@watch`：`({ visible }) => { if (visible) init(); }`
- Variant B：`v-show="masterId !== 0"`，`size="80%"`
- Footer 按钮：按 `## 按钮` 配置生成，省略时默认 `保存`
