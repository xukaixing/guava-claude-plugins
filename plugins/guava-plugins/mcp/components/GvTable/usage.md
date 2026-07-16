> Table 组件对应 `GvTable`，下方示例可直接交互，点击「显示代码」查看源码。

# Table 表格

用于展示多条结构类似的数据， 可对数据进行排序、筛选。

::: tip
Table 组件对应 `GvTable`，下方示例可直接交互，点击「显示代码」查看源码。
:::

<!-- example: see examples[] -->

## API

### Table Attributes

| 属性名         | 说明                                     | 类型               | 默认值  |
| -------------- | ---------------------------------------- | ------------------ | ------- |
| ref-table      | 设置table的ref属性                       | `String`           | —       |
| table-head     | 设置table的表头                          | `Array`            | —       |
| table-type     | 设置表格类型                             | `String`           | —       |
| table-data     | 设置table的内容                          | `Object`, `Array`  | —       |
| visible        | 设置是否可见                             | `Boolean`          | `true`  |
| table-sort     | 设置排序组件是否可见                     | `Boolean`          | `true`  |
| is-show-page   | 设置分页组件是否可见                     | `Boolean`          | `true`  |
| multi          | 设置多选表格                             | `Boolean`          | `false` |
| height         | 设置table的高度                          | `Number`, `String` | —       |
| max-height     | 设置table的最大高度                      | `Number`, `String` | `384`   |
| page-size      | 设置table的每页大小                      | `Number`, `String` | `10`    |
| layout         | 设置table的分页插件布局                  | `String`           | —       |
| table-fetch    | 设置table的查询方法(render方式table有效) | `Function`         | —       |
| row-class-name | 设置行样式方法                           | `Function`         | —       |
| row-style      | 设置行样式方法                           | `Function`         | —       |
| cell-style     | 设置单元格样式方法                       | `Function`         | —       |
| before-import  | 设置导入前置方法                         | `Function`         | —       |
| table-filter   | 表格查询的过滤条件                       | `Object`           | —       |
| table-cb       | 表格加载完成后的回调方法                 | `Function`         | —       |
| table-init     | 表格初始化渲染方法                       | `Function`         | —       |

### Table Events

| 事件名           | 说明           | 类型                           |
| ---------------- | -------------- | ------------------------------ |
| row-dblclick     | 双击行触发事件 | `(row, column, event) => void` |
| row-click        | 点击行触发事件 | `(row, column, event) => void` |
| selection-change | 多选行选中事件 | `(selection) => void`          |

### Table Slots

| 插槽名 | 说明             |
| ------ | ---------------- |
| import | 列表导入按钮插槽 |
| export | 列表导出按钮插槽 |

### Table-Column Attributes

| 参数       | 说明                                    | 类型       | 可选值                            | 默认值  |
| :--------- | :-------------------------------------- | :--------- | :-------------------------------- | :------ |
| type       | 设置table的column列类型                 | `String`   | `text` / `action` / `dic` / `tag` | `text`  |
| prop       | 设置table的column对应字段属性           | `String`   | —                                 | —       |
| label      | 设置table的column名字                   | `String`   | —                                 | —       |
| fixed      | 设置table的column是否是固定锁定         | `String`   | `left` / `right` / `true`         | —       |
| width      | 设置table的column列宽度                 | `Number`   | —                                 | —       |
| minWidth   | 设置table的column列最小宽度             | `Number`   | —                                 | `135`   |
| align      | 设置table的column列对齐方式             | `String`   | `left` / `right`                  | `left`  |
| formatter  | 设置table的column列格式化方法           | `Function` | —                                 | —       |
| dicType    | 设置table的column列字典类型             | `String`   | —                                 | —       |
| filtercode | 设置table的column列字典类型过滤         | `String`   | —                                 | —       |
| showLabel  | 设置table的column列字典类型默认显示值   | `String`   | —                                 | —       |
| dicRemote  | 设置table的column列字典类型表选         | `Function` | —                                 | —       |
| isreload   | 设置table的列字典类型是否重新加载       | `Boolean`  | `true` / `false`                  | `false` |
| cb         | 设置table的column列字典类型选中回到函数 | `Function` | —                                 | —       |
| multiple   | 设置table的列字典类型是否多选           | `Boolean`  | `true` / `false`                  | `false` |
| dateType   | 设置table的column列日期类型             | `String`   | `date` / `datetime`               | `date`  |
| query      | 设置table的column列是否可搜索           | `Boolean`  | `true` / `false`                  | `false` |
| render     | 设置table的column列内容渲染方法         | `Function` | —                                 | —       |
| content    | 设置table的操作列定义                   | `Array`    | —                                 | —       |
| action     | 设置table的操作列响应方法               | `Array`    | —                                 | —       |
| edit       | 设置table的column是否可编辑             | `Boolean`  | `true` / `false`                  | `false` |
| format     | 设置table的编辑列格式                   | `Array`    | —                                 | —       |
| cellBlur   | 设置table的编辑列失去焦点方法           | `Function` | —                                 | —       |
| cellEnter  | 设置table的编辑列回车事件方法           | `Function` | —                                 | —       |
| hidden     | 设置table的列是否隐藏                   | `Boolean`  | `true` / `false`                  | `false` |
| selectable | 返回值用来决定这一行是否可以勾选        | `Function` | —                                 | —       |
| min        | 设置行编辑的number框最小值              | `Number`   | —                                 | —       |
| max        | 设置行编辑的number框最大值              | `Number`   | —                                 | —       |

## 示例源码（已内嵌，无需 press）

### TableBasic

```vue
<template>
  <GvTable
    ref="tableList"
    ref-table="tableList"
    :table-head="tableHeadList"
    :table-data="searchData"
    @row-click="handleRowClick"
  >
    <GvButton @click="handleSave">{{ t('add') }}</GvButton>
  </GvTable>
</template>

<script lang="tsx" setup>
import { GvButton, GvSwitch } from 'guava-ui'
import { computed, ref } from 'vue'
import { useI18n } from '@/hook/web/useI18n'

const { t } = useI18n('tableBar')
const { t: td } = useI18n('demo')

const searchData = ref<Record<string, any>[]>([])
const tableHeadList = computed(() => [
  {
    label: td('userAccount'),
    prop: 'u@account',
    align: 'right',
    query: true,
    width: 160,
  },
  {
    label: td('userName'),
    prop: 'u@userName',
    query: true,
    width: 160,
  },
  {
    type: 'tag',
    label: td('department'),
    prop: 'd@dname',
    query: true,
  },
  {
    label: td('employeeNo'),
    prop: 'u@userSn',
  },
  {
    label: td('postStation'),
    prop: 'u@postStation',
    query: true,
    width: 160,
  },
  {
    label: td('birthDate'),
    prop: 'birthDate',
  },
  {
    label: td('mobile'),
    prop: 'u.mobile',
    align: 'right',
  },
  {
    label: td('email'),
    prop: 'u@email',
  },
  {
    label: td('userType'),
    prop: 'u@userType',
  },
  {
    label: td('userLevel'),
    prop: 'u@userLevel',
  },
  {
    label: td('status'),
    prop: 'u@status',
    render: (scope: Record<string, any>) => (
      <GvSwitch value={scope.row.status.c}></GvSwitch>
    ),
  },
])

const handleRowClick = (row: Record<string, any>) => {
  console.log(row)
}

const handleSave = () => {
  console.log(t('add'))
}
</script>

```
