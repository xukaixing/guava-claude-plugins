> InputNumber 组件对应 `GvInputNumber`。支持`v-model`双向数据绑定，下方示例可直接交互，点击「显示代码」查看源码。

# InputNumber 数字输入框

仅允许输入标准的数字值，可定义范围

::: tip
InputNumber 组件对应 `GvInputNumber`。支持`v-model`双向数据绑定，下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

使用 `v-model` 绑定变量即可，变量的初始值即为默认值。

<!-- example: see examples[] -->

## 禁用状态

通过 `disabled` 属性禁用输入框。

<!-- example: see examples[] -->

## 步进​

允许定义递增递减的步进控制, 设置 `step` 属性可以控制步长。

<!-- example: see examples[] -->

## 严格步进​

`step-strictly`属性接受一个`Boolean`。 如果这个属性被设置为 `true`，则只能输入步进的倍数。

<!-- example: see examples[] -->

## 精度

通过 `precision` 属性可以设置输入框的精度，可选值为 `0`、`1`、`2`。

<!-- example: see examples[] -->

## 不同的输入框尺寸

通过 `size` 属性可以设置输入框的尺寸，可选值为 `small`、`default`、`large`。

<!-- example: see examples[] -->

## 按钮位置

通过 `position` 属性可以设置输入框的按钮位置，可选值为 ``、`right`。

<!-- example: see examples[] -->

## 范围

通过 `min` 和 `max` 属性可以设置输入框的范围。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名                | 说明                           | 类型                                | 默认值      |
| --------------------- | ------------------------------ | ----------------------------------- | ----------- |
| model-value / v-model | 绑定值                         | `string` / `number`                 | —           |
| name                  | 设置input的name属性            | `string`                            | —           |
| placeholder           | 占位文本                       | `string`                            | —           |
| disabled              | 是否禁用                       | `boolean`                           | `false`     |
| visible               | 设置是否可见                   | `boolean`                           | `false`     |
| size                  | 输入框尺寸                     | `'large'` / `'default'` / `'small'` | `default`   |
| min                   | 设置input的value最小值         | `number`                            | —           |
| max                   | 设置input的value最大值         | `number`                            | —           |
| step                  | 设置input的步长                | `number`                            | 1           |
| stepStrictly          | 设置是否只能输入 step 的倍数   | `boolean`                           | `false`     |
| precision             | 设置数值精度                   | `number`                            | `0`         |
| position              | 设置按钮位置                   | ``/`'right'`                        | ``          |
| biz-type              | 业务属性：tableedit-表格输入框 | `string`                            | `tableedit` |
| columnProp            | 当是表格编辑input时列属性值    | `string`                            | —           |

### Events

| 事件名 | 说明                        | 类型                                                                         |
| ------ | --------------------------- | ---------------------------------------------------------------------------- |
| blur   | 在组件 Input 失去焦点时触发 | `(event: FocusEvent) => void`                                                |
| focus  | 在组件 Input 获得焦点时触发 | `(event: FocusEvent) => void`                                                |
| change | 绑定值被改变时触发          | `(currentValue: number \| undefined, oldValue: number \| undefined) => void` |
| input  | 输入值变化时触发            | `(value: string \| number) => void`                                          |

### Exposes

无

## 类型定义

```typescript
/** Input 尺寸 */
type InputSize = 'large' | 'default' | 'small';

/** GvInputNumber Props */
interface InputNumberProps {
  modelValue?: string | number;
  bizType?: string;
  columnProp?: string;
  disabled?: boolean;
  max?: number;
  min?: number;
  name?: string;
  placeholder?: string;
  position?: string;
  precision?: number;
  size?: InputSize;
  step?: number;
  stepStrictly?: boolean;
  visible?: boolean;
  vref?: string;
}
```

## 示例源码（已内嵌，无需 press）

### InputNumberBasic

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber ref="inputRef"  vref="refId" v-model="inputVal" placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

// @data
const inputVal = ref<number>(1)
const inputRef = ref(null)

onMounted(() => {
  console.log(inputRef.value)
})
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```

### InputNumberDisabled

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber vref="refId" :disabled="disabled" v-model="inputVal" placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputVal = ref<number>(1)
const disabled = ref<boolean>(true)
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```

### InputNumberStep

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber vref="refId" :step="step" v-model="inputVal" placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputVal = ref<number>(0)
const step = ref<number>(5)
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```

### InputNumberStepStrictly

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber vref="refId" :step="2" :step-strictly="stepStrictly" v-model="inputVal"  placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputVal = ref<number>(0)
const stepStrictly = ref<boolean>(true)
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```

### InputNumberPrecision

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber vref="refId" :precision="2" :step="0.1" v-model="inputVal" placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputVal = ref<number>(1)
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```

### InputNumberSize

```vue
<template>
  <div class="vp-input-size">
    <div>
      <label>小号：</label> 
      <GvInputNumber vref="refId" size="small" v-model="inputValSmall"  placeholder="请输入" class="vp-input-width" />
    </div>
    <div>
      <label>默认：</label> 
      <GvInputNumber vref="refId" size="default" v-model="inputValDefault"  placeholder="请输入" class="vp-input-width" />
    </div>
    <div>
      <label>大号：</label> 
      <GvInputNumber vref="refId" size="large" v-model="inputValLarge"  placeholder="请输入" class="vp-input-width" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputValSmall = ref<number>(0)
const inputValLarge = ref<number>(2)
const inputValDefault = ref<number>(1)
</script>

<style scoped>
.vp-input-width {
  width: 150px;
}
.vp-input-size {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: center;
}
:deep(.el-input-number__decrease){
  line-height: normal !important;
  height: auto !important;
}
:deep(.el-input-number__increase){
  line-height: normal !important;
  height: auto !important;
}
</style>
```

### InputNumberButtonPostion

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber vref="refId" :position="position" v-model="inputVal" placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputVal = ref<number>(1)
const position = ref<string>('right')
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```

### InputNumberMinMax

```vue
<template>
  <div>
    <label>数字输入框：</label> 
    <GvInputNumber vref="refId" :min="min" :max="max" v-model="inputVal" placeholder="请输入" class="vp-input-width" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const inputVal = ref<number>(0)
const min = ref<number>(0)
const max = ref<number>(10)
</script>

<style>
.vp-input-width {
  width: 150px;
}
</style>
```
