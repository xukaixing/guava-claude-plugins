# 明细展开模板（Detail Table）

> [\_shared.md](../_shared.md) · [helper.md](helper.md) · [crud.md](crud.md)

生成**操作列自定义按钮 + 展开明细表格**的模式。点击按钮后在当前行下方展开一个子表，展示关联数据（如用户登录明细、订单明细等）。

---

## 1. 适用场景

| 场景 | 说明 |
| ---- | ---- |
| 关联数据查看 | 点击「用户登录明细」展开该用户的登录日志列表 |
| 子记录展示 | 点击「订单明细」展开该订单下的商品列表 |
| 异步数据拉取 | 展开时通过 API 按需加载关联数据，避免一次性加载全部 |

---

## 2. 与 Expand 的对比

| 项 | Expand 列 | Detail 按钮 |
| ---- | --------- | ----------- |
| 触发方式 | 行首展开图标 | 操作列自定义按钮 |
| 配置位置 | `## 扩展列` | `## 明细` |
| 按钮文案 | 固定图标 | 自定义（如「用户登录明细」） |
| 数据拉取 | `fetchExpandTableData` | `crud.fetchTable` |
| 渲染位置 | 行首展开槽 | 操作列 render 函数 |
| 灵活性 | 标准模式 | 可自定义按钮 icon、文案 |

---

## 3. 配置方式

在 `## 操作列` 下方增加 `## 明细` 小节：

```markdown
## 操作列
编辑,删除,用户登录明细

## 明细
- name: loginLog
  label: 用户登录明细
  api: /sysuser/findUserLoginInfo
  columns:
    - label: 登录IP
      prop: loginIp
      width: 150
    - label: 所属地区
      prop: loginDivision
    - label: 浏览器
      prop: browser
    - label: 登录时间
      prop: loginTime
      width: 180
```

### 字段说明

| 字段 | 必填 | 说明 |
| ---- | ---- | ---- |
| `name` | ✅ | 明细标识，用于 helper 函数命名（PascalCase） |
| `label` | ✅ | 操作列按钮文案 |
| `api` | ✅ | 拉取明细数据的 API 端点 |
| `columns` | ✅ | 明细表格列定义 |

---

## 4. Helper 工厂函数

在 `helper.tsx` 中追加 `build<Feature><DetailName>HeadList` 工厂函数：

```typescript
/**
 * 用户登录明细表格列
 */
export const buildLoginLogHeadList = (): TableHeadItem[] => [
  { label: '登录IP', prop: 'loginIp', width: '150px' },
  { label: '所属地区', prop: 'loginDivision' },
  { label: '浏览器', prop: 'browser' },
  { label: '登录时间', prop: 'loginTime', width: '180px' },
];
```

### 命名规则

| 配置 name | helper 函数名 | 类型 |
| --------- | ------------- | ---- |
| `loginLog` | `buildLoginLogHeadList` | `TableHeadItem[]` |
| `orderDtl` | `buildOrderDtlHeadList` | `TableHeadItem[]` |

---

## 5. 操作列配置

在 `create<Feature>TableHeadList` 的操作列中追加明细按钮：

```typescript
{
  type: 'action',
  prop: '',
  label: '操作',
  content: ['编辑', '删除', '用户登录明细'],
  icon: ['el-icon-edit', 'gv-icon-tingyong', 'gv-icon-daiban'],
  action: [actions.editRow, actions.delRow, actions.showLoginLog],
},
```

### 按钮 icon 规则

| 按钮位置 | icon |
| -------- | ---- |
| 第 1 个 | `el-icon-edit`（编辑） |
| 第 2 个 | `gv-icon-tingyong`（停用/删除） |
| 第 3 个及以后 | `gv-icon-daiban`（自定义） |

---

## 6. Index 页方法

在 Index.vue 中生成 `show<DetailName>` 方法：

```typescript
/**
 * @todo: 展开用户登录明细
 * @author: <git user.name>
 * @Date: <current YYYY-MM-DD HH:mm:ss>
 * @param {*} row
 * @param {*} index
 */
const showLoginLog = async (row: Recordable<any>, index: number) => {
  const filter = { userId: row.id };
  const detailData = await crud.fetchTable(findUserLoginInfoApi, filter);
  return () => (
    <GvTable
      ref-table={`userLoginLogList-${index}`}
      table-head={buildLoginLogHeadList()}
      table-data={detailData}
      table-type="detail"
      table-fetch={findUserLoginInfoApi}
      table-filter={filter}
    />
  );
};
```

### 方法命名

| 配置 name | 方法名 |
| --------- | ------ |
| `loginLog` | `showLoginLog` |
| `orderDtl` | `showOrderDtl` |

---

## 7. 完整示例

### 配置

```markdown
---
feature: userMng
title: 用户管理
view: sysMng/userMng
pageType: crud-module
layout: module
editPage: true
detailPage: loginLog
api:
  module: admin/user
  base: /sysuser
  operations:
    list: /sysuser/findUsers
    create: /sysuser/saveUser
    update: /sysuser/updateUser/{id}
    delete: /sysuser/deleteUser
---

## 操作列
编辑,删除,用户登录明细

## 明细
- name: loginLog
  label: 用户登录明细
  api: /sysuser/findUserLoginInfo
  columns:
    - label: 登录IP
      prop: loginIp
      width: 150
    - label: 所属地区
      prop: loginDivision
    - label: 浏览器
      prop: browser
    - label: 登录时间
      prop: loginTime
      width: 180
```

### 生成产物

| 文件 | 生成内容 |
| ---- | -------- |
| `helper.tsx` | 追加 `buildLoginLogHeadList(): TableHeadItem[]` |
| `Index.vue` | 追加 `showLoginLog` 方法 + 操作列按钮 |

### helper.tsx

```typescript
export const buildLoginLogHeadList = (): TableHeadItem[] => [
  { label: '登录IP', prop: 'loginIp', width: '150px' },
  { label: '所属地区', prop: 'loginDivision' },
  { label: '浏览器', prop: 'browser' },
  { label: '登录时间', prop: 'loginTime', width: '180px' },
];

// 在 createUserTableHeadList 中：
{
  type: 'action',
  prop: '',
  label: '操作',
  content: ['编辑', '删除', '用户登录明细'],
  icon: ['el-icon-edit', 'gv-icon-tingyong', 'gv-icon-daiban'],
  action: [actions.editRow, actions.delRow, actions.showLoginLog],
},
```

### Index.vue

```typescript
import { findUserLoginInfoApi } from '@/api/admin/user';
import { buildLoginLogHeadList } from './module/helper';

const showLoginLog = async (row: Recordable<any>, index: number) => {
  const filter = { userId: row.id };
  const detailData = await crud.fetchTable(findUserLoginInfoApi, filter);
  return () => (
    <GvTable
      ref-table={`userLoginLogList-${index}`}
      table-head={buildLoginLogHeadList()}
      table-data={detailData}
      table-type="detail"
      table-fetch={findUserLoginInfoApi}
      table-filter={filter}
    />
  );
};
```

---

## 8. 多明细配置

支持配置多个明细按钮：

```markdown
## 操作列
编辑,删除,用户登录明细,订单明细

## 明细
- name: loginLog
  label: 用户登录明细
  api: /sysuser/findUserLoginInfo
  columns:
    - label: 登录IP
      prop: loginIp
    - label: 登录时间
      prop: loginTime

- name: orderDtl
  label: 订单明细
  api: /sysuser/findUserOrderDtl
  columns:
    - label: 订单编号
      prop: orderNo
    - label: 订单金额
      prop: amount
    - label: 下单时间
      prop: orderTime
```

生成：
- `buildLoginLogHeadList()` + `showLoginLog` 方法
- `buildOrderDtlHeadList()` + `showOrderDtl` 方法
- 操作列 4 个按钮

---

## 9. 生成规则

| 规则 | 说明 |
| ---- | ---- |
| 触发条件 | `detailPage` 非空 或 `## 明细` 小节存在 |
| helper 命名 | `build<Feature><DetailName>HeadList` |
| 方法命名 | `show<DetailName>`（PascalCase） |
| 按钮位置 | 操作列末尾追加 |
| icon 规则 | 第 3 个按钮起统一用 `gv-icon-daiban` |
| 数据拉取 | `crud.fetchTable(fetch, { <parent>Id: row.id })` |
| 渲染方式 | 返回 render 函数，`table-type="detail"` |
| API import | 自动追加 `find<DetailName>Api` import |
| 覆盖策略 | helper 同名函数覆盖，Index 方法追加 |

---

## 10. API 命名推导

| 配置 api | 推导 API 函数名 |
| -------- | --------------- |
| `/sysuser/findUserLoginInfo` | `findUserLoginInfoApi` |
| `/sysuser/findUserOrderDtl` | `findUserOrderDtlApi` |
| `/order/findOrderDtl` | `findOrderDtlApi` |

API 函数需在 `src/api/<module>.ts` 中追加（如不存在）。
