> Form 组件对应 `GvForm`。下方示例可直接交互，点击「显示代码」查看源码。

# Form 表单

::: tip
Form 组件对应 `GvForm`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## API

### Form Attributes

| 属性名      | 说明                        | 类型              | 默认值     |
| ----------- | --------------------------- | ----------------- | ---------- |
| ref-form    | 设置form的ref属性           | `string`          | —          |
| form-list   | 设置form的表单域list        | `array`           | —          |
| divider     | 设置form的分栏标题          | `string`          | `检索分栏` |
| is-divider  | 设置是否默认自带分栏        | `boolean`         | true       |
| size        | 设置form大小                | `string`          | `default`  |
| form-style  | 设置form风格样式            | `object`          | `{}`       |
| label-width | 设置label宽度(不带px的数字) | `number`/`string` | -          |
| scroller    | 设置是否开启滚动条          | `boolean`         | true       |

### Form Slots

| 插槽名  | 说明                                                         |
| ------- | ------------------------------------------------------------ |
| default | 设置form默认插槽，对于查询表单，插槽为 `<GvSearchBar/>` 按钮 |

### Form Exposes

| 名称           | 说明              | 类型         |
| -------------- | ----------------- | ------------ |
| model          | 表单数据          | `object`     |
| originFormList | 原始表单域list    | `array`      |
| setFormRef     | 设置form的ref属性 | `() => void` |

### Form-Item Attributes

| 参数             | 说明                                                         | 类型                | 可选值                                                        | 默认值             |
| ---------------- | ------------------------------------------------------------ | ------------------- | ------------------------------------------------------------- | ------------------ |
| type             | 设置表单域的 type 属性                                       | `string`            | —                                                             | —                  |
| label            | 设置表单域的 label 属性                                      | `string`            | —                                                             | —                  |
| value            | 设置表单域的 value 属性                                      | `any`               | —                                                             | —                  |
| field            | 设置表单域的 field 字段属性                                  | `string`            | —                                                             | —                  |
| hidden           | 设置表单域是否隐藏                                           | `boolean`           | `true` / `false`                                              | `false`            |
| keep             | 设置表单域是否保持值在提交时不变                             | `boolean`           | `true` / `false`                                              | `true`             |
| format           | 设置表单域的 format 格式属性                                 | `array`             | —                                                             | `[0, 'isAny', 30]` |
| disabled         | 设置表单域的 disabled 属性                                   | `boolean`           | `true` / `false`                                              | `false`            |
| readonly         | 设置表单域的只读属性                                         | `boolean`           | `true` / `false`                                              | `false`            |
| placeholder      | 设置表单域的 placeholder 属性                                | `string`            | —                                                             | —                  |
| dateType         | 设置表单域日期类型属性                                       | `string`            | `date` / `datetime` / `daterange` / `year` / `month` / `week` | `date`             |
| dicType          | 设置表单域字典类型的字典类别                                 | `string`            | —                                                             | —                  |
| filtercode       | 设置表单域字典类型的过滤值属性（按 value 过滤）              | `string`            | —                                                             | —                  |
| colspan          | 设置表单域 colspan 占用列属性                                | `number`            | `1` / `2` / `3` / `4`                                         | —                  |
| disabledDateFunc | 设置表单域日期类型的禁用日期                                 | `array`             | —                                                             | —                  |
| disabledDate     | 设置表单域日期类型的禁用状态，参数为当前日期，返回 `boolean` | `Function`          | —                                                             | —                  |
| editable         | 设置表单域日期类型输入框是否可编辑                           | `boolean`           | `true` / `false`                                              | `true`             |
| multiple         | 设置表单域字典类型是否可多选                                 | `boolean`           | `true` / `false`                                              | `false`            |
| showLabel        | 设置表单域字典类型的显示 label                               | `string`            | —                                                             | —                  |
| size             | 设置表单域 size 属性                                         | `string`            | `medium` / `small` / `mini`                                   | —                  |
| visible          | 设置表单域是否可见                                           | `boolean`           | `true` / `false`                                              | `true`             |
| action           | 一                                                           | `string`            | 一                                                            | 一                 |
| op               | 设置查询条件是否恒等                                         | `string`            | `=` / `like`                                                  | `like`             |
| upper            | 设置当前查询条件转换为大写传给后台                           | `boolean`           | `true` / `false`                                              | `false`            |
| createRow        | 设置是否创建新row,                                           | `boolean`           | `true` / `false`                                              | `false`            |
| dicRemote        | 设置表单域表选字典远程方法                                   | `Function`          | —                                                             | —                  |
| cb               | 设置表单域字典类型选中的回调方法                             | `Function`          | —                                                             | —                  |
| clear            | 设置表单域字典类型清空的回调方法                             | `Function`          | —                                                             | —                  |
| rows             | 设置表单域 textarea 的 rows 属性                             | `number`            | —                                                             | —                  |
| autosize         | 设置表单域 textarea 自适应内容高度                           | `boolean \| object` | —                                                             | `false`            |
| min              | 设置 number 类型输入框的最小值                               | `number`            | —                                                             | —                  |
| max              | 设置 number 类型输入框的最大值                               | `number`            | —                                                             | —                  |
| step             | 设置 number 类型输入框的步长                                 | `number`            | —                                                             | `1`                |
| precision        | 设置 number 类型输入框的精度                                 | `number`            | —                                                             | `0`                |
| blur             | 设置表单域失去焦点的回调方法                                 | `Function`          | —                                                             | —                  |
| focus            | 设置表单域获取焦点的回调方法                                 | `Function`          | —                                                             | —                  |
| suffixIcon       | 设置表单域后缀图标属性                                       | `string`            | —                                                             | —                  |
| prefixIcon       | 设置表单域前缀图标属性                                       | `string`            | —                                                             | —                  |
| change           | 设置表单域改变的回调方法                                     | `Function`          | —                                                             | —                  |
| defaultTime      | 设置时间输入框默认能够选择的时间                             | `array`             | —                                                             | —                  |
| isreload         | 设置表选字典是否使用缓存                                     | `boolean`           | `true` / `false`                                              | `false`            |
| options          | 设置级联字典的级联内容                                       | `array`             | —                                                             | —                  |
| lazy             | 设置级联字典cascader是否懒加载                               | `boolean`           | `true` / `false`                                              | `false`            |
| lazyLoad         | 设置级联字典cascader懒加载方法                               | `Function`          | —                                                             | —                  |
| render           | 自定义form样式                                               | `Function`          | —                                                             | —                  |

## 定义类型

```typescript
// GvFormItem Props
interface FormItem {
  type?: string;
  label?: string;
  value?: any;
  field: string;
  hidden?: boolean;
  keep?: boolean;
  disabled?: boolean;
  format?: FormItemFormat;
  placeholder?: string;
  readonly?: boolean;
  dateType?: string;
  dicType?: string;
  filtercode?: string;
  colspan?: number;
  disabledDateFunc?: string[];
  disabledDate?: (data: Date) => boolean;
  editable?: boolean;
  multiple?: boolean;
  showLabel?: string[] | string;
  size?: string;
  visible?: boolean;
  action?: string;
  op?: string;
  upper?: boolean;
  createRow?: boolean;
  dicRemote?: Fn;
  cb?: (row: Recordable<any> | String, field: string, dicType: string) => void;
  clear?: (row: Recordable<any>, field: string, dicType: string) => void;
  rows?: number;
  autosize?: boolean;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  blur?: (event: Event, value: any, field: string) => void;
  suffixIcon?: string;
  prefixIcon?: string;
  focus?: (event: Event, value: any, field: string) => void; /
  change?: (event: Event, value: any, field: string) => void;
  defaultTime?: Date;
  isreload?: boolean;
  options?: any[];
  lazy?: boolean;
  lazyLoad?: () => void;
  render?: (model: any, field: string) => any;
}
```

## 示例源码（已内嵌，无需 press）

### FormBasic

```vue
<template>
  <GvForm
    ref="formRef"
    ref-form="formRef"
    :divider="t('formDivider')"
    :form-list="formList"
    :form-style="{ width: '800px' }"
  />
</template>

<script lang="ts" setup>
import { useI18n } from '@/hook/web/useI18n';
import { computed } from 'vue';

const { t } = useI18n('demo')

const formList = computed(() => [
  {
    type: 'text',
    format: [1, 'is_any', 5],
    label: t('name'),
    hidden: false,
    field: 'demoName',
    placeholder: 'name',
    value: 'admin',
    colspan: 1,
  },
  {
    type: 'date',
    format: [0, 'isDate', 10],
    dateType: 'date',
    label: t('standardDate'),
    hidden: false,
    field: 'demoDate',
  },
  {
    type: 'text',
    format: [0, 'isAny', 10],
    label: t('disabled'),
    disabled: true,
    field: 'disabledField',
  },
  {
    type: 'text',
    format: [0, 'isAny', 10],
    label: t('readonly'),
    readonly: true,
    field: 'readonlyField',
  },
  {
    type: 'textarea',
    format: [0, 'isAny', 10],
    label: t('textarea'),
    rows: 2,
    field: 'textareaField',
    colspan: 2,
  },
  // {
  //   type: 'dic',
  //   format: [0, 'isDic', 10],
  //   dicType: 'E#100601=开启:10602=关闭',
  //   label: '状态',
  //   field: 'status'
  // },
])
</script>

<style scoped>
:deep(.gv-datepicker) {
  width: 100% !important;
}
:deep(.gv-divider){
  height: auto !important;
}
</style>

```
