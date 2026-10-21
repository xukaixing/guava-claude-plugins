# 详情页模板（GvDescriptions）

> [\_shared.md](../_shared.md)

生成 `module/<Base>Info.vue`（layout=module）或 `<Base>Info.vue`（flat）。用于**只读详情展示**，以 `GvDescriptions` 组件呈现数据，包裹在 `GvDrawer` 中。

---

## 1. 适用场景

| 场景 | 说明 |
| ---- | ---- |
| 表格操作列「详情」按钮 | 点击后弹出 Drawer，展示该行数据的详细信息 |
| 信息卡片 / 摘要查看 | 多个字段按描述项排列，支持字典、日期、自定义渲染等 |

配置中 `## 详情` 小节定义要展示的字段；`## 操作列` 含「详情」或「查看」等按钮时触发生成。

---

## 2. YAML 配置

```markdown
---
feature: userMng
title: 用户管理
view: sysMng/userMng
pageType: crud-module
layout: module
editPage: true
infoPage: true          # ← 启用详情页生成
api:
  module: admin/user
  base: /sysuser
  operations:
    list: /sysuser/findUsers
    ...
---

## 详情
| 名称 | 字段 | 占用列 | 类型 | 扩展 |
| 用户账号 | account | 1 | | |
| 用户姓名 | userName | 1 | | |
| 性别 | sex | 1 | dic | dic=xb |
| 出生日期 | birthDate | 1 | date | |
| 联系方式 | mobile | 1 | | |
| 邮箱 | email | 1 | | |
| 状态 | status | 1 | dic | dic=yxzt |
| 备注 | remark | 2 | | |
```

### 字段说明

| 列 | 必填 | 说明 |
| -- | ---- | ---- |
| 名称 | ✅ | 描述项 label |
| 字段 | ✅ | 对应 `itemData` 中的 prop key |
| 占用列 | | 列占用的栅格数（span），默认 1 |
| 类型 | | `dic` / `date` — 标识字典列或日期列 |
| 扩展 | | `dic=编码` 等 |

---

## 3. 输出文件

| layout | 路径 |
| ------ | ---- |
| `module` | `src/views/<view>/module/<Base>Info.vue` + `helper.tsx` 中追加 `build<Feature>InfoHeadList` |
| `flat` | `src/views/<view>/<Base>Info.vue` + `helper.tsx` 中追加 `build<Feature>InfoHeadList` |

---

## 4. 模板（Variant A：GvDrawer + GvDescriptions）

```vue
<!--
 * @title:  <功能>详情
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
  defineOptions({
    name: '<Base>Info',
  });

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
  <GvDrawer
    :title="props.title"
    v-model:visible="isShow"
    size="40%">
    <GvDescriptions
      :item-head="props.itemHead as DescItemHead[]"
      :item-data="props.itemData" />
  </GvDrawer>
</template>
```

---

## 5. 模板（Variant B：GvDialog + GvDescriptions）

需要弹窗而非 Drawer 时（`## 改进` 指定 Dialog），**脚本与 Variant A 完全相同**，仅 template 容器替换：

```vue
<GvDialog :title="props.title" v-model:visible="isShow" width="50%">
  <GvDescriptions :item-head="props.itemHead as DescItemHead[]" :item-data="props.itemData" />
</GvDialog>
```

---

## 6. Helper 工厂函数

在 `helper.tsx` 中追加 `build<Feature>InfoHeadList` 工厂函数，返回 `DescItemHead[]`：

```typescript
export const build<Feature>InfoHeadList = (): DescItemHead[] => [
  {
    prop: 'account',
    label: '用户账号',
  },
  {
    prop: 'userName',
    label: '用户姓名',
  },
  {
    prop: 'sex',
    label: '性别',
    dicType: 'xb',
  },
  {
    prop: 'birthDate',
    label: '出生日期',
  },
  {
    prop: 'mobile',
    label: '联系方式',
  },
  {
    prop: 'email',
    label: '邮箱',
  },
  {
    prop: 'status',
    label: '状态',
    dicType: 'yxzt',
  },
  {
    prop: 'remark',
    label: '备注',
    span: 2,
  },
];
```

### DescItemHead 属性映射

| 属性 | 配置列 | 说明 |
| ---- | ------ | ---- |
| `prop` | 字段 | 对应 `itemData` 中的字段 key |
| `label` | 名称 | 描述项标签文本 |
| `span` | 占用列 | 列占用栅格数，默认 1 |
| `dicType` | 类型=dic 时，扩展 `dic=编码` | 字典编码，自动转换 `{c,v}` → 文案 |
| `formatter` | — | 自定义格式化函数 `(value, itemData) => string` |
| `render` | — | 自定义渲染 `(value, itemData) => VNode \| string` |
| `labelWidth` | — | 自定义标签宽度 |
| `align` | — | 内容对齐方式 |

---

## 7. 父组件调用示例

在列表页 Index.vue 中引用 Info 组件：

```vue
<script lang="tsx" setup>
  import <Base>Info from './module/<Base>Info.vue';
  import { build<Feature>InfoHeadList } from './module/helper';

  const infoVisible = ref<boolean>(false);
  let infoRowData = {};
  const <feature>InfoHeadList = computed(() => build<Feature>InfoHeadList());

  const showInfo = (row: Recordable<any>, _index: number) => {
    infoRowData = row;
    infoVisible.value = true;
  };
</script>

<template>
  <!-- 在表格/组件末尾 -->
  <BaseInfo
    v-model:visible="infoVisible"
    title="用户信息"
    :item-head="<feature>InfoHeadList"
    :item-data="infoRowData" />
</template>
```

---

## 8. 生成规则

| 规则 | 说明 |
| ---- | ---- |
| 触发条件 | `infoPage: true` 或 `## 操作列` 含「详情」「查看」「信息」；`## 编辑表单` 内 `### 分区名（GvDescriptions）` 子区复用本表规则（见 edit.md §2.1） |
| 字段来源 | `## 详情` 小节 → 缺省时回落 `## 编辑表单` 的（GvDescriptions）子区 → 再缺省回落 `## 表格` 列（视觉稿格式常见：只标 `infoPage: true` 不写 `## 详情`） |
| 容器选择 | 默认 `GvDrawer`（size=40%）；`## 改进` 指定 Dialog 时用 Variant B |
| helper 命名 | `build<Feature>InfoHeadList`（PascalCase） |
| 返回类型 | `DescItemHead[]`（全局类型，禁止 import） |
| 字典列 | `类型` 列填 `dic`，`扩展` 填 `dic=编码` → 生成 `dicType: '编码'` |
| 日期列 | `类型` 列填 `date` → GvDescriptions 自动格式化 |
| 占用列 | `占用列` ≥2 → 生成 `span: N` |
| 覆盖策略 | Info.vue 整文件覆盖；helper.tsx 中同名函数覆盖 |
| 命名约定 | 组件名 `<Base>Info`，与 Edit 平行位于 module/ 下 |

---

## 9. 与 Edit 的对比

| 项 | Edit | Info |
| -- | ---- | ---- |
| 用途 | 新增 / 编辑 | 只读展示 |
| 容器 | GvDrawer | GvDrawer / GvDialog |
| 核心组件 | GvForm | GvDescriptions |
| helper 工厂 | `build<Feature>EditList` | `build<Feature>InfoHeadList` |
| 返回类型 | `FormItem[]` | `DescItemHead[]` |
| 数据流向 | 表单 → 保存 API | itemData → 展示 |
| 按钮 | 保存/取消 | 无（关闭 Drawer 即可） |

---

## 10. 完整配置示例

在标准 crud-module 配置（见 [config-template.md](../config-template.md#精简格式兼容)）基础上加两项：

```markdown
infoPage: true          # YAML 头追加

## 操作列
编辑,删除,详情

## 详情
| 名称 | 字段 | 占用列 | 类型 | 扩展 |
| 用户账号 | account | 1 | | |
| 性别 | sex | 1 | dic | dic=xb |
| 出生日期 | birthDate | 1 | date | |
| 备注 | remark | 2 | | |
```

### 生成文件清单

```
src/views/sysMng/userMng/module/UserInfo.vue          ← Info 组件
src/views/sysMng/userMng/module/helper.tsx            ← 追加 buildUserInfoHeadList
```
