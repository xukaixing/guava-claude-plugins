> RadioGroup 组件对应 `GvRadioGroup`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# RadioGroup 单选框组

适用于在多个互斥的选项中选择的场景

::: tip
RadioGroup 组件对应 `GvRadioGroup`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

结合`GvRadioGroup`元素和子元素`GvRadio`可以实现单选组， 为 `GvRadioGroup` 绑定 v-model，再为 每一个 `GvRadio` 设置好 label 属性即可， 另外，还可以通过 change 事件来响应变化，它会传入一个参数 value 来表示改变之后的值。

<!-- example: see examples[] -->

## Options 属性

可以通过 props 属性自定义 options 的别名。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名                | 说明                                                                  | 类型                                                   | 默认值                                                   |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| model-value / v-model | 绑定值                                                                | `string` / `number` / `boolean`                        | —                                                        |
| vref                  | 设置radiogroup的ref属性                                               | `string`                                               | —                                                        |
| size                  | 大小                                                                  | `string`                                               | `default`                                                |
| options               | 选项的数据源， value 的 key 和 label 和 disabled可以通过 props自定义. | `Array<{[key: string]: any}>`                          | —                                                        |
| props                 | options 的配置                                                        | `{ value?: string, label?: string, disabled?: string}` | `{value: 'value', label: 'label', disabled: 'disabled'}` |

### Events

| 事件名 | 说明                     | 类型                                           |
| ------ | ------------------------ | ---------------------------------------------- |
| change | 当绑定值变化时触发的事件 | `(value: string \| number \| boolean) => void` |

## 示例源码（已内嵌，无需 press）

### RadioGroupBasic

```vue
<template>
  <GvRadioGroup v-model="radio">
    <GvRadio :value="3">Option A</GvRadio>
    <GvRadio :value="6">Option B</GvRadio>
    <GvRadio :value="9">Option C</GvRadio>
  </GvRadioGroup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const radio = ref(3)
</script>
```

### RadioGroupOptions

```vue
<template>
  <GvRadioGroup v-model="radio" :options="options" :props="props" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// @data
const radio = ref(1)
const props = { value: 'id', label: 'name', disabled: 'unable' }
const options = [
  {
    id: 1,
    name: 'Option A',
  },
  {
    id: 2,
    name: 'Option B',
  },
  {
    id: 3,
    name: 'Option C',
    unable: true,
  },
]
</script>
```
