# 详情页模板（GvDescriptions）

> [\_shared.md](../_shared.md) · [\_common.md](_common.md)

生成 `module/<Base>Info.vue`（layout=module）或 `<Base>Info.vue`（flat）。**只读详情展示**，以 `GvDescriptions` 呈现数据，包裹在 `GvDrawer` / `GvDialog` 中。配置格式完整示例见 [config-template.md](../config-template.md)（`infoPage: true` + `## 详情` 小节）。

---

## 1. 触发与字段来源

| 项 | 规则 |
| ---- | ---- |
| 触发条件 | `infoPage: true` 或 `## 操作列` 含「详情」「查看」「信息」；`## 编辑表单` 内 `### 分区名（GvDescriptions）` 子区复用本表规则（见 [edit.md §2.1](edit.md#21-只读描述子区gvdescriptions)） |
| 字段来源 | `## 详情` 小节 → 缺省时回落 `## 编辑表单` 的（GvDescriptions）子区 → 再缺省回落 `## 表格` 列（视觉稿格式常见：只标 `infoPage: true` 不写 `## 详情`） |

字段表结构：`名称|字段|占用列|类型|扩展`

| 列 | 必填 | 说明 |
| -- | ---- | ---- |
| 名称 | ✅ | 描述项 label |
| 字段 | ✅ | 对应 `itemData` 中的 prop key |
| 占用列 | | span，默认 1；≥2 → `span: N` |
| 类型 | | `dic` / `date` |
| 扩展 | | `dic=编码` 等 |

---

## 2. 输出文件

| layout | 路径 |
| ------ | ---- |
| `module` | `src/views/<view>/module/<Base>Info.vue` + helper.tsx 追加 `build<Feature>InfoHeadList` |
| `flat` | `src/views/<view>/<Base>Info.vue` + helper.tsx 追加 `build<Feature>InfoHeadList` |

---

## 3. 模板（Variant A：GvDrawer + GvDescriptions）

```vue
<!--
 * @title: <功能>详情
 * @author: <git user.email>
 * @date: <current YYYY-MM-DD HH:mm:ss>
 * @LastEditors: <git user.name>
 * @LastEditTime: <current YYYY-MM-DD HH:mm:ss>
 * @version: 1.0.1
-->

<script lang="ts" setup>
  import { propTypes } from '@/hook/service/useUtil';
  import { computed } from 'vue';

  // @define name
  defineOptions({ name: '<Base>Info' });

  // @props
  const props = defineProps({
    visible: propTypes.bool.def(false),
    title: propTypes.string.def(''),
    itemHead: propTypes.array.def(() => []),
    itemData: propTypes.object.def(() => ({})),
  });

  // @emit
  const emit = defineEmits(['update:visible']);

  // @computed
  const isShow = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  });
</script>

<template>
  <GvDrawer :title="props.title" v-model:visible="isShow" size="40%">
    <GvDescriptions :item-head="props.itemHead as DescItemHead[]" :item-data="props.itemData" />
  </GvDrawer>
</template>
```

**Variant B（GvDialog）**：`## 改进` 指定 Dialog 时，脚本与 Variant A 完全相同，仅容器替换：

```vue
<GvDialog :title="props.title" v-model:visible="isShow" width="50%">
  <GvDescriptions :item-head="props.itemHead as DescItemHead[]" :item-data="props.itemData" />
</GvDialog>
```

---

## 4. Helper 工厂函数

helper.tsx 追加 `build<Feature>InfoHeadList`，返回 `DescItemHead[]`（全局类型，禁止 import）：

```typescript
export const build<Feature>InfoHeadList = (): DescItemHead[] => [
  { prop: 'account', label: '用户账号' },
  { prop: 'sex', label: '性别', dicType: 'xb' },
  { prop: 'birthDate', label: '出生日期' },
  { prop: 'remark', label: '备注', span: 2 },
];
```

### DescItemHead 属性映射

| 属性 | 配置列 | 说明 |
| ---- | ------ | ---- |
| `prop` | 字段 | 对应 `itemData` 中的字段 key |
| `label` | 名称 | 描述项标签文本 |
| `span` | 占用列 | 列占用栅格数，默认 1 |
| `dicType` | 类型=dic 时，扩展 `dic=编码` | 字典编码，自动转换 `{c,v}` → 文案 |
| `formatter` / `render` / `labelWidth` / `align` | — | 自定义扩展（formatter `(value, itemData) => string`；render 返回 `VNode \| string`） |

---

## 5. 父组件接线（Index.vue）

列表页持有 Info 组件：操作列「详情」回调里 `infoRowData = row; infoVisible.value = true`，模板末尾挂载：

```vue
<BaseInfo v-model:visible="infoVisible" title="用户信息" :item-head="build<Feature>InfoHeadList()" :item-data="infoRowData" />
```

`info<Feature>` 回调与 `infoVisible` / `infoRowData` 声明遵循 [crud.md](crud.md) §3 的 state 风格。

> **接线前提**：操作列必须存在「详情」入口。`infoPage: true` 而操作列只有「编辑、删除」时，先在操作列**追加「详情」按钮**（helper `content` + `actions.info<Feature>`，types.d.ts 补 `info<Feature>: TableRowFn`），再完成上述接线；否则 Info 组件生成了也不挂载（会产生 unused 变量）。

---

## 6. 生成规则

| 规则 | 说明 |
| ---- | ---- |
| 容器选择 | 默认 `GvDrawer`（size=40%）；`## 改进` 指定 Dialog 时用 Variant B |
| helper 命名 | `build<Feature>InfoHeadList`（PascalCase） |
| 字典列 | `类型` 填 `dic`，`扩展` 填 `dic=编码` → `dicType: '编码'` |
| 日期列 | `类型` 填 `date` → GvDescriptions 自动格式化 |
| 覆盖策略 | Info.vue 整文件覆盖；helper.tsx 中同名函数覆盖 |
| 命名约定 | 组件名 `<Base>Info`，与 Edit 平行位于 module/ 下 |
| i18n | 遵循 [\_common.md §2](_common.md#2-i18n-开关) |

---

## 7. 与 Edit 的对比

| 项 | Edit | Info |
| -- | ---- | ---- |
| 用途 | 新增 / 编辑 | 只读展示 |
| 容器 | GvDrawer | GvDrawer / GvDialog |
| 核心组件 | GvForm | GvDescriptions |
| helper 工厂 | `create<Feature>EditList` | `build<Feature>InfoHeadList` |
| 返回类型 | `FormItem[]` | `DescItemHead[]` |
| 数据流向 | 表单 → 保存 API | itemData → 展示 |
| 按钮 | 保存/取消 | 无（关闭 Drawer 即可） |
