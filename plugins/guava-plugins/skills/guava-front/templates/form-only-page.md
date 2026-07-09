# 纯表单页模板

> [\_shared.md](../_shared.md) · [page-types.md#form-only](../page-types.md#form-only)

生成 `<Base>.vue`（非 Index）。整页 GvForm + 保存，无 Table/Edit 子组件。

## 命名推导

| 配置                     | 推导                         |
| ------------------------ | ---------------------------- |
| component `SystemConfig` | feature 变量 `systemConfig`  |
| load 方法                | `loadSystemConfig`           |
| save 方法                | `saveSystemConfig`           |
| get API                  | `getSystemConfigApi`         |
| save API                 | `saveSystemConfigApi`        |
| helper 工厂              | `createSystemConfigFormList` |
| Form ref                 | `systemConfigFormFm`         |
| form-list                | `systemConfigFormList`       |

API 名优先 `{verb}{Component}Api`；`paths.get` 末段为 `getByKey` 等时仍用 `get{Component}Api`（非 `getByKeyApi`），与页面方法名一致。

## import 路径

| layout   | helper import     |
| -------- | ----------------- |
| `flat`   | `./helper`        |
| `module` | `./module/helper` |

form-only 通常 `layout: flat`。

## 模板

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
    const data = await crud.fetchData(get<Feature>Api, <loadParams>);
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
    await crud.save(fm, save<Feature>Api, true);
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
  nextTick(() => {
    load<Feature>().then(() => {
      formReady.value = true;
    });
  });
});
</script>

<template>
  <div>
    <GvForm v-if="formReady" ref="<feature>FormFm" ref-form="<feature>FormFm" :divider="t('<i18nKey>.<feature>Title')" :form-list="<feature>FormList" />
    <GvButton type="primary" confirm="false" @click="save<Feature>">
      {{ t('common.save') }}
    </GvButton>
  </div>
</template>
```

## 关键规则

- 加载用 `crud.fetchData(get*Api, params)`，**不用** `crud.search`
- 填充表单用 `crud.setEditValue(formList, data)`
- 保存用 `crud.save(fm, save*Api, true)`（第三个参数 `true` 显示成功提示）
- `formReady` + `v-if` 避免表单在数据加载前渲染（参考 `Profile.vue`）
- 字典字段在 helper 中挂 `cb` / `clear`；主文件提供 `dictCB` / `dictClearCB`
- divider 使用 `t('<i18nKey>.<feature>Title')`，值为配置 `title`
- **禁止**生成 Index / Edit 子组件

## loadParams

YAML 可选 `loadParams` 静态查询参数，写入 `crud.fetchData` 第二参数：

```yaml
loadParams:
  configKey: site
```

未配置时生成 `{}`。

## paths 别名

| 操作 | paths key          | 说明                                |
| ---- | ------------------ | ----------------------------------- |
| load | `get` 或 `find`    | 优先 `get`                          |
| save | `save` 或 `update` | 优先 `save`；`update` 时 API 用 PUT |
