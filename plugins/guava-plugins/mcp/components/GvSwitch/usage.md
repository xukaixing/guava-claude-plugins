> GvSwitch 开关组件，常用于 GvTable 列 render 中渲染开关控件。

# Switch 开关组件

::: tip
GvSwitch 通常在 GvTable 列的 `render` 函数中使用，用于渲染开关控件。
:::

## 导入

```typescript
import { GvSwitch } from 'guava-ui';
```

## API

### Switch Attributes

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `value` | 绑定值（Boolean / Number / String） | `boolean \| number \| string` | `undefined` |
| `disabled` | 是否禁用 | `boolean` | `undefined` |
| `columnKey` | 列标识（用于表单字段名） | `string` | `undefined` |
| `id` | 原生 input id | `string` | `undefined` |
| `name` | 原生 input name | `string` | `undefined` |
| `target` | 目标值（等于此值时开关为开启状态） | `number \| string` | `'100201'` |

### Switch Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `change` | 状态变化时触发 | `(newStatus: boolean, oldValue: any)` |

## 使用示例

### 在 GvTable 列 render 中使用

参考 `sysMng/deptMng/module/helper.tsx`：

```typescript
import { GvSwitch } from 'guava-ui';

{
  label: '状态',
  prop: 'status',
  render: (scope: Recordable<any>) => (
    <GvSwitch
      value={scope.row.status.c}
      key={scope.column.columnKey}
      onChange={(newValue) => handlers.updateStatus(newValue, scope)}
    />
  ),
}
```

### 基本用法

```vue
<template>
  <GvSwitch
    :value="row.status"
    target="100201"
    @change="handleStatusChange"
  />
</template>

<script setup lang="ts">
import { GvSwitch } from 'guava-ui';

const handleStatusChange = (newStatus: boolean, oldValue: any) => {
  console.log('状态变化:', newStatus);
};
</script>
```

### 带 columnKey（表单集成）

```typescript
<GvSwitch
  value={scope.row.status}
  columnKey="status"
  target="100201"
  onChange={(newValue) => updateStatus(newValue, scope)}
/>
```

### 禁用状态

```typescript
<GvSwitch
  value={scope.row.status}
  disabled={true}
  target="100201"
/>
```

## 关键规则

- `value` 为当前值，`target` 为开启状态对应的值
- 当 `value === target` 时，开关显示为开启状态
- `change` 事件回调：`(newStatus: boolean, oldValue: any)`
- 在 GvTable 中使用时，建议传入 `key={scope.column.columnKey}` 确保响应式更新
- 字典字段（`{ c, v }`）需要取 `.c` 作为 value：`value={scope.row.status.c}`
