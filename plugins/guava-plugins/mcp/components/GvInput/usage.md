> Input 组件对应 `GvInput`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# Input 输入框

通过鼠标或键盘输入字符，是基础的表单组件。

::: tip
Input 组件对应 `GvInput`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## 禁用状态

通过 `disabled` 属性禁用输入框。

<!-- example: see examples[] -->

## 一键清空

使用 `clearable` 属性即可得到一个可清空的输入框。仅当 type 不为 `textarea` 时生效。

<!-- example: see examples[] -->

## 密码框

使用 `show-password` 属性即可得到一个可切换显示隐藏的密码框。仅当 type 为 `password` 时生效。

<!-- example: see examples[] -->

## 带 icon 的输入框

可以通过 `prefix-icon` 和 `suffix-icon` 属性来设置前缀与后缀图标，值为 **GvIcon 图标名称字符串**（如 `gv-icon-sousuo`、`el-icon-search`），不支持传入 Vue 组件。

<!-- example: see examples[] -->

## 文本域

`type` 设置为 `textarea` 即可使用文本域。可通过 `rows` 属性指定行数。

<!-- example: see examples[] -->

## 自适应高度文本域

设置 `autosize` 属性可以使得文本域高度根据内容自动调整。`autosize` 也可以接收对象，如 `{ minRows: 2, maxRows: 6 }`。

<!-- example: see examples[] -->

## 复合型输入

可通过 slot 来复合输入框，常用在输入框前后加入按钮或文字。

<!-- example: see examples[] -->

## 尺寸

可通过 `size` 属性指定输入框尺寸，可选值：`large` / `default` / `small`。

<!-- example: see examples[] -->

## 输入长度限制

使用 `maxlength` 和 `minlength` 属性限制输入长度。使用 `show-word-limit` 显示字数统计，需配合 `maxlength` 使用。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 绑定值 | `string` / `number` | — |
| type | 类型 | `'text'` / `'textarea'` / `'password'` / `'number'` 等 | `text` |
| maxlength | 最大输入长度 | `number` | `30` |
| minlength | 最小输入长度 | `string` / `number` | — |
| show-word-limit | 是否显示字数统计 | `boolean` | `false` |
| placeholder | 占位文本 | `string` | — |
| clearable | 是否可清空 | `boolean` | `false` |
| show-password | 是否显示密码切换按钮 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| size | 输入框尺寸 | `'large'` / `'default'` / `'small'` | — |
| prefix-icon | 前缀图标名称 | `string` | — |
| suffix-icon | 后缀图标名称 | `string` | — |
| rows | 文本域行数，仅 type 为 textarea 时有效 | `number` | `2` |
| autosize | 文本域自适应高度 | `boolean` / `{ minRows?: number; maxRows?: number }` | `false` |
| autocomplete | 原生 autocomplete 属性 | `string` | `off` |
| readonly | 是否只读 | `boolean` | `false` |
| tabindex | 输入框 tabindex | `string` / `number` | — |
| validate-event | 输入时是否触发表单校验 | `boolean` | `true` |
| input-style | input 或 textarea 的样式 | `string` / `CSSProperties` | — |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| blur | 失去焦点时触发 | `(event: FocusEvent) => void` |
| focus | 获得焦点时触发 | `(event: FocusEvent) => void` |
| change | 绑定值变化且失焦时触发 | `(value: string \| number) => void` |
| input | 输入值变化时触发 | `(value: string \| number) => void` |
| clear | 点击清空按钮时触发 | `() => void` |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| prefix | 输入框头部内容，只对非 textarea 有效 |
| suffix | 输入框尾部内容，只对非 textarea 有效 |
| prepend | 输入框前置内容，只对非 textarea 有效 |
| append | 输入框后置内容，只对非 textarea 有效 |

### Exposes

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| blur | 使 input 失去焦点 | `() => void` |
| clear | 清空输入值 | `() => void` |
| focus | 使 input 获取焦点 | `() => void` |
| input | HTML input 元素 | `Ref<HTMLInputElement>` |
| ref | HTML 元素或组件实例 | `Ref<HTMLInputElement>` |
| resizeTextarea | 改变 textarea 大小 | `() => void` |
| select | 选中 input 中的文字 | `() => void` |
| textarea | HTML textarea 元素 | `Ref<HTMLTextAreaElement>` |
| textareaStyle | textarea 的样式 | `Ref<StyleValue>` |

## 类型定义

```typescript
/** Input 尺寸 */
type InputSize = 'large' | 'default' | 'small'

/** Input 类型 */
type InputType = 'text' | 'textarea' | 'password' | 'number' | 'email' | 'url'

/** autosize 配置 */
interface InputAutosize {
  minRows?: number
  maxRows?: number
}

/** GvInput Props */
interface InputProps {
  modelValue?: string | number
  type?: InputType
  maxlength?: number
  minlength?: string | number
  showWordLimit?: boolean
  placeholder?: string
  clearable?: boolean
  showPassword?: boolean
  disabled?: boolean
  size?: InputSize
  prefixIcon?: string
  suffixIcon?: string
  rows?: number
  autosize?: boolean | InputAutosize
  readonly?: boolean
  validateEvent?: boolean
}
```

## 示例源码（已内嵌，无需 press）

### InputAutosize

```vue
<template>
  <GvInput
    v-model="textarea1"
    type="textarea"
    autosize
    placeholder="自适应高度"
  />
  <GvInput
    v-model="textarea2"
    type="textarea"
    :autosize="{ minRows: 2, maxRows: 4 }"
    placeholder="限制最小/最大行数"
    style="margin-top: 12px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const textarea1 = ref('')
const textarea2 = ref('')
</script>

```

### InputBasic

```vue
<template>
  <GvInput v-model="input" :placeholder="t('inputPlaceholder')" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/hook/web/useI18n'

const { t } = useI18n('demo')
const input = ref('')
</script>

```

### InputClearable

```vue
<template>
  <GvInput v-model="input" clearable placeholder="可清空" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
</script>

```

### InputComposite

```vue
<template>
  <GvInput v-model="input" placeholder="请输入">
    <template #prepend>Http://</template>
  </GvInput>
  <GvInput v-model="input2" placeholder="请输入" style="margin-top: 12px">
    <template #append>.com</template>
  </GvInput>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const input2 = ref('')
</script>

```

### InputDisabled

```vue
<template>
  <GvInput v-model="input" disabled placeholder="禁用状态" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
</script>

```

### InputIcon

```vue
<template>
  <GvInput v-model="input1" placeholder="搜索" prefix-icon="gv-icon-sousuo" />
  <GvInput
    v-model="input2"
    placeholder="请输入邮箱"
    suffix-icon="el-icon-message"
    style="margin-top: 12px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input1 = ref('')
const input2 = ref('')
</script>

```

### InputPassword

```vue
<template>
  <GvInput
    v-model="input"
    type="password"
    show-password
    placeholder="请输入密码"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
</script>

```

### InputSize

```vue
<template>
  <GvInput v-model="input" size="large" placeholder="Large" />
  <GvInput v-model="input" placeholder="Default" style="margin: 12px 0" />
  <GvInput v-model="input" size="small" placeholder="Small" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
</script>

```

### InputTextarea

```vue
<template>
  <GvInput
    v-model="textarea"
    type="textarea"
    :rows="3"
    placeholder="请输入描述"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const textarea = ref('')
</script>

```

### InputWordLimit

```vue
<template>
  <GvInput
    v-model="text"
    :maxlength="30"
    show-word-limit
    placeholder="最多 30 个字符"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
</script>

```
