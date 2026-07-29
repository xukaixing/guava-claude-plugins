> SearchBar 组件对应 `GvSearchBar`。通常与`GvForm`组件结合使用，下方示例可直接交互，点击「显示代码」查看源码。

# SearchBar 搜索栏

搜索栏组件用于在列表中进行搜索。

::: tip
SearchBar 组件对应 `GvSearchBar`。通常与`GvForm`组件结合使用，下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## API

### Form Attributes

| 属性名 | 说明           | 类型      | 默认值 |
| ------ | -------------- | --------- | ------ |
| expand | 是否展开搜索栏 | `boolean` | true   |

## 示例源码（已内嵌，无需 press）

### SearchBarBasic

```vue
<template>
  <GvForm
    ref="formRef"
    ref-form="formRef"
    :divider="t('searchBar.searchFilter')"
    :form-list="formList"
    :form-style="{ width: '800px' }"
  >
    <GvSearchBar :expand="true">
      <GvButton @click="searchUserList">{{ t('search') }}</GvButton>
      <GvButton @click="resetForm">{{ t('reset') }}</GvButton>
    </GvSearchBar>
  </GvForm>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from '@/hook/web/useI18n'

const { t } = useI18n('searchBar')
const { t: td } = useI18n('demo')

const formRef = ref<FormInstance>(null)
const formList = computed(() => [
  {
    type: 'text',
    format: [0, 'isNumberLetter', 30],
    label: td('userAccount'),
    field: 'account',
  },
  {
    type: 'text',
    format: [0, 'isAny', 60],
    label: td('userName'),
    field: 'u@userName',
  },
])

const searchUserList = () => {}
const resetForm = () => formRef.value?.resetFields?.()
</script>

<style scoped>
:deep(.gv-search-bar) {
  text-align: right !important;
}
</style>

```
