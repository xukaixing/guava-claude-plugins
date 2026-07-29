> CheckboxButton 组件对应 `GvCheckboxButton`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。

# CheckboxButton 复选框

按钮样式的多选组合。

::: tip
CheckboxButton 组件对应 `GvCheckboxButton`，支持 `v-model` 双向绑定。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

基本都是 `GvCheckboxGroup` 组件的子组件，支持 `v-model` 双向绑定，不独立使用。 参考 [GvCheckboxGroup 组件](/guava-api/frontend/components/checkboxgroup)。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名   | 说明                                              | 类型                                          | 默认值    |
| -------- | ------------------------------------------------- | --------------------------------------------- | --------- |
| value    | 选中状态的值，只有在绑定对象类型为 array 时有效。 | `string` \| `number` \| `boolean` \| `object` | —         |
| vref     | 设置checkboxButton的ref属性                       | `string`                                      | —         |
| name     | 原生 name 属性                                    | `string`                                      | —         |
| visible  | 是否可见                                          | `boolean`                                     | `true`    |
| label    | 标签文本                                          | `string`                                      | —         |
| disabled | 是否禁用                                          | `boolean`                                     | `false`   |
| size     | 大小                                              | `string`                                      | `default` |

## 类型定义

```typescript
// CheckboxButton 尺寸
type CheckboxButtonSize = 'large' | 'default' | 'small';
```

## 示例源码（已内嵌，无需 press）

### CheckboxButtonBasic

```vue
<template>
  <div>
    <GvCheckboxGroup v-model="checkboxGroup1" size="large">
      <GvCheckboxButton v-for="option in options" :key="option" :value="option">
        {{ option }}
      </GvCheckboxButton>
    </GvCheckboxGroup>
  </div>
  <div class="demo-button-style">
    <GvCheckboxGroup v-model="checkboxGroup2">
      <GvCheckboxButton v-for="option in options" :key="option" :value="option">
        {{ option }}
      </GvCheckboxButton>
    </GvCheckboxGroup>
  </div>
  <div class="demo-button-style">
    <GvCheckboxGroup v-model="checkboxGroup3" size="small">
      <GvCheckboxButton
        v-for="option in options"
        :key="option"
        :value="option"
        :disabled="option === 'Option D'"
      >
        {{ option }}
      </GvCheckboxButton>
    </GvCheckboxGroup>
  </div>
  <div class="demo-button-style">
    <GvCheckboxGroup v-model="checkboxGroup4" size="small" disabled>
      <GvCheckboxButton v-for="option in options" :key="option" :value="option">
        {{ option }}
      </GvCheckboxButton>
    </GvCheckboxGroup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const checkboxGroup1 = ref(['Option A'])
const checkboxGroup2 = ref(['Option A'])
const checkboxGroup3 = ref(['Option A'])
const checkboxGroup4 = ref(['Option A'])
const options = ['Option A', 'Option B', 'Option C', 'Option D']
</script>

<style scoped>
.demo-button-style {
  margin-top: 24px;
}
</style>
```
