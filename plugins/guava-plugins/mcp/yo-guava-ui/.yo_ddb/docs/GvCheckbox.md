> Checkbox 组件对应 `GvCheckbox`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# Checkbox 复选框

在一组备选项中进行多选。

::: tip
Checkbox 组件对应 `GvCheckbox`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

单独使用可以表示两种状态之间的切换，写在标签中的内容为 `checkbox` 按钮后的介绍。

<!-- example: see examples[] -->

## 禁用状态​

多选框不可用状态。

设置 `disabled` 属性即可。

<!-- example: see examples[] -->

## 边框样式

设置 `border` 属性即可得到一个有边框的复选框。

<!-- example: see examples[] -->

## 大小

设置 `size` 属性即可得到一个不同大小的复选框。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名                | 说明                  | 类型                            | 默认值    |
| --------------------- | --------------------- | ------------------------------- | --------- |
| model-value / v-model | 绑定值                | `string` / `number` / `boolean` | —         |
| vref                  | 设置checkbox的ref属性 | `string`                        | —         |
| value                 | 复选框值              | `string`                        | —         |
| visible               | 是否可见              | `boolean`                       | `true`    |
| indeterminate         | 设置是否全部选中状态  | `boolean`                       | `false`   |
| label                 | 标签文本              | `string`                        | —         |
| disabled              | 是否禁用              | `boolean`                       | `false`   |
| border                | 是否显示边框          | `boolean`                       | `false`   |
| size                  | 大小                  | `string`                        | `default` |

### Events

| 事件名 | 说明                     | 类型                                           |
| ------ | ------------------------ | ---------------------------------------------- |
| change | 当绑定值变化时触发的事件 | `(value: string \| number \| boolean) => void` |

## 类型定义

```typescript
// Checkbox 尺寸
type CheckboxSize = 'large' | 'default' | 'small';
```

## 示例源码（已内嵌，无需 press）

### CheckboxBasic

```vue
<template>
    <GvCheckbox v-model="checkAll" value="1" label="Select all" @change="handleChange">Select all</GvCheckbox>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const checkAll = ref<boolean>(false)

const handleChange = (_val: boolean) => {
  // console.log(val, checkAll.value)
}
</script>
```

### CheckboxDisabled

```vue
<template>
  <GvCheckbox v-model="checked1" disabled value="1" label="Disabled">Disabled</GvCheckbox>
  <GvCheckbox v-model="checked2" value="2" label="Not disabled">Not disabled</GvCheckbox>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checked1 = ref(false)
const checked2 = ref(true)
</script>
```

### CheckboxBorder

```vue
<template>
  <GvCheckbox v-model="checked1" border value="1" label="Border">Border</GvCheckbox>
  <GvCheckbox v-model="checked2" value="2" label="Not border">Not border</GvCheckbox>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checked1 = ref(false)
const checked2 = ref(true)
</script>
```

### CheckboxSize

```vue
<template>
  <GvCheckbox v-model="checked1" size="small" value="1" label="Small">Small</GvCheckbox>
  <GvCheckbox v-model="checked2" size="default" value="2" label="Default">Default</GvCheckbox>
  <GvCheckbox v-model="checked3" size="large" value="3" label="Large">Large</GvCheckbox>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checked1 = ref(false)
const checked2 = ref(true)
const checked3 = ref(false)
</script>
```
