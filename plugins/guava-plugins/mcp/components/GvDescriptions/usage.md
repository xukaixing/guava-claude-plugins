> Descriptions 组件对应 `GvDescriptions`。用于只读详情展示，配合 `item-head` 配置与 `item-data` 数据源。

# Descriptions 描述列表

::: tip
Descriptions 组件对应 `GvDescriptions`。用于只读详情展示，配合 `item-head` 配置与 `item-data` 数据源。
:::

## 基本用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| title | 标题 | `string` | '' |
| border | 是否显示边框 | `boolean` | true |
| size | 尺寸 | `string` | '' |
| column | 列数 | `number` | 3 |
| responsive | 是否响应式 | `boolean` | false |
| direction | 排列方向 | `string` | 'horizontal' |
| labelWidth | 标签宽度 | `string` | '' |
| itemHead | 描述项配置 | `DescItemHead[]` | [] |
| itemData | 数据源 | `object` | {} |

### DescItemHead 配置

| 属性 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| prop | 对应 itemData 中的字段 key | `string` | — |
| label | 标签文本 | `string` | — |
| span | 列占用栅格数 | `number` | 1 |
| labelWidth | 自定义标签宽度 | `string` | '' |
| contentWidth | 自定义内容宽度 | `string` | '' |
| width | 列的宽度 | `string \| number` | — |
| align | 内容对齐方式 | `'left' \| 'center' \| 'right'` | 'left' |
| className | 内容类名 | `string` | '' |
| formatter | 内容格式化函数 `(value, itemData) => string` | `Function` | — |
| render | 自定义渲染 `(value, itemData) => VNode \| string` | `Function` | — |
| dicType | 字典编码，自动转换 `{c,v}` → 文案 | `string` | — |

## 类型定义

```typescript
interface DescItemHead {
  prop: string;
  label: string;
  span?: number;
  labelWidth?: string;
  contentWidth?: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  formatter?: (value: any, itemData: Recordable<any>) => string;
  render?: (value: any, itemData: Recordable<any>) => any;
  dicType?: string;
}
```

## 示例源码（已内嵌，无需 press）

### DescriptionsBasic

```vue
<template>
  <GvDescriptions
    title="用户信息"
    :item-head="itemHead"
    :item-data="itemData"
    :column="3"
    border />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const itemHead = ref([
  { prop: 'account', label: '用户账号' },
  { prop: 'userName', label: '用户姓名' },
  { prop: 'sex', label: '性别', dicType: 'xb' },
  { prop: 'birthDate', label: '出生日期' },
  { prop: 'mobile', label: '联系方式' },
  { prop: 'email', label: '邮箱' },
  { prop: 'status', label: '状态', dicType: 'yxzt' },
  { prop: 'remark', label: '备注', span: 2 },
]);

const itemData = ref({
  account: 'admin',
  userName: '管理员',
  sex: { c: '100302', v: '男' },
  birthDate: '1990-01-01',
  mobile: '13800138000',
  email: 'admin@example.com',
  status: { c: '100201', v: '启用' },
  remark: '系统管理员账号',
});
</script>
```

### DescriptionsInDrawer

```vue
<template>
  <GvDrawer title="用户详情" v-model:visible="visible" size="40%">
    <GvDescriptions
      :item-head="itemHead"
      :item-data="itemData"
      :column="2" />
  </GvDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);

const itemHead = ref([
  { prop: 'account', label: '用户账号' },
  { prop: 'userName', label: '用户姓名' },
  { prop: 'mobile', label: '联系方式' },
  { prop: 'email', label: '邮箱' },
]);

const itemData = ref({
  account: 'admin',
  userName: '管理员',
  mobile: '13800138000',
  email: 'admin@example.com',
});
</script>
```

### DescriptionsWithFormatter

```vue
<template>
  <GvDescriptions
    title="订单信息"
    :item-head="itemHead"
    :item-data="itemData"
    :column="3" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const itemHead = ref([
  { prop: 'orderNo', label: '订单编号' },
  {
    prop: 'amount',
    label: '订单金额',
    formatter: (val) => `¥${Number(val).toLocaleString()}`,
  },
  {
    prop: 'status',
    label: '订单状态',
    render: (val) =>
      `<span style="color: ${val === 1 ? 'green' : 'red'}">${val === 1 ? '已完成' : '待处理'}</span>`,
  },
]);

const itemData = ref({
  orderNo: 'OD202601001',
  amount: 12800,
  status: 1,
});
</script>
```
