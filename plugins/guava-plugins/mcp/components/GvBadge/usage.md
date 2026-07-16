> Badge 组件对应 `GvBadge`，下方示例可直接交互，点击「显示代码」查看源码。

# Badge 徽章

按钮和图标上的数字或状态标记。

::: tip
Badge 组件对应 `GvBadge`，下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

可以用来展示新消息的数量, 数量值可接受 `Number` 或 `String`。

<!-- example: see examples[] -->

## 最大值​

由 `max` 属性定义，接受 `Number` 值。 需注意，仅在值也是 `Number` 时起作用。

<!-- example: see examples[] -->

## 自定义显示内容​

可以展示除数字以外想要展示的任何值。 当 `value` 是 `String` 时，可以显示自定义文字。

<!-- example: see examples[] -->

## 点状徽章

通过一个小红点标记来告知用户有新内容。使用 `is-dot` 属性。 是个布尔值。

<!-- example: see examples[] -->

## 自定义颜色

通过 `color` 属性自定义徽章的颜色。

<!-- example: see examples[] -->

## 零值徽章

当 `showZero` 为 `true` 时，徽章会显示为一个点。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名   | 说明                                                                | 类型                | 默认值    |
| -------- | ------------------------------------------------------------------- | ------------------- | --------- |
| value    | 设置标记数量                                                        | `number` / `string` | ''        |
| max      | 最大值，超过最大值会显示 {max}+。 只有当 value 是数字类型时起作用。 | `number`            | 10        |
| isDot    | 是否为点状徽章                                                      | `boolean`           | `false`   |
| hidden   | 是否隐藏徽章                                                        | `boolean`           | `false`   |
| type     | 设置徽章类型                                                        | `string`            | `warning` |
| showZero | 是否显示零值徽章                                                    | `boolean`           | `false`   |
| color    | 自定义徽章颜色                                                      | `string`            | 一        |

### Events

无

## 类型定义

```typescript
// Badge 类型
type BadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
```

## 示例源码（已内嵌，无需 press）

### BadgeBasic

```vue
<template>
  <GvBadge :value="3" class="item">
    <GvButton>replies</GvButton>
  </GvBadge>
  <GvBadge :value="12" class="item">
    <GvButton>comments</GvButton>
  </GvBadge>
  <GvBadge :value="1" class="item" type="primary">
    <GvButton>comments</GvButton>
  </GvBadge>
  <GvBadge :value="2" class="item" type="warning">
    <GvButton>replies</GvButton>
  </GvBadge>
  <GvBadge :value="1" class="item" color="green">
    <GvButton>custom background</GvButton>
  </GvBadge>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 30px;
}
</style>
```

### BadgeMax

```vue
<template>
  <GvBadge :value="200" :max="99" type="primary" class="item">
    <GvButton>comments</GvButton>
  </GvBadge>
  <GvBadge :value="100" :max="10" type="danger" class="item">
    <GvButton>replies</GvButton>
  </GvBadge>
</template>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
</style>
```

### BadgeCustom

```vue
<template>
  <GvBadge value="new" class="item">
    <GvButton>comments</GvButton>
  </GvBadge>
  <GvBadge value="hot" type='denger' class="item">
    <GvButton>replies</GvButton>
  </GvBadge>
</template>

<script setup lang="ts">
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}

.custom-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
```

### BadgeDot

```vue
<template>
  <GvBadge is-dot class="item" type="danger">query</GvBadge>
  <GvBadge is-dot class="item" type="danger">
    <GvButton icon="gv-icon-jisuan">computed</GvButton>
  </GvBadge>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
:deep(.el-badge__content.is-dot) {
  height: 8px !important;
}
</style>
```

### BadgeColor

```vue
<template>
  <GvBadge :value="3" color="#FF6699" >
    <GvButton>replies</GvButton>
  </GvBadge>
</template>

<script lang="ts" setup>
</script>

```

### BadgeZero

```vue
<template>
  <GvBadge :value="0" show-zero class="item">
    <GvButton>Show zero</GvButton>
  </GvBadge>
  <GvBadge :value="0" class="item">
    <GvButton>Hide zero</GvButton>
  </GvBadge>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 30px;
}
</style>
```
