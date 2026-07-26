# 自由页面

> [\_shared.md](../_shared.md) · [vue.md](vue.md) · [conventions.md](../conventions.md)

生成**自定义布局页面**，无固定查询/列表/编辑结构。适用于看板、仪表盘、复合布局等。

---

## 1. 适用场景

- 数据看板 / 仪表盘（多卡片 + 图表 + 表格混合）
- 复合操作页（多步骤表单 + 预览 + 结果展示）
- 自定义详情页（非标准编辑，自由组合组件）
- 报表页（筛选 + 图表 + 导出）

---

## 2. 文件结构

**与 crud.md 一致**：`<Base>Index.vue` + `helper.tsx` + `types.d.ts` + `data.ts`。

| 文件 | 用途 | 条件 |
| ---- | ---- | ---- |
| `<Base>Index.vue` | 主页 | 始终 |
| `module/helper.tsx` | 列配置 / 表单配置 | 有表格/表单时 |
| `module/types.d.ts` | 自定义类型 | 有自定义类型时 |
| `module/data.ts` | mock 数据 | frontendOnly 时 |

```
layout=module:
src/views/<view>/<Base>Index.vue
src/views/<view>/module/helper.tsx
src/views/<view>/module/types.d.ts
src/views/<view>/module/data.ts

layout=flat:
src/views/<view>/<Base>Index.vue
src/views/<view>/helper.tsx
src/views/<view>/types.d.ts
src/views/<view>/data.ts
```

---

## 3. 配置格式

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
数据看板页，顶部显示 4 个统计卡片，下方为最近订单列表。

## 组件清单
| 组件 | 用途 | 关键 props |
|------|------|-----------|
| GvCard | 统计卡片 | title, value |
| GvTable | 订单列表 | table-head, table-data |
| GvButton | 刷新按钮 | type: primary |

## 数据

### 统计数据
```typescript
const statCards = [
  { title: '今日订单', value: 128, icon: 'el-icon-s-order', color: '#409EFF' },
  { title: '今日金额', value: 56800, icon: 'el-icon-money', color: '#67C23A' },
];
```

### 列表数据
```typescript
const orderList = [
  { orderNo: 'OD202601001', customer: '张三', amount: 1280, status: { c: '1001', v: '已支付' } },
];
```

## 订单列表列
| 名称 | 字段 | 宽度 | 类型 |
| 订单编号 | orderNo | 180 | |
| 客户 | customer | 120 | |
| 金额 | amount | 120 | amount |
| 状态 | status | 100 | dic:ddzt |
```

---

## 4. 生成规则

| 步骤 | 说明 |
| ---- | ---- |
| 1 | 解析 `## 页面描述` 理解布局意图 |
| 2 | 解析 `## 组件清单` 确定 Gv* 组件 |
| 3 | 解析 `## 数据` 提取 mock 数据 → 生成 `data.ts` |
| 4 | 解析 `## xxx列` 提取列配置 → 生成 `helper.tsx` |
| 5 | 每个组件查询 MCP 确认 props / slots |
| 6 | 生成 `<Base>Index.vue`（遵循 vue.md 格式） |

---

## 5. data.ts 模板

```typescript
/**
 * @title: <title> 前端静态数据（frontendOnly）
 * @description: mock 数据
 */

/** 列表转换 */
export const listTransHash: Recordable<string> | null = {
  status: 'dic|ddzt',
};

/** 统计数据 */
export const mockStatCards = [
  { title: '今日订单', value: 128, icon: 'el-icon-s-order', color: '#409EFF' },
  { title: '今日金额', value: 56800, icon: 'el-icon-money', color: '#67C23A' },
];

/** 业务行 */
export const mockOrderList: Recordable<any>[] = [
  { orderNo: 'OD202601001', customer: '张三', amount: 1280, status: { c: '1001', v: '已支付' } },
];

/** 构造分页结果 */
export const getListResult = (records = mockOrderList, query = {}): Recordable<any> => {
  const size = query.size || 10;
  const current = query.current || 1;
  const total = records.length;
  const pages = Math.max(1, Math.ceil(total / size));
  return {
    records: listTransHash ? [{ transHash: { ...listTransHash } }, ...records] : records,
    total, size, current, pages,
  };
};
```

---

## 6. helper.tsx 模板

```typescript
import { ref } from 'vue';
import { GvTable, amountFormat } from 'guava-ui';

/** 订单列表列 */
export const createOrderTableHeadList = () =>
  ref<TableHeadItem[]>([
    { label: '订单编号', prop: 'orderNo', width: 180 },
    { label: '客户', prop: 'customer', width: 120 },
    { label: '金额', prop: 'amount', width: 120, align: 'right', render: (scope) => <span>{amountFormat(scope.row.amount)}</span> },
    { label: '状态', prop: 'status', width: 100, align: 'center' },
  ]);
```

---

## 7. types.d.ts 模板

```typescript
/** 自由页面自定义类型（仅在有特殊类型时生成） */
export interface StatCard {
  title: string;
  value: number;
  icon?: string;
  color?: string;
}
```

---

## 8. Index.vue 模板

```vue
<script setup lang="tsx">
  import { ref, onMounted } from 'vue';
  import { GvCard, GvTable, GvButton } from 'guava-ui';
  import { useNotify } from '@/hook/web/useNotify';
  import { createOrderTableHeadList } from './module/helper';
  import { mockStatCards, mockOrderList } from './module/data';

  defineOptions({ name: '<Base>Index' });
  const { message } = useNotify();

  const statCards = ref(mockStatCards);
  const orderList = ref(mockOrderList);
  const orderTableHead = createOrderTableHeadList();
  const orderTableList = ref();

  const refresh = () => { message('刷新成功', 'success'); };
</script>

<template>
  <div class="free-page">
    <div class="stat-cards">
      <GvCard v-for="(card, i) in statCards" :key="i" :title="card.title" :value="card.value" />
    </div>
    <div class="content-layout">
      <GvTable ref="orderTableList" ref-table="orderTableList" :table-head="orderTableHead.value" :table-data="{ records: orderList }">
        <GvButton @click="refresh()">刷新</GvButton>
      </GvTable>
    </div>
  </div>
</template>
```

---

## 9. 关键规则

| 规则 | 说明 |
| ---- | ---- |
| 文件命名 | `<Base>Index.vue`（与 crud.md 一致） |
| 数据分离 | mock 数据放 `data.ts`，不放 Vue 内 |
| 列配置 | 列表/表单列配置放 `helper.tsx` |
| 类型定义 | 自定义类型放 `types.d.ts` |
| 组件自由组合 | 可使用任意 Gv* 组件，无固定结构限制 |
| MCP 必查 | 每个组件使用前必须查询 MCP |
| i18n: false 默认 | 不生成多语言，文案直接写中文 |

## 10. 改进（可选）

同 crud.md，可在末尾追加 `## 改进` 小节对生成的代码做二次调整。
