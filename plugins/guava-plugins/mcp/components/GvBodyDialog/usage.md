> BodyDialog 组件对应 `GvBodyDialog`。下方示例可直接交互，点击「显示代码」查看源码。

# BodyDialog 对话框

::: tip
BodyDialog 组件对应 `GvBodyDialog`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名     | 说明                   | 类型      | 默认值  |
| ---------- | ---------------------- | --------- | ------- |
| visible    | 设置是否可见           | `boolean` | `true`  |
| title      | 设置对话框标题         | `string`  | `标题`  |
| width      | 设置对话框宽度         | `string`  | `75%`   |
| height     | 设置对话框高度         | `string`  | 一      |
| nest       | 设置是否开启嵌套对话框 | `boolean` | `false` |
| fullscreen | 设置是否开启全屏屏显示 | `boolean` | `true`  |

### Events

| 事件名 | 说明                   | 类型         |
| ------ | ---------------------- | ------------ |
| close  | 关闭窗口响应方法       | `() => void` |
| closed | 窗口动画关闭后响应方法 | `() => void` |
| open   | 打开窗口响应方法       | `() => void` |
| opened | 窗口动画打开后响应方法 | `() => void` |

## 示例源码（已内嵌，无需 press）

### BodyDialog

```vue
<template>
  <div>
    <GvButton @click="dialogVisible = !dialogVisible">打开BodyDialog对话框</GvButton>
    <GvBodyDialog
      :title="t('dialogTitle')"
      v-model:visible="dialogVisible"
      :fullscreen="false"
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
    </GvBodyDialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/hook/web/useI18n'
import { ref } from 'vue'

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
