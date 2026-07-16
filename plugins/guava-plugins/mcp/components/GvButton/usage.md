> Button 组件对应 `GvButton`，下方示例可直接交互，点击「显示代码」查看源码。

# Button 按钮

::: tip
Button 组件对应 `GvButton`，下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

分别使用 `type`, `plain`, `round`, `dashed` 来定义按钮的样式。最后一行展示了图标按钮。

<!-- example: see examples[] -->

## 禁用状态​

使用 `disabled` 属性来控制按钮是否为禁用状态。 该属性接受一个 `Boolean` 类型的值。

<!-- example: see examples[] -->

## 尺寸

使用 `size` 属性额外配置尺寸。

<!-- example: see examples[] -->

## 加载状态

使用 `loading` 属性来控制按钮是否为加载状态。 该属性接受一个 `Boolean` 类型的值。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名     | 说明                 | 类型      | 默认值    |
| ---------- | -------------------- | --------- | --------- |
| type       | 类型                 | `string`  | —         |
| text       | 是否为文字按钮       | `boolean` | `false`   |
| otext      | 设置button原始文本   | `string`  | —         |
| size       | 设置button的大小     | `string`  | `default` |
| visible    | 设置是否可见         | `boolean` | `true`    |
| confirm    | 设置是否带确认框     | `boolean` | `false`   |
| loading    | 设置是否加载状态     | `boolean` | `false`   |
| disabled   | 是否禁用             | `boolean` | `false`   |
| icon       | 设置按钮icon图标     | `string`  | —         |
| bizType    | 业务类型             | `string`  | —         |
| nativeType | 按钮按钮原生type属性 | `string`  | `button`  |
| refForm    | 按钮关联的表单ref    | `string`  | —         |
| perms      | 按钮的授权权限       | `string`  | `false`   |

### Events

| 事件名 | 说明         | 类型                          |
| ------ | ------------ | ----------------------------- |
| click  | 按钮点击方法 | `(event: FocusEvent) => void` |

## 类型定义

```typescript
// Button 尺寸
type ButtonSize = 'large' | 'default' | 'small';

// Button 业务类型
type ButtonBizType = 'reset' | 'import' | 'export';

// Button 按钮原生type属性
type ButtonNativeType = 'button' | 'submit' | 'reset';
```

## 示例源码（已内嵌，无需 press）

### ButtonBasic

```vue
<template>
  <div class="button-example">
    <div class="button-row">
      <GvButton>Default</GvButton>
      <GvButton type="primary">Primary</GvButton>
      <GvButton type="success">Success</GvButton>
      <GvButton type="info">Info</GvButton>
      <GvButton type="warning">Warning</GvButton>
      <GvButton type="danger">Danger</GvButton>
    </div>
    <div class="button-row">
      <GvButton plain>Plain</GvButton>
      <GvButton type="primary" plain>Primary</GvButton>
      <GvButton type="success" plain>Success</GvButton>
      <GvButton type="info" plain>Info</GvButton>
      <GvButton type="warning" plain>Warning</GvButton>
      <GvButton type="danger" plain>Danger</GvButton>
    </div>
    <div class="button-row">
      <GvButton round>Round</GvButton>
      <GvButton type="primary" round>Primary</GvButton>
      <GvButton type="success" round>Success</GvButton>
      <GvButton type="info" round>Info</GvButton>
      <GvButton type="warning" round>Warning</GvButton>
      <GvButton type="danger" round>Danger</GvButton>
    </div>
    <div class="button-row">
      <GvButton dashed>Dashed</GvButton>
      <GvButton type="primary" dashed>Primary</GvButton>
      <GvButton type="success" dashed>Success</GvButton>
      <GvButton type="info" dashed>Info</GvButton>
      <GvButton type="warning" dashed>Warning</GvButton>
      <GvButton type="danger" dashed>Danger</GvButton>
    </div>
    <div class="button-row">
      <GvButton icon="gv-icon-ruku">Icon</GvButton>
      <GvButton type="primary" icon="gv-icon-chaxun">Search</GvButton>
      <GvButton type="success" icon="gv-icon-baocun1">Save</GvButton>  
      <GvButton type="info" icon="gv-icon-fanhui2">Back</GvButton>
      <GvButton type="warning" icon="gv-icon-card2">Card</GvButton>
      <GvButton type="danger" icon="gv-icon-setting">Setting</GvButton> 
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.button-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-row > * {
  margin: 0;
}
</style>
```

### ButtonDisabled

```vue
<template>
  <div class="button-example">
    <div class="button-row">
      <GvButton disabled>Default</GvButton>
      <GvButton type="primary" disabled>Primary</GvButton>
      <GvButton type="success" disabled>Success</GvButton>
      <GvButton type="info" disabled>Info</GvButton>
      <GvButton type="warning" disabled>Warning</GvButton>
      <GvButton type="danger" disabled>Danger</GvButton>
    </div>
  </div>
</template>

<style scoped>
.button-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-row > * {
  margin: 0;
}
</style>
```

### ButtonSize

```vue
<template>
  <div class="button-example">
    <div class="button-row">
      <GvButton size="large">Large</GvButton>
      <GvButton>Default</GvButton>
      <GvButton size="small">Small</GvButton> 
      <GvButton size="large" icon="el-icon-search">Search</GvButton>
      <GvButton icon="el-icon-search">Search</GvButton>
      <GvButton size="small" icon="el-icon-search">Search</GvButton>
    </div>
    <div class="button-row">
      <GvButton size="large" round>Large</GvButton>
      <GvButton round>Default</GvButton>
      <GvButton size="small" round>Small</GvButton>
      <GvButton size="large" icon="el-icon-search" round>Search</GvButton>
      <GvButton icon="el-icon-search" round>Search</GvButton>
      <GvButton size="small" icon="el-icon-search" round>Search</GvButton>
    </div>
  </div>
  
</template>

<script setup lang="ts"></script>

<style scoped>
.button-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-row > * {
  margin: 0;
}
</style>

```

### ButtonLoading

```vue
<template>
  <GvButton type="primary" loading>Loading</GvButton>
</template>

```
