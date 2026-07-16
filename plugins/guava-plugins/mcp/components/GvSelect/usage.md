> `GvSelect` 是**字典驱动**的选择器，必须设置 `dicType`。选项由字典数据加载，不支持通过 `ElOption` 插槽传入静态选项。 - 本地枚举：`dic-type="e#1=选项一:2=选项二:3=选项三"` - 远程字典：`dic-type="t#demo"` + `:dic-remote="fn"`

# Select 选择器

当选项过多时，使用下拉菜单展示并选择内容，是常用的表单组件。

::: tip
`GvSelect` 是**字典驱动**的选择器，必须设置 `dicType`。选项由字典数据加载，不支持通过 `ElOption` 插槽传入静态选项。

- 本地枚举：`dic-type="e#1=选项一:2=选项二:3=选项三"`
- 远程字典：`dic-type="t#demo"` + `:dic-remote="fn"`
:::

## 基础用法

适用广泛的基础单选。

<!-- example: see examples[] -->

## 过滤选项

通过 `filtercode` 正则过滤字典项，例如 `filtercode="1|3"` 仅显示编码为 1 和 3 的选项。

<!-- example: see examples[] -->

## 禁用状态

选择器不可用状态。为 `GvSelect` 设置 `disabled` 属性即可。

<!-- example: see examples[] -->

## 可清空单选

设置 `clearable` 属性即可使选择器清空。

<!-- example: see examples[] -->

## 基础多选

多选时，将 `multiple` 属性设为 `true` 即可。`v-model` 绑定值为数组。

<!-- example: see examples[] -->

## 自定义模板

`GvSelect` 内置选项模板，默认同时展示 label 与 value 编码。

<!-- example: see examples[] -->

## 字典选项

使用 `e#` 前缀定义本地枚举字典，例如 `e#shanghai=上海:beijing=北京`。

<!-- example: see examples[] -->

## 可搜索

`GvSelect` 默认开启 `filterable`，可直接在下拉框中搜索字典项。

<!-- example: see examples[] -->

## 远程搜索

`dic-type` 以 `t#` 开头时启用远程字典，需配合 `dicRemote` 方法返回 `{ datas: JSON字符串 }`。

<!-- example: see examples[] -->

## 尺寸

可通过 `size` 属性指定选择器尺寸，可选值：`large` / `default` / `small`。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value / v-model | 选中项绑定值 | `string` / `array` / `object` | — |
| dic-type | **必填**，字典类型 | `string` | — |
| filtercode | 过滤字典项的正则表达式 | `string` | — |
| multiple | 是否多选 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `true` |
| filterable | 是否可搜索 | `boolean` | `true` |
| collapse-tags | 多选时折叠标签 | `boolean` | `false` |
| placeholder | 占位符 | `string` | — |
| size | 尺寸 | `'large'` / `'default'` / `'small'` | — |
| dic-remote | 远程字典加载方法（`t#` 类型时使用） | `Function` | — |
| cb | 值变更回调 | `Function` | — |
| clear | 清空回调 | `Function` | — |

### dicType 格式

| 前缀 | 说明 | 示例 |
| --- | --- | --- |
| `e#` | 本地枚举 | `e#1=选项一:2=选项二` |
| `t#` | 远程表格字典 | `t#demo` + `dicRemote` |
| 其他 | 从应用字典缓存加载 | `status`、`company` 等 |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| change | 选中值变化 | `(value: any) => void` |
| clear | 点击清空 | `() => void` |
| focus | 获得焦点 | `(event: FocusEvent) => void` |
| update:modelValue | v-model 更新 | `(value: any) => void` |

### Exposes

无

## 类型定义

```typescript
/** GvSelect Props */
interface GvSelectProps {
  modelValue?: string | string[] | object
  dicType: string
  filtercode?: string
  multiple?: boolean
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  collapseTags?: boolean
  placeholder?: string
  size?: 'large' | 'default' | 'small'
  dicRemote?: (dicType: string, query: string, editRow?: object) => Promise<{ datas: string }>
}
```

## 示例源码（已内嵌，无需 press）

### SelectBasic

```vue
<template>
  <GvSelect v-model="value" dic-type="e#1=选项一:2=选项二:3=选项三" :placeholder="t('selectPlaceholder')" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/hook/web/useI18n'

const { t } = useI18n('demo')
const value = ref('')
</script>

```

### SelectClearable

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    clearable
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE } from './demo-dic'

const value = ref('')
</script>

```

### SelectCustomTemplate

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE_FOOD"
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE_FOOD } from './demo-dic'

const value = ref('')
</script>

```

### SelectDisabled

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    disabled
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE } from './demo-dic'

const value = ref('')
</script>

```

### SelectDisabledOption

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    filtercode="1|3"
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE } from './demo-dic'

const value = ref('')
</script>

```

### SelectFilterable

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    filterable
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE } from './demo-dic'

const value = ref('')
</script>

```

### SelectGroup

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE_CITY"
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE_CITY } from './demo-dic'

const value = ref('')
</script>

```

### SelectMultiple

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    multiple
    placeholder="请选择"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DEMO_DIC_TYPE } from './demo-dic'

const value = ref<string[]>([])
</script>

```

### SelectRemote

```vue
<template>
  <GvSelect
    v-model="value"
    dic-type="t#demo"
    :dic-remote="dicRemote"
    placeholder="请输入关键词"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')

async function dicRemote(_dicType: string, query: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!query) {
    return { datas: '[]' }
  }

  return {
    datas: JSON.stringify([
      { c: query, t: `${query} - 结果1` },
      { c: `${query}-2`, t: `${query} - 结果2` },
    ]),
  }
}
</script>

```

### SelectSize

```vue
<template>
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    size="large"
    placeholder="Large"
  />
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    placeholder="Default"
    style="margin: 12px 0"
  />
  <GvSelect
    v-model="value"
    :dic-type="DEMO_DIC_TYPE"
    size="small"
    placeholder="Small"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DEMO_DIC_TYPE } from './demo-dic';

const value = ref('')
</script>

```
