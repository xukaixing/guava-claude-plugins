> Tabs 组件对应 `GvTabs`。下方示例可直接交互，点击「显示代码」查看源码。

# Tabs 选项卡

选项卡组件，分隔内容上有关联但属于不同类别的数据集合,用于在多个内容区域之间切换。

::: tip
Tabs 组件对应 `GvTabs`。下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

基础的、简洁的标签页。

GvTabs 组件提供了选项卡功能， 默认选中第一个标签页，也可以通过 value 属性来指定当前选中的标签页。

<!-- example: see examples[] -->

## 卡片风格的标签

卡片选项卡用于展示多个选项卡，每个选项卡都有一个标题和一个内容区域。

<!-- example: see examples[] -->

## 带有边框的卡片风格的标签

边框卡片选项卡用于展示多个选项卡，每个选项卡都有一个标题和一个内容区域。

<!-- example: see examples[] -->

## 标签位置

可以通过 tab-position 设置标签的位置

标签一共有四个方向的设置 tabPosition="left|right|top|bottom", 默认是 `left`。

<!-- example: see examples[] -->

## 动态增减标签页​

增减标签页按钮只能在选项卡样式的标签页下使用。

<!-- example: see examples[] -->

## API

### Attributes

| 属性名      | 说明               | 类型      | 默认值 |
| ----------- | ------------------ | --------- | ------ |
| tabPosition | 设置tab的位置属性  | `string`  | `left` |
| type        | 设置tabs的type属性 | `string`  | -      |
| closable    | 设置是否可关闭     | `boolean` | false  |

### Events

| 事件名    | 说明                            | 类型                                                                      |
| --------- | ------------------------------- | ------------------------------------------------------------------------- |
| tab-click | 点击tab页响应方法               | `(pane: TabsPaneContext, ev: Event) => void`                              |
| edit      | 点击 tab 的新增或移除按钮后触发 | `(paneName: TabPaneName \| undefined, action: 'remove' \| 'add') => void` |

### Exposes

无

## 示例源码（已内嵌，无需 press）

### TabsBasic

```vue
<template>
  <GvTabs>
    <GvTabPane :label="t('query')" name="first">{{ t('queryContent') }}</GvTabPane>
    <GvTabPane :label="t('option2')" name="second">{{ t('option2') }}</GvTabPane>
  </GvTabs>
</template>

<script setup lang="ts">
import { useI18n } from '@/hook/web/useI18n'

const { t } = useI18n('demo')
</script>

```

### TabsCard

```vue
<template>
  <GvTabs v-model="activeName" type="card" :tab-position="tabPosition" @tab-click="handleClick">
    <GvTabPane label="查询" name="first">查询内容</GvTabPane>
    <GvTabPane label="表单" name="second">表单内容</GvTabPane>
    <GvTabPane label="日期" name="third">日期内容</GvTabPane>
    <GvTabPane label="字典" name="fourth">字典内容</GvTabPane>
  </GvTabs>
</template>

<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus'
import { ref } from 'vue'

// @data
const activeName = ref<string>('first')
const tabPosition = ref<string>('left')

// @method
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>
```

### TabsBorderCard

```vue
<template>
  <GvTabs v-model="activeName" type="border-card" :tab-position="tabPosition" @tab-click="handleClick">
    <GvTabPane label="查询" name="first">查询内容</GvTabPane>
    <GvTabPane label="表单" name="second">表单内容</GvTabPane>
    <GvTabPane label="日期" name="third">日期内容</GvTabPane>
    <GvTabPane label="字典" name="fourth">字典内容</GvTabPane>
  </GvTabs>
</template>

<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus'
import { ref } from 'vue'

// @data
const activeName = ref<string>('first')
const tabPosition = ref<string>('left')

// @method
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>
```

### TabsPosition

```vue
<template>
  <GvRadioGroup v-model="tabPosition" style="margin-bottom: 30px">
    <GvRadioButton value="top">top</GvRadioButton>
    <GvRadioButton value="right">right</GvRadioButton>
    <GvRadioButton value="bottom">bottom</GvRadioButton>
    <GvRadioButton value="left">left</GvRadioButton>
  </GvRadioGroup>
  <GvTabs v-model="activeName" :tab-position="tabPosition" @tab-click="handleClick">
    <GvTabPane label="查询" name="first">查询内容</GvTabPane>
    <GvTabPane label="表单" name="second">表单内容</GvTabPane>
    <GvTabPane label="日期" name="third">日期内容</GvTabPane>
    <GvTabPane label="字典" name="fourth">字典内容</GvTabPane>
  </GvTabs>
</template>

<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus'
import { ref } from 'vue'

// @data
const activeName = ref<string>('first')
const tabPosition = ref<string>('top')

// @method
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>
```

### CustomTabs

```vue
<template>
  <div style="margin-bottom: 20px">
    <GvButton type="primary" size="small" @click="addTab(editableTabsValue)">
      add tab
    </GvButton>
  </div>
  <GvTabs v-model="editableTabsValue" tab-position="top" type="card" closable @edit="removeTab">
    <GvTabPane v-for="item in tabsList" :key="item.name" :label="item.title" :name="item.name"/>
  </GvTabs>
</template>

<script lang="ts" setup>
import type { TabPaneName } from 'element-plus'
import { ref } from 'vue'

interface TabItem {
  title: string
  name: string
  content: string
}

// @data
let tabIndex = 1
const editableTabsValue = ref<string>('first') 
const tabsList = ref<TabItem[]>([
  {
    title: '查询',
    name: 'first',
    content: '查询内容',
  },
  {
    title: '表单',
    name: 'second',
    content: '表单内容',  
  },
  {
    title: '日期',
    name: 'third',
    content: '日期内容',
  },
  {
    title: '字典',  
    name: 'fourth',
    content: '字典内容', 
  },
])

// @method
/**
 * @todo: 新增tab
 * @author: bugcao@163.com
 * @Date: 2026-06-23 15:14:48
*/
const addTab = () => {
  const newTabName = `${++tabIndex}`
  tabsList.value.push({
    title: 'New Tab',
    name: newTabName,
    content: 'New Tab content',
  })
  editableTabsValue.value = newTabName
}
/**
 * @todo: 删除tab
 * @author: bugcao@163.com
 * @Date: 2026-06-23 14:52:45
 * @param {*} targetName 目标tab name
*/
const removeTab = (targetName: TabPaneName | undefined) => {
  const tabs = tabsList.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab: TabItem, index:number) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }
  editableTabsValue.value = activeName
  tabsList.value = tabs.filter((tab: TabItem) => tab.name !== targetName)
}
</script>
```
