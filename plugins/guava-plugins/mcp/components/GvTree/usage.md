> 下方示例可直接交互，点击「显示代码」查看源码。

# Tree 树形

用清晰的层级结构展示信息，可展开或折叠。

::: tip
下方示例可直接交互，点击「显示代码」查看源码。
:::

## 基础用法

<!-- example: see examples[] -->

## 懒加载叶子节点

<!-- example: see examples[] -->

## API

### Attributes

| 属性名              | 说明                                            | 类型                   | 默认值  |
| ------------------- | ----------------------------------------------- | ---------------------- | ------- |
| treeData            | 设置tree的内容                                  | `array` 一             | 一      |
| treeProps           | 设置tree的节点和label属性                       | `object`               | 一      |
| node-key            | 设置tree节点的唯一key                           | `string`               | —       |
| lazy                | 设置tree是否懒加载                              | `boolean`              | `false` |
| load                | 加载子树数据的方法，仅当 lazy 属性为true 时生效 | `Function`             | —       |
| show-checkbox       | 设置tree是否多选                                | `boolean`              | `false` |
| draggable           | 是否开启拖拽节点功能                            | `boolean`              | `false` |
| defaultExpandAll    | 是否默认展开所有节点                            | `boolean`              | `false` |
| defaultExpandedKeys | 默认展开的节点的 key 的数组                     | `array`                | 一      |
| defaultCheckedKeys  | 默认勾选的节点的 key 的数组                     | `array`                | 一      |
| iconClass           | 自定义树节点图标组件                            | `string` / `Component` | 一      |
| expandOnClickNode   | 是否在点击节点的时候展开或者收缩节点。          | `boolean`              | `false` |
| checkOnClickNode    | 是否在点击节点的时候选中节点。                  | `boolean`              | `false` |
| filterNodeMethod    | 设置过滤方法                                    | `Function`             | 一      |
| renderContent       | 树节点的内容区的渲染 Function                   | `Function`             | 一      |

### Events

| 事件名        | 说明                     | 类型                                     |
| ------------- | ------------------------ | ---------------------------------------- |
| node-click    | 点击树节点响应事件       | `( data, treeNode, treeVNode) => void`   |
| check-change  | 当复选框被点击的时候触发 | `( data, checked, childChecked) => void` |
| node-expand   | 当节点展开的时候触发     | `( data, node, treeNode) => void`        |
| node-collapse | 当节点收缩的时候触发     | `( data, node, treeNode) => void`        |

### Exposes

| 名称            | 说明                        | 类型       |
| --------------- | --------------------------- | ---------- |
| filter          | 过滤节点                    | `Function` |
| getCheckedNodes | 获取勾选的节点              | `Function` |
| setCheckedNodes | 设置勾选的节点              | `Function` |
| getCheckedKeys  | 获取勾选的节点的 key 的数组 | `Function` |
| setCheckedKeys  | 设置勾选的节点的 key 的数组 | `Function` |

## 示例源码（已内嵌，无需 press）

### TreeBasic

```vue
<template>
  <div>
    <GvRow>
      <GvCol :span="12">
        <GvInput v-model="searchText" placeholder="输入关键字进行过滤" style="width: 180px;"/>
        <GvTree ref="tree" :key="treeKey" node-key="id" :data="treeData" :filter-node-method="handleFilterNode" :defaultExpandAll="isDefaultExpandAll" :showCheckbox="showCheckbox" :draggable="isDraggable" @node-click="handleNodeClick"/>
      </GvCol>
      <GvCol :span="12">
        <div>
          <div class="text-blod">配置参数</div>
          <div class="cb-group">
            <GvCheckbox v-model="isDefaultExpandAll" @change="treeKey= !treeKey">是否默认全部展开</GvCheckbox>
            <GvCheckbox v-model="showCheckbox" @change="treeKey= !treeKey">是否复选</GvCheckbox>
            <GvCheckbox v-model="isDraggable" @change="treeKey= !treeKey">节点是否可拖拽</GvCheckbox>
          </div>
        </div>
        <div class="btn-group-container">
          <div class="text-blod">设置选中/取消选中</div>
          <div class="btn-group">
          <GvButton @click="setCheckedNodes">通过 node 设置</GvButton>
          <GvButton @click="getCheckedNodes">通过 node 获取</GvButton> 
          <GvButton @click="setCheckedKeys">通过 key 设置</GvButton>
          <GvButton @click="getCheckedKeys">通过 key 获取</GvButton>
          <GvButton @click="resetChecked">清空</GvButton>
        </div>
        </div>
      </GvCol>
    </GvRow>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const tree = ref<any>();
const searchText = ref<string>("");
const isDefaultExpandAll = ref<boolean>(false);
const showCheckbox = ref<boolean>(false);
const isDraggable = ref<boolean>(false);
const treeKey = ref<boolean>(false);
const treeData = ref([
  {
    id: 1,
    label: '一级 1',
    children: [{
      id: 2,
      label: '二级 1-1',
      children: [{
        id: 3,
        label: '三级 1-1-1'
      }]
    }]
  }, {
    id: 4,
    label: '一级 2',
    children: [{
      id: 5,
      label: '二级 2-1',
      children: [{
        id: 6,
        label: '三级 2-1-1'
      }]
    }, {
      id: 7,
      label: '二级 2-2',
      children: [{
        id: 8,
        label: '三级 2-2-1'
      }]
    }]
  }, {
    id: 9,
    label: '一级 3',
    children: [{
      id: 10,
      label: '二级 3-1',
      children: [{
        id: 11,
        label: '三级 3-1-1'
      }]
    }, {
      id: 12,
      label: '二级 3-2',
      children: [{
        id: 13,
        label: '三级 3-2-1'
      }]
    }]
  }
])

// @method
/**
 * @todo: 节点过滤方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏
 * @author: bugcao@163.com
 * @Date: 2026-06-26 09:55:46
 * @param {*} value
 * @param {*} data
 * @param {*} node
 */
const handleFilterNode = (value: string, data: Record<string, any>, _node: Record<string, any>) => {
  console.log(value, data, _node);
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
}
/**
 * @todo: 节点点击事件
 * @author: bugcao@163.com
 * @Date: 2026-06-26 09:55:46
 * @param {*} node
 */
const handleNodeClick = (node: Record<string, any>) => {
  console.log(node);
}
/**
 * @todo: 根据唯一id设置选中（以node方式）
 * @author: bugcao@163.com
 * @Date: 2026-06-26 09:55:46
*/
const setCheckedNodes = () => {
  console.log("tree",tree.value);
  tree.value.setCheckedNodes([{
    id: 5
  }, {
    id: 9,
    label: '三级 1-1-1' // 主要是根据id判断选中
  }]);
}
/**
 * @todo: 返回选中的node（返回选中node对象数组）
 * @author: bugcao@163.com
 * @Date: 2026-06-26 10:09:20
*/
const getCheckedNodes = () => {
  console.log(tree.value.getCheckedNodes());
}
/**
 * @todo: 根据唯一id设置选中（以key方式）
 * @author: bugcao@163.com
 * @Date: 2026-06-26 10:10:22
*/
const setCheckedKeys = () => {
  tree.value.setCheckedKeys([3]);
}
/**
 * @todo: 获取选中的id（返回选中id数组）
 * @author: bugcao@163.com
 * @Date: 2026-06-26 10:10:57
*/
const getCheckedKeys = () => {
  console.log(tree.value.getCheckedKeys());
}
/**
 * @todo: 重置选中
 * @author: bugcao@163.com
 * @Date: 2026-06-26 10:12:09
*/
const resetChecked = () => {
  tree.value.setCheckedKeys([]);
}

</script>

<style scoped>
.cb-group{
  margin-top: 10px;
}
.btn-group-container {
  margin-top: 20px;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.text-blod {
  font-weight: bold;
}
:deep(.el-button + .el-button) {
  margin-left: 0 !important;
}
</style>

```

### TreeLazy

```vue
<template>
  <GvRow>
    <GvCol :span="12">
      <GvTree ref="tree" :key="treeKey" node-key="id" :treeProps="lazyProps" :showCheckbox="showCheckbox" :draggable="isDraggable" :lazy="isLazy" :load="handleLoadNode" @node-click="handleNodeClick"/>
    </GvCol>
    <GvCol :span="12">
      <div>
        <div class="text-blod">配置参数</div>
        <div class="cb-group">
          <GvCheckbox v-model="showCheckbox" @change="treeKey= !treeKey">是否复选</GvCheckbox>
          <GvCheckbox v-model="isDraggable" @change="treeKey= !treeKey">节点是否可拖拽</GvCheckbox>
        </div>
      </div>
    </GvCol>
  </GvRow>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// @data
const tree = ref<any>();
const showCheckbox = ref<boolean>(true);
const isDraggable = ref<boolean>(false);
const treeKey = ref<boolean>(false);
const isLazy = ref<boolean>(true);
const count = ref<number>(1);
const lazyProps = ref<Record<string, any>>({
  label: 'name',
  children: 'zones',
  isLeaf: 'leaf'
})

// @method
/**
 * @todo: 懒加载方法
 * @author: bugcao@163.com
 * @Date: 2026-06-26 11:40:40
 * @param {*} node
 * @param {*} resolve
*/
const handleLoadNode = (node: Record<string, any>, resolve: (data: Record<string, any>) => void) => {
  if (node.level === 0)
    return resolve([
      { name: '一级1', id: -1 },
      { name: '一级2', id: -2, leaf: true, disabled: true }
    ]);
  if (node.level > 3) return resolve([]);
  setTimeout(() => {
    var data;
    if (node.level === 3)
      data = [{
        id: count.value,
        name: '子节点' + count.value++,
        leaf: true
      }, {
        id: count.value,
        name: '子节点' + count.value++,
        leaf: true
      }];
    else
      data = [{
        id: count.value,
        name: '子节点' + count.value++
      }, {
        id: count.value,
        name: '子节点' + count.value++
      }];
    resolve(data);
  }, 500);
}
/**
 * @todo: 节点点击事件
 * @author: bugcao@163.com
 * @Date: 2026-06-26 09:55:46
 * @param {*} node
 */
const handleNodeClick = (node: Record<string, any>) => {
  console.log(node);
}
</script>

<style scoped>
.cb-group{
  margin-top: 10px;
}
.btn-group-container {
  margin-top: 20px;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.text-blod {
  font-weight: bold;
}
:deep(.el-button + .el-button) {
  margin-left: 0 !important;
}
</style>

```
