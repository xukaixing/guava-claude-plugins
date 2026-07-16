> RadioButton 组件对应 `GvRadioButton`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# RadioButton 单选框

按钮样式的单选组合。

::: tip
RadioButton 组件对应 `GvRadioButton`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

基本都是 `GvRadioGroup` 组件的子组件，支持 `v-model` 双向绑定，不独立使用。 参考 [GvRadioGroup 组件](/guava-api/frontend/components/radiogroup)。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名   | 说明                                                 | 类型                              | 默认值  |
| -------- | ---------------------------------------------------- | --------------------------------- | ------- |
| value    | 单选框的值                                           | `string` \| `number` \| `boolean` | —       |
| label    | 单选框的 label 如果没有 value， label则作为value使用 | `string` \| `number` \| `boolean` | —       |
| disabled | 是否禁用                                             | `boolean`                         | `false` |
| name     | 原生 name 属性                                       | `string`                          | —       |

## 示例源码（已内嵌，无需 press）

### RadioButtonBasic

```vue
<template>
  <div>
    <GvRadioGroup v-model="radio" size="large" fill="#409eff">
      <GvRadioButton label="Option A" value="Option A" >Option A</GvRadioButton>
      <GvRadioButton label="Option B" value="Option B" >Option B</GvRadioButton>
      <GvRadioButton label="Option C" value="Option C" disabled >Option C</GvRadioButton>
      <GvRadioButton label="Option D" value="Option D" >Option D</GvRadioButton>
    </GvRadioGroup>
  </div>
  <div style="margin-top: 20px">
    <GvRadioGroup v-model="radio" text-color="#fff" fill="#6c6cff">
      <GvRadioButton label="Option A" value="Option A" >Option A</GvRadioButton>
      <GvRadioButton label="Option B" value="Option B" >Option B</GvRadioButton>
      <GvRadioButton label="Option C" value="Option C" disabled >Option C</GvRadioButton>
      <GvRadioButton label="Option D" value="Option D" >Option D</GvRadioButton>
    </GvRadioGroup>
  </div>
  <div style="margin-top: 20px">
    <GvRadioGroup v-model="radio" size="small">
      <GvRadioButton label="Option A" value="Option A" >Option A</GvRadioButton>
      <GvRadioButton label="Option B" value="Option B" >Option B</GvRadioButton>
      <GvRadioButton label="Option C" value="Option C" disabled >Option C</GvRadioButton>
      <GvRadioButton label="Option D" value="Option D" >Option D</GvRadioButton>
    </GvRadioGroup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const radio = ref('Option A')
</script>
```
