> Popover 组件对应 `GvPopover`。下方示例可直接交互，点击「显示代码」查看源码。

# Popover 弹出框

::: tip
Popover 组件对应 `GvPopover`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名    | 说明                    | 类型     | 默认值         |
| --------- | ----------------------- | -------- | -------------- |
| title     | 设置触发显示标题        | `string` | —              |
| label     | 设置Popover标题         | `string` | —              |
| placement | 设置Popover显示位置     | `string` | `bottom-start` |
| trigger   | 设置触发显示Popover方式 | `string` | `click`        |

### Events

| 事件名 | 说明              | 类型         |
| ------ | ----------------- | ------------ |
| show   | 显示Popover时触发 | `() => void` |
| hide   | 隐藏Popover时触发 | `() => void` |

## 定义类型

```typescript
// placement 类型
type PlacementType = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';

// trigger 类型
type TriggerType = 'click' | 'focus' | 'hover' | 'contextmenu';

// GvPopover props
interface PopoverProps {
  title?: string;
  label?: string;
  placement?: string;
  trigger?: string;
}
```

## 示例源码（已内嵌，无需 press）

### PopoverBasic

```vue
<template>
  <GvPopover
    trigger="hover"
    label="显示Popover"
    title="Popover标题"
    @show="handleShow"
    @hide="handleHide"
  >
    <div>Popover内容</div>
  </GvPopover>
</template>

<script setup lang="ts">
// @method
/**
 * @todo: 显示Popover触发事件
 * @author: bugcao@163.com
 * @Date: 2026-06-25 14:29:42
*/
const handleHide = () => {
  // console.log('hide')
}
/**
 * @todo: 隐藏Popover触发事件
 * @author: bugcao@163.com
 * @Date: 2026-06-25 14:29:42
*/
const handleShow = () => {
  // console.log('show')
}
</script>
```
