> Col 组件对应 `GvCol`。下方示例可直接交互，点击「显示代码」查看源码。

# col 列组件

行组件用于组织其他组件。

::: tip
Col 组件对应 `GvCol`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

使用列创建基础网格布局。

通过 GvRow 和 GvCol 组件，并通过 GvCol 组件的 span 属性我们就可以自由地组合布局。

<!-- example: see examples[] -->

## 混合布局

通过基础的 1/24 分栏任意扩展组合形成较为复杂的混合布局。

<!-- example: see examples[] -->

## 列偏移

可以指定列偏移量。

通过制定 col 组件的 offset 属性可以指定分栏偏移的栏数。

<!-- example: see examples[] -->

## 响应式布局

预设了五个响应尺寸：xs、sm、md、lg 和 xl。

<!-- example: see examples[] -->

## 自定义元素标签用法

<!-- example: see examples[] -->

## 可见性控制

设置列是否可见。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名  | 说明                        | 类型      | 默认值 |
| ------- | --------------------------- | --------- | ------ |
| span    | 设置col的占用列（一行24列） | `number`  | 24     |
| offset  | 设置col的偏移               | `number`  | 0      |
| xs      | 设置手机屏幕大小显示        | `number`  | -      |
| sm      | 设置手机屏幕大小显示        | `number`  | -      |
| md      | 设置pad屏幕大小显示         | `number`  | -      |
| lg      | 设置pc屏幕大小显示          | `number`  | -      |
| xl      | 设置大屏幕大小显示          | `number`  | -      |
| tag     | 设置col渲染的html tag属性   | `string`  | div    |
| visible | 设置col是否可见             | `boolean` | true   |

## 类型定义

```typescript
interface ColProps {
  span?: number;
  offset?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  tag?: string;
  visible?: boolean;
}
```

## 示例源码（已内嵌，无需 press）

### ColBasic

```vue
<template>
  <GvRow>
    <GvCol :span="24">
      <div class="vp-col">列1</div>
    </GvCol>
  </GvRow>
  <GvRow>
    <GvCol :span="8">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :span="6">
      <div class="vp-col-light">列2</div>
    </GvCol>
    <GvCol :span="10">
      <div class="vp-col">列3</div>
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

### ColMixed

```vue
<template>
  <GvRow :gutter="20">
    <GvCol :span="16"><div class="vp-col">列1</div></GvCol>
    <GvCol :span="8"><div class="vp-col">列2</div></GvCol>
  </GvRow>
  <GvRow :gutter="20">
    <GvCol :span="8"><div class="vp-col">列1</div></GvCol>
    <GvCol :span="8"><div class="vp-col">列2</div></GvCol>
        <GvCol :span="4"><div class="vp-col">列3</div></GvCol>        
    <GvCol :span="4"><div class="vp-col">列4</div></GvCol>
  </GvRow>
  <GvRow :gutter="20">      
    <GvCol :span="4"><div class="vp-col">列1</div></GvCol>
    <GvCol :span="16"><div class="vp-col">列2</div></GvCol>
    <GvCol :span="4"><div class="vp-col">列3</div></GvCol>
  </GvRow>
</template>

<script setup lang="ts"></script>

<style>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
```

### ColOffset

```vue
<template>
  <GvRow :gutter="20">
    <GvCol :span="6"><div class="vp-col">列1</div></GvCol>
    <GvCol :span="6" :offset="6">
      <div class="vp-col">列2</div></GvCol>
  </GvRow>
  <GvRow :gutter="20">
    <GvCol :span="6" :offset="6">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :span="6" :offset="6">
      <div class="vp-col">列2</div>
    </GvCol>
  </GvRow>
  <GvRow :gutter="20">
    <GvCol :span="6" :offset="6">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :span="6" :offset="6">
      <div class="vp-col">列2</div>
    </GvCol>
  </GvRow>
  <GvRow :gutter="20">
    <GvCol :span="12" :offset="6">
      <div class="vp-col">列1</div>
    </GvCol>
  </GvRow>
</template>

<style>
.GvRow {
  margin-bottom: 20px;
}
.GvRow:last-child {
  margin-bottom: 0;
}
.GvCol {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
```

### ColResponsive

```vue
<template>
  <GvRow :gutter="10">
    <GvCol :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :xs="4" :sm="6" :md="8" :lg="9" :xl="11">
      <div class="vp-col-light">列2</div>
    </GvCol>
    <GvCol :xs="4" :sm="6" :md="8" :lg="9" :xl="11">
      <div class="vp-col">列3</div>
    </GvCol>
    <GvCol :xs="8" :sm="6" :md="4" :lg="3" :xl="1">
      <div class="vp-col-light">列4</div>
    </GvCol>
  </GvRow>
</template>

<script setup lang="ts"></script>

```

### Tag

```vue
<template>
  <GvRow :gutter="24">
    <GvCol :span="6" tag="section">
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

### Visible

```vue
<template>
  <GvRow>
    <GvCol :span="24">
      <div class="vp-col">列1</div>
    </GvCol>
  </GvRow>
  <GvRow>
    <GvCol :span="8">
      <div class="vp-col">列1</div>
    </GvCol>
    <GvCol :span="6" :visible="visible">
      <div class="vp-col-light">列2</div>
    </GvCol>
    <GvCol :span="10">
      <div class="vp-col">列3</div>
    </GvCol>
  </GvRow>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false)
</script>

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
