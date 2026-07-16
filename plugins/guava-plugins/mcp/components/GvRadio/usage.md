> Radio 组件对应 `GvRadio`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# Radio 单选框

单选框组件，用于在多个选项中选择一个。

::: tip
Radio 组件对应 `GvRadio`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

单独使用可以表示多种状态之间的切换，写在标签中的内容为单选框后的介绍。

<!-- example: see examples[] -->

## 禁用状态

使用 `disabled` 属性可以用来控制单选框的禁用状态。

<!-- example: see examples[] -->

## 带有边框的单选框

使用 `border` 属性可以用来控制单选框是否有边框。

<!-- example: see examples[] -->

## 尺寸

使用 `size` 属性可以用来控制单选框的尺寸。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名                | 说明               | 类型                            | 默认值    |
| --------------------- | ------------------ | ------------------------------- | --------- |
| model-value / v-model | 绑定值             | `string` / `number` / `boolean` | —         |
| vref                  | 设置radio的ref属性 | `string`                        | —         |
| value                 | 单选框值           | `string`                        | —         |
| label                 | 标签文本           | `string`                        | —         |
| disabled              | 是否禁用           | `boolean`                       | `false`   |
| border                | 是否显示边框       | `boolean`                       | `false`   |
| size                  | 大小               | `string`                        | `default` |

### Events

| 事件名 | 说明                     | 类型                                           |
| ------ | ------------------------ | ---------------------------------------------- |
| change | 当绑定值变化时触发的事件 | `(value: string \| number \| boolean) => void` |

## 类型定义

```typescript
// Radio 尺寸
type RadioSize = 'large' | 'default' | 'small';
```

## 示例源码（已内嵌，无需 press）

### RadioBasic

```vue
<template>
  <div>
    <label>单选框：</label> 
    <GvRadio v-model="checkRadio" value="radio1">Option 1</GvRadio>
    <GvRadio v-model="checkRadio" value="radio2">Option 2</GvRadio>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checkRadio = ref<string>('radio1')
</script>
```

### RadioDisabled

```vue
<template>
  <div>
    <label>单选框：</label> 
    <GvRadio v-model="checkRadio" value="radio1" >Option 1</GvRadio>
    <GvRadio v-model="checkRadio" value="radio2" disabled>Option 2</GvRadio>
    <GvRadio v-model="checkRadio" value="radio3">Option 3</GvRadio>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checkRadio = ref<string>('radio1')
</script>
```

### RadioBorder

```vue
<template>
  <div>
    <label>带有边框的单选框：</label> 
    <GvRadio v-model="checkRadio" value="radio1" border>Option 1</GvRadio>
    <GvRadio v-model="checkRadio" value="radio2" border>Option 2</GvRadio>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checkRadio = ref<string>('radio1')
</script>
```

### RadioSize

```vue
<template>
  <div>
    <label>单选框：</label> 
    <GvRadio v-model="checkRadio" value="radio1" size="large">Option 1</GvRadio>
    <GvRadio v-model="checkRadio" value="radio2">Option 2</GvRadio>
    <GvRadio v-model="checkRadio" value="radio3" size="small">Option 3</GvRadio>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checkRadio = ref<string>('radio1')
</script>
```
