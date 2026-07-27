> 下方示例可直接交互，点击「显示代码」查看源码。

# Cascader 级联选择器

级联选择器组件，用于选择多个层级的选项。

::: tip
下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## 示例源码（已内嵌，无需 press）

### CascaderBasic

```vue
<template>
  <div>
    <GvForm ref-form="dictForm" :form-list="dictFormList" divider="级联字典组件" :form-style="{width:'800px'}" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const dictFormList = ref([
  {
    type: 'layer',
    format: [0, 'isAny', 30],
    label: '级联',
    options: '',
    field: 'xzqh4',
  },
])
dictFormList.value[0].options = [
  {
    value: 'f1',
    label: '一级1',
    children: [
      {
        value: 's1',
        label: '二级1',
        children: [
          {
            value: 't1',
            label: '三级1'
          }, {
            value: 't2',
            label: '三级2'
          }
        ]
      },
      {
        value: 's2',
        label: '二级',
        children: [
          {
            value: 't22',
            label: '三级22'
          }, {
            value: 't23',
            label: '三级23'
          }
        ]
      }
    ]
  },
  {
    value: 'f2',
    label: '一级2',
    children: [{
      value: 's3',
      label: '二级3'
    }, {
      value: 't33',
      label: '三级33'
    }, {
      value: 't34',
      label: '三级44'
    }]
  }
]
</script>

<style scoped>
:deep(.gv-divider){
  height: auto !important;
}
</style>
```
