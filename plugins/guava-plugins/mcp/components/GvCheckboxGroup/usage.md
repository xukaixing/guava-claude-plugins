> CheckboxGroup 组件对应 `GvCheckboxGroup`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# CheckboxGroup 复选框组

用于多个勾选框绑定到同一个数组的情景，通过是否勾选来表示这一组选项中选中的项。

::: tip
CheckboxGroup 组件对应 `GvCheckboxGroup`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

在 `GvCheckboxGroup` 元素中定义 `v-model` 绑定变量，单一的 `GvCheckbox` 中，默认绑定变量的值会是 `Boolean`，选中为 `true`。 在 `GvCheckboxGroup` 组件中，`value` 是选择框的值。 如果指定的值存在于数组中，就处于选择状态，反之亦然。

<!-- example: see examples[] -->

## 自定义属性

通过 props 属性自定义 options 的别名

<!-- example: see examples[] -->

## 半选中状态

通过 `indeterminate` 属性来表示半选中状态。表现为`➖`

<!-- example: see examples[] -->

## API

### Attributes

| 属性名                | 说明                       | 类型                     | 默认值    |
| --------------------- | -------------------------- | ------------------------ | --------- |
| model-value / v-model | 绑定值                     | `string[]` \| `number[]` | —         |
| vref                  | 设置checkboxGroup的ref属性 | `string`                 | —         |
| label                 | 标签文本                   | `string`                 | —         |
| size                  | 大小                       | `string`                 | `default` |
| disabled              | 是否禁用                   | `boolean`                | `false`   |
| min                   | 最小选择数量               | `number`                 | —         |
| max                   | 最大选择数量               | `number`                 | —         |
| indeterminate         | 半选中状态                 | `boolean`                | `false`   |

### Events

| 事件名 | 说明                     | 类型                                    |
| ------ | ------------------------ | --------------------------------------- |
| change | 当绑定值变化时触发的事件 | `(value: string[] \| number[]) => void` |

## 示例源码（已内嵌，无需 press）

### CheckboxGroupBasic

```vue
<template>
  <GvCheckboxGroup v-model="checkList" @change="handleChange">
    <GvCheckbox label="Option A" value="Value A">Option A</GvCheckbox>
    <GvCheckbox label="Option B" value="Value B">Option B</GvCheckbox>
    <GvCheckbox label="Option C" value="Value C">Option C</GvCheckbox>
    <GvCheckbox label="Option D" value="Value D" disabled>Option D</GvCheckbox>
    <GvCheckbox label="Option E" value="Value E" disabled>Option E</GvCheckbox>
  </GvCheckboxGroup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// @data
const checkList = ref(['Option A', 'Option E']);

// @method
const handleChange = (val: string[]) => {
  console.log(val);
};
</script>
```

### CheckboxGroupOptions

```vue
<template>
  <GvCheckboxGroup @change="handleChange" v-model="checkList" :options="options" :props="props" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// @data
// 默认选中项
const checkList = ref(['Value B', 'Value A'])
// 对应 options 中的属性名
const props = { label: 'name', value: 'id', disabled: 'unable' }
// 选项列表
const options = [
  { name: 'Option A', id: 'Value A' },
  { name: 'Option B', id: 'Value B' },
  { name: 'Option C', id: 'Value C' },
  { name: 'Option D', id: 'Value D', unable: true },
  {name: 'Option E',id: 'Value E',unable: true},
]

// @method
const handleChange = (val: string[]) => {
  console.log(val);
};
</script>
```

### CheckboxGroupIndeterminate

```vue
<template>
  <GvCheckbox
    v-model="checkAll"
    :indeterminate="isIndeterminate"
    @change="checkAllChange"
    value="checkAll"
  >
    Check all
  </GvCheckbox>
  <GvCheckboxGroup
    v-model="checkedOption"
    @change="checkedOptionChange"
  >
    <GvCheckbox v-for="option in options" :key="option" :label="option" :value="option">
      {{ option }}
    </GvCheckbox>
  </GvCheckboxGroup>
</template>

<script lang="ts" setup>
import type { CheckboxValueType } from 'element-plus'
import { ref } from 'vue'

// @data
const checkAll = ref(false)
const isIndeterminate = ref(true)
const checkedOption = ref(['Option A', 'Option B'])
const options = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E']

// @method
const checkAllChange = (val: CheckboxValueType) => {
  checkedOption.value = val ? options : []
  isIndeterminate.value = false
}
const checkedOptionChange = (value: CheckboxValueType[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === options.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < options.length
}
</script>
```
