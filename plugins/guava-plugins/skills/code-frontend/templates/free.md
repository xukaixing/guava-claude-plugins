# 自由页面

> [\_shared.md](../_shared.md) · [vue.md](vue.md) · [conventions.md](../conventions.md)

生成**自定义布局页面**，无固定查询 / 列表 / 编辑结构。适用于看板、仪表盘、复合布局等。

---

## 1. 适用场景

- 数据看板 / 仪表盘（多卡片 + 图表 + 表格混合）
- 复合操作页（多步骤表单 + 预览 + 结果展示）
- 自定义详情页（非标准编辑，自由组合组件）
- 报表页（筛选 + 图表 + 导出）

---

## 2. 配置格式

```markdown
---
feature: dashboard
title: 数据看板
view: dashboard/overview
layout: flat
i18n: false
pageType: free
frontendOnly: true
---

## 页面描述
数据看板页，顶部显示 4 个统计卡片，下方左侧为订单趋势图表，右侧为最近订单列表。

## 组件清单
| 组件 | 用途 | 关键 props |
|------|------|-----------|
| GvCard | 统计卡片 | title, value |
| GvTable | 最近订单列表 | table-head, table-data |
| GvButton | 刷新按钮 | type: primary |

## 数据
// 统计数据
const statCards = [
  { title: '今日订单', value: 128 },
  { title: '今日金额', value: 56800 },
];
```

---

## 3. 生成规则

| 步骤 | 说明 |
| ---- | ---- |
| 1 | 解析 `## 页面描述` 理解布局意图 |
| 2 | 解析 `## 组件清单` 确定 Gv* 组件 |
| 3 | 解析 `## 数据` 提取内联数据 |
| 4 | 每个组件查询 MCP 确认 props / slots |
| 5 | 生成单文件 Vue 组件（遵循 vue.md 格式） |

### MCP 依赖

每个组件**必须**通过 MCP 确认：

| 组件 | MCP 查询 |
| ---- | -------- |
| GvCard / GvTable / GvButton / GvForm / GvDrawer / GvTabs | `gv-*` → `get_usage` / `get_api` / `get_props` |
| 其他 Gv* | `guava-ui` → `get_gv_component` / `resolve_gv_component` |

---

## 4. 输出

```
src/views/<view>/<Feature>.vue    ← 唯一主页面
```

**不生成**：helper.tsx、API 文件（数据内联或从 store 获取）

---

## 5. 模板

```vue
<!--
 * @title: <title>
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.0
-->
<script setup lang="tsx">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { GvCard, GvTable, GvButton, amountFormat } from 'guava-ui';
  import { useNotify } from '@/hook/web/useNotify';

  // @define name
  defineOptions({ name: '<Feature>' });

  // @hook
  const { message } = useNotify();

  // @data
  const statCards = ref([
    { title: '今日订单', value: 128 },
    { title: '今日金额', value: 56800 },
  ]);

  const orderList = ref([
    { orderNo: 'OD20260101', amount: 1280, status: '已支付' },
  ]);

  const orderTableHead = ref<TableHeadItem[]>([
    { label: '订单编号', prop: 'orderNo', width: 180 },
    { label: '金额', prop: 'amount', width: 120, align: 'right', render: (scope) => <span>{amountFormat(scope.row.amount)}</span> },
    { label: '状态', prop: 'status', width: 100, align: 'center' },
  ]);

  // @methods
  const refresh = () => {
    message('刷新成功', 'success');
  };
</script>

<template>
  <div class="free-page">
    <div class="stat-cards">
      <GvCard v-for="(card, i) in statCards" :key="i" :title="card.title" :value="card.value" />
    </div>
    <div class="content-layout">
      <GvTable ref="orderTableList" ref-table="orderTableList" :table-head="orderTableHead" :table-data="{ records: orderList }">
        <GvButton @click="refresh()">刷新</GvButton>
      </GvTable>
    </div>
  </div>
</template>
```

---

## 6. 关键规则

| 规则 | 说明 |
| ---- | ---- |
| 单文件输出 | 整个页面一个 `<Feature>.vue`，不拆 helper / types |
| 数据内联 | mock 数据直接写在 `<script setup>` |
| 组件自由组合 | 可使用任意 Gv* 组件，无固定结构限制 |
| MCP 必查 | 每个组件使用前必须查询 MCP |
| vue.md 格式 | section 注释（@define / @hook / @data / @methods / @mounted） |
| i18n: false 默认 | 不生成多语言，文案直接写中文 |

## 7. 改进（可选）

同 crud.md / table.md，可在末尾追加 `## 改进` 小节对生成的代码做二次调整。
