> Row 组件对应 `GvRow`。下方示例可直接交互，点击「显示代码」查看源码。

# row 行组件

行组件用于组织其他组件。

::: tip
Row 组件对应 `GvRow`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## 自定义元素标签用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名 | 说明                  | 类型     | 默认值 |
| ------ | --------------------- | -------- | ------ |
| gutter | row的列间距           | `number` | 0      |
| tag    | row渲染的html tag属性 | `string` | div    |

## 类型定义

```typescript
interface RowProps {
  gutter?: number;
  tag?: string;
}
```

## 示例源码（已内嵌，无需 press）

### RowBasic

```vue
<template>
  <GvRow :gutter="24">
    <GvCol :span="6">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :span="6">
      <div class="vp-col">列2</div>
    </GvCol>
  </GvRow>
  <GvRow :gutter="24">
    <GvCol :span="6">
      <div class="vp-col">列1</div>
    </GvCol>
  </GvRow>
</template>

<script setup lang="ts"></script>

<style>
.el-row {
  margin-bottom: 10px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}
</style>
```

### Tag

```vue
<template>
  <GvRow :gutter="24" tag="section">
    <GvCol :span="6">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :span="6">
      <div class="vp-col">列2</div>
    </GvCol>
  </GvRow>
</template>

<script setup lang="ts">

</script>
```
