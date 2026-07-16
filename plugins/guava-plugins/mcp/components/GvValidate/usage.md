> 下方示例可直接交互，点击「显示代码」查看源码。

# Validate 校验组件

校验组件，用于校验表单数据是否符合要求。

::: tip
下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

基础的、简洁的校验组件。

<!-- example: see examples[] -->

## API

### Validate Rules

| 方法名         | 说明                    | 类型 | 示例                    |
| -------------- | ----------------------- | ---- | ----------------------- |
| isAny          | 无校验规则              | —    | [0,'isAny',30]          |
| isUrl          | 校验url规则             | —    | [0,'isUrl',30]          |
| isName         | 校验名称/姓名规则       | —    | [0,'isName',30]         |
| isEmail        | 校验email规则           | —    | [0,'isEmail',30]        |
| isPhone        | 校验手机号规则          | —    | [0,'isPhone',11]        |
| isPhoneTel     | 校验手机或固化规则      | —    | [0,'isPhoneTel',30]     |
| isIp           | 校验IP地址规则          | —    | [0,'isIp',30]           |
| isIdcard       | 校验身份证号规则        | —    | [0,'isIdcard',18]       |
| isMoney        | 校验金额规则            | —    | [0,'isMoney',10]        |
| isBigMoney     | 校验千位符金额规则      | —    | [0,'isBigMoney',20]     |
| isNumber       | 校验数字格式规则        | —    | [0,'isNumber',10]       |
| isNumber0      | 校验非0开头数字规则     | —    | [0,'isNumber0',10]      |
| isLetter       | 校验全是字母格式规则    | —    | [0,'isLetter',30]       |
| isNumberLetter | 校验全是数字 + 字母规则 | —    | [0,'isNumberLetter',30] |
| isDouble       | 校验符点数规则          | —    | [0,'isDouble',10]       |
| isCarno        | 校验车牌号规则          | —    | [0,'isCarno',10]        |
| isVin          | 校验vin格式规则         | —    | [0,'isVin',17]          |

## 示例源码（已内嵌，无需 press）

### ValidateBasic

```vue
<template>
  <GvForm ref-form="formList" divider="form表单" :form-list="formList" :form-style="{width:'800px'}" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const formList = ref([
  {
      type: 'text',
      format: [0, 'isAny', 10],
      label: '无校验',
      field: 'validate00'
    },
    {
      type: 'text',
      format: [0, 'isUrl', 30],
      label: 'url',
      field: 'validate02'
    },
    {
      type: 'text',
      format: [0, 'isName', 30],
      label: '名称/姓名',
      field: 'validate01'
    },
    {
      type: 'text',
      format: [0, 'isEmail', 30],
      label: 'email',
      field: 'validate04'
    },
    {
      type: 'text',
      format: [0, 'isPhone', 11],
      label: '手机',
      field: 'validate05'
    },
    {
      type: 'text',
      format: [0, 'isPhoneTel', 30],
      label: '手机或固话',
      field: 'validate06'
    },
    {
      type: 'text',
      format: [0, 'isIp', 30],
      label: 'IP地址',
      field: 'validate07'
    },
    {
      type: 'text',
      format: [0, 'isIdcard', 18],
      label: '身份证号',
      field: 'validate08'
    },
    {
      type: 'text',
      format: [0, 'isMoney', 10],
      label: '金额/价格',
      field: 'validate09'
    },
    {
      type: 'text',
      format: [0, 'isBigMoney', 10],
      label: '千位符金额',
      field: 'validate10'
    },
    {
      type: 'text',
      format: [0, 'isNumber', 10],
      label: '数字',
      field: 'validate11'
    },
    {
      type: 'text',
      format: [0, 'isNumber0', 10],
      label: '数字非0头',
      field: 'validate11-1'
    },
    {
      type: 'text',
      format: [0, 'isLetter', 30],
      label: '字母',
      field: 'validate03'
    },
    {
      type: 'text',
      format: [0, 'isNumberLetter', 10],
      label: '数字和字母',
      field: 'validate12'
    },
    {
      type: 'text',
      format: [0, 'isDouble', 10],
      label: '浮点数',
      field: 'validate13'
    },
    {
      type: 'text',
      format: [0, 'isCarno', 10],
      label: '车牌号',
      field: 'validate14'
    },
    {
      type: 'text',
      format: [0, 'isVin', 17],
      label: '底盘号',
      field: 'validate15'
    }
])
</script>

```
