> Card 组件对应 `GvCard`。下方示例可直接交互，点击「显示代码」查看源码。

# Card 卡片

::: tip
Card 组件对应 `GvCard`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基本用法

<!-- example: see examples[] -->

## API

### Attributes

| 属性名 | 说明         | 类型     | 默认值   |
| ------ | ------------ | -------- | -------- |
| header | 设置卡片标题 | `string` | ''       |
| shadow | 设置卡片阴影 | `string` | `always` |
| footer | 设置卡片页脚 | `string` | ''       |

## 类型定义

```typescript
// shadow 类型
type CardShadowType = 'always' | 'hover' | 'never';
```

## 示例源码（已内嵌，无需 press）

### CardBasic

```vue
<template>
  <GvRow :gutter="20">
    <GvCol :xs="24" :sm="24" :md="6" :lg="6" :xl="5">
      <GvCard header="个人信息" shadow="never" style="height:320px;">
        <template #default>
          <p>卡片内容</p>
        </template>
      </GvCard>
    </GvCol>
    <GvCol :xs="24" :sm="24" :md="16" :lg="18" :xl="19">
      <GvCard style="height:320px;">
        <template #header>
          <span>其他信息</span>
        </template>
        <template #default>
          <p>卡片内容</p>
        </template>
      </GvCard>
    </GvCol>
  </GvRow>
</template>

<script setup lang="ts">
</script>

<style scoped>
  :deep(.gv-dialog-modal){
    z-index:99 !important;
  }
</style>

```
