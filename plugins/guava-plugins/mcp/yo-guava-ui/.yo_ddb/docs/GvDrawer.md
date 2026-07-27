> Drawer 组件对应 `GvDrawer`。下方示例可直接交互，点击「显示代码」查看源码。

# Drawer 抽屉

::: tip
Drawer 组件对应 `GvDrawer`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名    | 说明             | 类型      | 默认值 |
| --------- | ---------------- | --------- | ------ |
| visible   | 设置是否可见     | `boolean` | `true` |
| title     | 设置抽屉标题     | `string`  | `标题` |
| direction | 设置抽屉展开方向 | `string`  | `rtl`  |

### Events

| 事件名 | 说明             | 类型         |
| ------ | ---------------- | ------------ |
| open   | 打开窗口响应方法 | `() => void` |

## 类型定义

```typescript
// direction 类型定义
type DrawerDirection = 'rtl' | 'ltr' | 'ttb' | 'btt';
```

## 示例源码（已内嵌，无需 press）

### Drawer

```vue
<template>
  <div>
    <GvButton @click="drawerVisible = !drawerVisible">浮动抽屉</GvButton>
    <GvDrawer
      title="抽屉标题"
      v-model:visible="drawerVisible"
    >
      <div>
        <p>抽屉窗口样例</p>
      </div>
      <template #footer>
        <GvButton type="primary" @click="drawerVisible = false">确定</GvButton>
      </template>
    </GvDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const drawerVisible = ref(false)
 </script>

<style scoped>
:deep(.gv-drawer){
  z-index:99 !important;
}
</style>

```
