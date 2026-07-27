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
| isLength       | 长度校验（汉字计2）     | —    | [0,'isLength',30]       |
| isDouble       | 浮点数校验              | —    | [0,'isDouble',10,2]     |
| isIdcard       | 身份证号校验            | —    | [0,'isIdcard',18]       |
| isCarno        | 车牌号（含新能源）      | —    | [0,'isCarno',10]        |
| isMoney        | 金额（最多两位小数）    | —    | [0,'isMoney',10]        |
| isBigMoney     | 千位符金额              | —    | [0,'isBigMoney',20]     |
| isLetter       | 仅字母                  | —    | [0,'isLetter',30]       |
| isNumber       | 非负整数（含0）         | —    | [0,'isNumber',10]       |
| isNumber0      | 正整数（不以0开头）     | —    | [0,'isNumber0',10]      |
| isNumberLetter | 数字+字母+部分符号      | —    | [0,'isNumberLetter',30] |
| isName         | 名称/姓名               | —    | [0,'isName',60]         |
| isPhone        | 手机号                  | —    | [0,'isPhone',11]        |
| isEmail        | 邮箱                    | —    | [0,'isEmail',30]        |
| isTelephone    | 固定电话（0xx-xxxxxxx） | —    | [0,'isTelephone',13]    |
| isPhoneTel     | 手机号或固定电话        | —    | [0,'isPhoneTel',30]     |
| isIp           | IP 地址                 | —    | [0,'isIp',30]           |
| isUrl          | URL                     | —    | [0,'isUrl',30]          |
| isVin          | VIN / 底盘号（8或17位） | —    | [0,'isVin',17]          |

> **注**：`isDouble` 第 4 位为小数位数，如 `[0,'isDouble',10,4]` 表示最多 4 位小数。
> `isMoney` 的 `maxlength` 控制整数位最大长度（实际整数位 = maxlength - 3）。

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
    format: [0, 'isLength', 30],
    label: '长度校验',
    field: 'validate01'
  },
  {
    type: 'text',
    format: [0, 'isDouble', 10, 2],
    label: '浮点数',
    field: 'validate02'
  },
  {
    type: 'text',
    format: [0, 'isIdcard', 18],
    label: '身份证号',
    field: 'validate03'
  },
  {
    type: 'text',
    format: [0, 'isCarno', 10],
    label: '车牌号',
    field: 'validate04'
  },
  {
    type: 'text',
    format: [0, 'isMoney', 10],
    label: '金额',
    field: 'validate05'
  },
  {
    type: 'text',
    format: [0, 'isBigMoney', 20],
    label: '千位符金额',
    field: 'validate06'
  },
  {
    type: 'text',
    format: [0, 'isLetter', 30],
    label: '字母',
    field: 'validate07'
  },
  {
    type: 'text',
    format: [0, 'isNumber', 10],
    label: '非负整数',
    field: 'validate08'
  },
  {
    type: 'text',
    format: [0, 'isNumber0', 10],
    label: '正整数',
    field: 'validate09'
  },
  {
    type: 'text',
    format: [0, 'isNumberLetter', 30],
    label: '数字+字母',
    field: 'validate10'
  },
  {
    type: 'text',
    format: [0, 'isName', 60],
    label: '名称/姓名',
    field: 'validate11'
  },
  {
    type: 'text',
    format: [0, 'isPhone', 11],
    label: '手机号',
    field: 'validate12'
  },
  {
    type: 'text',
    format: [0, 'isEmail', 30],
    label: '邮箱',
    field: 'validate13'
  },
  {
    type: 'text',
    format: [0, 'isTelephone', 13],
    label: '固定电话',
    field: 'validate14'
  },
  {
    type: 'text',
    format: [0, 'isPhoneTel', 30],
    label: '手机或固话',
    field: 'validate15'
  },
  {
    type: 'text',
    format: [0, 'isIp', 30],
    label: 'IP地址',
    field: 'validate16'
  },
  {
    type: 'text',
    format: [0, 'isUrl', 30],
    label: 'URL',
    field: 'validate17'
  },
  {
    type: 'text',
    format: [0, 'isVin', 17],
    label: '底盘号',
    field: 'validate18'
  }
])
</script>

```
