> Dialog 组件对应 `GvDialog`。下方示例可直接交互，点击「显示代码」查看源码。

# Dialog 对话框

::: tip
Dialog 组件对应 `GvDialog`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名             | 说明                           | 类型      | 默认值  |
| ------------------ | ------------------------------ | --------- | ------- |
| visible            | 设置是否可见                   | `boolean` | `true`  |
| title              | 设置对话框标题                 | `string`  | `标题`  |
| width              | 设置对话框宽度                 | `string`  | `75%`   |
| height             | 设置对话框高度                 | `string`  | 一      |
| nest               | 设置是否开启嵌套对话框         | `boolean` | `false` |
| append-to-body     | 设置是否将对话框挂载到body上   | `boolean` | `false` |
| has-footer         | 设置是否显示footer             | `boolean` | true    |
| fullscreen         | 设置是否开启全屏屏显示         | `boolean` | false   |
| max-height         | 设置最大高度                   | `string`  | 一      |
| closeOnClickModal  | 设置是否点击关闭按钮关闭对话框 | `boolean` | false   |
| closeOnPressEscape | 设置是否按下esc键关闭对话框    | `boolean` | true    |

### Events

| 事件名 | 说明                   | 类型         |
| ------ | ---------------------- | ------------ |
| close  | 关闭窗口响应方法       | `() => void` |
| closed | 窗口动画关闭后响应方法 | `() => void` |
| open   | 打开窗口响应方法       | `() => void` |
| opened | 窗口动画打开后响应方法 | `() => void` |

## 示例源码（已内嵌，无需 press）

### Dialog

```vue
<template>
  <div>
    <GvButton @click="dialogVisible = !dialogVisible">{{ t('openDialog') }}</GvButton>
    <GvDialog
      :title="t('dialogTitle')"
      :hasFooter="true"
      v-model:visible="dialogVisible"
      width="30%"
    >
      <div>
        <p>{{ t('dialogContent1') }}</p>
        <p>1. {{ t('dialogContent2') }}</p>
        <p>2. {{ t('dialogContent3') }}</p>
        <p>3. {{ t('dialogContent4') }}</p>
      </div>
      <template #footer>
        <GvButton type="primary" @click="dialogVisible = false">
          {{ tc('confirm') }}
        </GvButton>
      </template>
    </GvDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/hook/web/useI18n'

const { t } = useI18n('demo')
const { t: tc } = useI18n('dialogBar')

const dialogVisible = ref(false)
</script>

<style scoped>
:deep(.gv-dialog-modal) {
  z-index: 99 !important;
}
</style>

```
