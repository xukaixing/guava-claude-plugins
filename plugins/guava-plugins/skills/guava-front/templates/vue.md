# Vue 文件格式模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

本模板定义 `*.vue` 文件的**通用格式规范**，所有 Vue 组件（Index / Edit / form-only）均遵循此结构。

## 文件结构

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
  // ↓ imports（按类型分组，API / 组件 / hook / 类型）
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

## Section 注释规范

| 注释 | 位置 | 内容 |
|------|------|------|
| `// @define name` | import 之后 | `defineOptions({ name: 'ComponentName' })` |
| `// @hook` | define 之后 | `useNotify` / `useI18n` 等 hook 调用 |
| `// @data` | hook 之后 | `ref` / `reactive` 声明的响应式数据 |
| `@props` | Edit 组件 | `defineProps({...})` |
| `@emit` | Edit 组件 | `defineEmits([...])` |
| `// @computed` | data 之后 | `computed` 计算属性 |
| `// @methods` | computed 之后 | 业务方法（含 JSDoc 注释） |
| `// @bizData` | methods 之后 | helper 工厂赋值等初始化逻辑 |
| `// @watch` | bizData 之后 | `watch` 监听 |
| `// @mounted` | watch 之后 | `onMounted` + `nextTick` 初始化 |

## JSDoc 方法注释规范

```typescript
/**
 * @todo: 方法功能描述
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 * @param paramName 参数说明
 * @param paramName2 参数说明
 */
```

## i18n 开关

| `i18n` | 行为 |
|--------|------|
| `false`（**默认**） | label/文案直接写硬编码中文（如 `label: '用户账号'`），不 `import useI18n`，不使用 `t()` |
| `true** | label/文案使用 `t('i18nKey.xxx')`，需 `import useI18n` 并调用 `useI18n()` |

## import 顺序

1. 类型 import（`element-plus` / `guava-ui` 类型）
2. vue 核心（`ref` / `computed` / `watch` / `onMounted` / `nextTick`）
3. API 函数（`@/api/...`）
4. 组件（`Gv*` / `el-*` / 自定义组件）
5. hook（`@/hook/...`）
6. 类型（`@/types/...` 或 `./types`）

## 全局类型（禁止 import）

以下类型定义在 `types/app.d.ts`（`declare global`），直接使用：

- `FormItem` — 表单字段配置
- `TableHeadItem` — 表格列配置
- `Recordable<T>` — 通用记录类型
- `TableRowFn` — 表格行回调
- `DictSelectedFn` — 字典选中回调
- `Fn` — 通用函数类型

## layout 对路径的影响

| layout | helper/types/Edit 位置 |
|--------|------------------------|
| `module` | `src/views/<view>/module/` |
| `flat` | `src/views/<view>/` |

## 页面类型与模板对应

| pageType | 主页模板 | Edit 模板 |
|----------|---------|-----------|
| `crud-module` | [index-page.md](index-page.md) | [edit-page.md](edit-page.md) |
| `tabs` | [index-page-tabs.md](index-page-tabs.md) | drawer 时 [edit-page.md](edit-page.md) |
| `form-only` | [form-only-page.md](form-only-page.md) | — |

---
