# 纯表单页

> [\_shared.md](../_shared.md) · [page-types.md#form-only](../page-types.md#form-only)

生成 `<Base>.vue`（非 Index）。整页 GvForm + 保存，无 Table / Edit 子组件。

---

## 1. 命名推导

| 配置 | 推导 |
| ---- | ---- |
| component `SystemConfig` | feature 变量 `systemConfig` |
| load 方法 | `loadSystemConfig` |
| save 方法 | `saveSystemConfig` |
| get API | `getSystemConfigApi` |
| save API | `saveSystemConfigApi` |
| helper 工厂 | `createSystemConfigFormList` |

> API 名优先 `{verb}{Component}Api`；`paths.get` 末段为 `getByKey` 时仍用 `get{Component}Api`。

---

## 2. frontendOnly

- **禁止** `@/api` import
- 生成 [data.md](data.md) 中的 `mockFormModel`
- `load*`：把 `mockFormModel` 写入 form
- `save*`：校验后写回 `Object.assign(mockFormModel, getFormModel(fm))` + `message` 成功

---

## 3. 模板

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
import type { FormInstance } from 'element-plus';
import { nextTick, onMounted, ref } from 'vue';
import { get<Feature>Api, save<Feature>Api } from '@/api/<apiModule>';
import { crud } from '@/hook/service/useCrud';
import { useNotify } from '@/hook/web/useNotify';
import { useI18n } from '@/hook/web/useI18n';
import { create<Feature>FormList } from './helper';

// @define name
defineOptions({ name: '<Base>' });

// @hook
const { message } = useNotify();
const { t } = useI18n();

// @data
const <feature>FormFm = ref<FormInstance>();
const <feature>FormList = ref<FormItem[]>([]);
const formReady = ref(false);

// @methods
/**
 * @todo: 加载<Feature>
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 */
const load<Feature> = async () => {
  try {
    const data = await crud.fetchData(get<Feature>Api, {});
    if (data) crud.setEditValue(<feature>FormList.value, data);
  } catch (e) {
    message(e, 'error');
  }
};

/**
 * @todo: 保存<Feature>
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 */
const save<Feature> = async () => {
  const fm = <feature>FormFm.value;
  if (!fm) return;
  try {
    const ok = await crud.save(fm, save<Feature>Api);
    if (ok) message('保存成功', 'success');
  } catch (e) {
    message(e, 'error');
  }
};

const dictCB: DictSelectedFn = (_res, _field, _dicType) => {};
const dictClearCB: DictSelectedFn = (_res, _field, _dicType) => {};

// @bizData
<feature>FormList.value = create<Feature>FormList({ dictCB, dictClearCB }).value;

// @mounted
onMounted(() => {
  nextTick(() => load<Feature>());
});
</script>

<template>
  <div>
    <GvForm ref="<feature>FormFm" ref-form="<feature>FormFm" :divider="'配置信息'" :form-list="<feature>FormList" />
    <div class="form-actions">
      <GvButton type="primary" @click="save<Feature>()">保存</GvButton>
    </div>
  </div>
</template>
```
