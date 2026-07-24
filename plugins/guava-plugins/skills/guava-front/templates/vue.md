# Vue 文件格式

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

本模板定义 `*.vue` 文件的**通用格式规范**，所有 Vue 组件（Index / Edit / form-only / free）均遵循此结构。

---

## 1. 文件结构

```vue
<!--
 * @title: <模块中文标题>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->
<script setup lang="tsx">
  // ↓ imports（按类型分组：类型 / vue / API / 组件 / hook）
  import type { FormInstance, TableInstance } from 'element-plus';
  import { nextTick, onMounted, ref } from 'vue';
  import { findXxxApi } from '@/api/<apiModule>';
  import { crud } from '@/hook/service/useCrud';
  import { useNotify } from '@/hook/web/useNotify';
  import { useI18n } from '@/hook/web/useI18n';

  // @define name
  defineOptions({ name: '<ComponentName>' });

  // @hook
  const { message, confirm } = useNotify();
  const { t } = useI18n();

  // @data
  const xxxFm = ref<FormInstance>();
  const xxxList = ref<any[]>([]);
  const searchData = ref<Recordable<any>>({});

  // @computed
  // const someComputed = computed(() => { ... });

  // @methods
  /**
   * @todo: 方法说明
   * @author: <git user.name>
   * @Date: <current YYYY-MM-DD HH:mm:ss>
   * @param param 参数说明
   */
  const someMethod = () => { ... };

  // @bizData
  // xxxList.value = createXxxList().value;

  // @watch
  // watch(() => someValue.value, (val) => { ... });

  // @mounted
  onMounted(() => {
    nextTick(() => {
      // init logic
    });
  });
</script>

<template>
  <div>
    <!-- 页面模板 -->
  </div>
</template>
```

---

## 2. Section 注释

| 注释 | 位置 | 内容 |
| ---- | ---- | ---- |
| `// @define name` | import 之后 | `defineOptions({ name: 'ComponentName' })` |
| `// @hook` | define 之后 | `useNotify` / `useI18n` 等 |
| `// @data` | hook 之后 | `ref` / `reactive` |
| `@props` | Edit 组件 | `defineProps({...})` |
| `@emit` | Edit 组件 | `defineEmits([...])` |
| `// @computed` | data 之后 | `computed` |
| `// @methods` | computed 之后 | 业务方法（含 JSDoc） |
| `// @bizData` | methods 之后 | helper 工厂赋值 |
| `// @watch` | bizData 之后 | `watch` |
| `// @mounted` | watch 之后 | `onMounted` + `nextTick` |

---

## 3. JSDoc 方法注释

```typescript
/**
 * @todo: 方法功能描述
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 * @param paramName 参数说明
 */
```

---

## 4. i18n 开关

| `i18n` | 行为 |
| ------ | ---- |
| `false`（**默认**） | label / 文案直接写中文，不 `import useI18n`，不使用 `t()` |
| `true` | label 使用 `t('i18nKey.xxx')`，需 `import useI18n` |

---

## 5. import 顺序

1. 类型 import（`element-plus` / `guava-ui` 类型）
2. vue 核心（`ref` / `computed` / `watch` / `onMounted` / `nextTick`）
3. API 函数（`@/api/...`）
4. 组件（`Gv*` / `el-*` / 自定义组件）
5. hook（`@/hook/...`）
6. 类型（`@/types/...` 或 `./types`）

---

## 6. 全局类型（禁止 import）

| 类型 | 说明 |
| ---- | ---- |
| `FormItem` | 表单字段配置 |
| `TableHeadItem` | 表格列配置 |
| `Recordable<T>` | 通用记录类型 |
| `TableRowFn` | 表格行回调 |
| `DictSelectedFn` | 字典选中回调 |
| `Fn` | 通用函数类型 |

---

## 7. 页面类型与模板

| pageType | 主页模板 | Edit 模板 |
| -------- | -------- | --------- |
| `crud-module` | [crud.md](crud.md) | [edit.md](edit.md) |
| `tabs` | [tabs.md](tabs.md) | drawer 时 [edit.md](edit.md) |
| `form-only` | [form.md](form.md) | — |
| `free` | [free.md](free.md) | — |

---

## 8. layout 对路径的影响

| layout | helper / types / Edit 位置 |
| ------ | -------------------------- |
| `module` | `src/views/<view>/module/` |
| `flat` | `src/views/<view>/` |
