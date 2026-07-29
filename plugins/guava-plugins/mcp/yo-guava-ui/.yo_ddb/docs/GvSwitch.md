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
| `value` | 绑定值（Boolean / Number / String） | `boolean \| number \| string` | — |
| `target` | 目标值（等于此值时开关开启） | `number \| string` | `'100201'` |
| `key` | 列标识（render 中响应式更新） | `string` | — |
| `disabled` | 禁用（**仅需要时添加**） | `boolean` | 不生成 |
| `columnKey` | 表单字段名（**仅表单集成时添加**） | `string` | 不生成 |
| `id` | 原生 input id | `string` | 不生成 |
| `name` | 原生 input name | `string` | 不生成 |

### Switch Events

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `change` | 状态变化时触发 | `(newStatus: boolean, oldValue: any)` |

## 使用示例

### 在 GvTable 列 render 中使用（推荐）

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
      target="100201"
      onChange={(newValue) => handlers.updateStatus(newValue, scope)}
    />
  ),
}
```

> **注意**：默认只生成 `value` + `key` + `target` + `onChange`，**不生成** `disabled`。

### 基本用法

```vue
<template>
  <GvSwitch :value="row.status" target="100201" @change="handleChange" />
</template>

<script setup lang="ts">
import { GvSwitch } from 'guava-ui';
const handleChange = (newStatus: boolean, oldValue: any) => { console.log(newStatus); };
</script>
```

### 需要禁用时

```typescript
<GvSwitch value={scope.row.status} disabled={true} target="100201" />
```

## 关键规则

- **默认只生成**：`value` + `key` + `target` + `onChange`
- **不生成** `disabled`（仅配置明确需要时添加）
- `value === target` 时开关开启
- 字典字段取 `.c`：`value={scope.row.status.c}`
