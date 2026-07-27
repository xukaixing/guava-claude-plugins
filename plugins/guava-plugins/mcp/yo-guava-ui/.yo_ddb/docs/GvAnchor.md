> Anchor 组件对应 `GvAnchor`，下方示例可直接交互，点击「显示代码」查看源码。

# Anchor 锚点

锚点组件，用于跳转到页面的指定位置。

::: tip
Anchor 组件对应 `GvAnchor`，下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名     | 说明             | 类型                | 默认值 |
| ---------- | ---------------- | ------------------- | ------ |
| labels     | 设置锚点         | `array`             | —      |
| activeId   | 当前激活的锚点ID | `string`            | ''     |
| labelWidth | 锚点标签宽度     | `string` / `number` | '80'   |
| maxHeight  | 最大高度         | `string` / `number` | —      |

## 示例源码（已内嵌，无需 press）

### AnchorBasic

```vue
<template>
  <div>
    <GvAnchor :labels="anchors" maxHeight="300px">
      <div id="row-01" class="line">
        <GvForm ref="userEditFm" ref-form="userEditFm" divider="基础信息" :form-list="userEditList" />
      </div>
      <div id="row-02" class="line">
        <GvForm ref="userEditFm" ref-form="userEditFm" divider="登录信息" :form-list="userEditList" />
      </div>
      <div id="row-03" class="line">
        <GvForm ref="userEditFm" ref-form="userEditFm" divider="操作信息" :form-list="userEditList" />
      </div>
    </GvAnchor>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue';

const anchors = ref([
  { label: '基础信息', id: 'row-01' },
  { label: '登录信息', id: 'row-02' },
  { label: '操作信息', id: 'row-03' }
]) 

const userEditList = ref<Record<string, any>>([
  {
    type: 'text',
    format: [1, 'is_any', 20],
    label: 'id',
    field: 'id',
    hidden: true
  },
  {
    type: 'text',
    format: [1, 'is_any', 30],
    label: '用户账号',
    field: 'account',
    disabled: true
  },
  {
    type: 'text',
    format: [1, 'is_any', 30],
    label: '用户姓名',
    field: 'userName'
  },
  {
    type: 'date',
    format: [0, 'isDate', 30],
    label: '出生日期',
    field: 'birthDate'
  },
  {
    type: 'text',
    format: [0, 'isEmail', 100],
    label: '邮件地址',
    field: 'email'
  },
  {
    type: 'text',
    format: [0, 'isAny', 100],
    label: '备注',
    field: 'remark',
    colspan: 3
  },
  {
    type: 'text',
    format: [0, 'isAny', 100],
    label: '备注',
    field: 'remark',
    colspan: 3
  },
  {
    type: 'text',
    format: [0, 'isAny', 100],
    label: '备注',
    field: 'remark',
    colspan: 3
  },
  {
    type: 'text',
    format: [0, 'isAny', 100],
    label: '备注',
    field: 'remark',
    colspan: 3
  },
  {
    type: 'text',
    format: [0, 'isAny', 100],
    label: '备注',
    field: 'remark',
    colspan: 3
  },
]) 
</script>

<style scoped>
:deep(.gv-divider) {
  height: auto !important;
}
</style>

```
