# 查询条件 / 表单校验

列表搜索、编辑表单、form-only 表单均通过 `FormItem.format` 声明校验。**查询条件与编辑 / 表单的「校验」列均必填**。

> 实现源：guava-ui `packages/utils/gv.validate.ts`（GvForm 按 `format[1]` 取校验器；`isDic` / `idDic` / `isDate*` / `isTime` 由控件类型处理）。

---

## 1. format 格式

```typescript
format: [required, validator, maxlength, decimal?]
```

| 位置 | 类型 | 说明 |
| ---- | ---- | ---- |
| `required` | `0 \| 1` | `0` = 非必填，`1` = 必填。**查询条件固定为 `0`** |
| `validator` | `string` | 格式校验类型（**必填**） |
| `maxlength` | `number` | 最大输入长度（汉字计 2）；日期 / 字典不走长度校验 |
| `decimal` | `number` | 仅 `isDouble`：小数位数，如 `[0, 'isDouble', 10, 4]` |

---

## 2. 校验类型（validator）

### 2.1 gv.validate.ts 实现的规则

| 校验类型 | 适用控件 | 说明 |
| ------- | -------- | ---- |
| `isAny` | text / textarea | 默认，无格式校验（仅长度） |
| `isLength` | text | 长度校验（汉字计 2） |
| `isDouble` | text / number | 浮点数；第 4 位为小数位数 |
| `isIdcard` | text | 身份证号（15 / 18 位） |
| `isCarno` | text | 车牌号（含新能源） |
| `isMoney` | text / number | 金额（最多两位小数） |
| `isBigMoney` | text | 千位符金额 |
| `isLetter` | text | 仅字母 |
| `isNumber` | text / number | 非负整数（含 0） |
| `isNumber0` | text / number | 正整数（不以 0 开头） |
| `isNumberLetter` | text | 数字 + 字母 + 部分符号 |
| `isName` | text | 名称 / 姓名 |
| `isPhone` | text | 手机号 |
| `isEmail` | text | 邮箱 |
| `isTelephone` | text | 固定电话（`0xx-xxxxxxx`） |
| `isPhoneTel` | text | 手机号或固定电话 |
| `isIp` | text | IP 地址 |
| `isUrl` | text | URL |
| `isVin` | text | VIN / 底盘号（8 或 17 位） |

> **拼写**：身份证用 `isIdcard`（与 `gv.validate.ts` 一致）。可用 `is_any`（snake_case），GvForm 会转 camelCase。

### 2.2 控件语义类型（仍须写入 format[1]）

| 校验类型 | 适用控件 | 说明 |
| ------- | -------- | ---- |
| `isDic` | dic | 字典下拉（查询；编辑非必填） |
| `idDic` | dic | 字典下拉（编辑必填） |
| `isDate` | date | 日期 |
| `isDateTime` | date | 日期时间 |
| `isTime` | date / time | 时间 |

> **查询 vs 编辑字典**：查询始终 `required=0` + `isDic`；编辑必填字典用 `required=1` + `idDic`；编辑非必填用 `required=0` + `isDic`。

### 2.3 按控件选型

| 控件 type | 推荐 validator |
| --------- | -------------- |
| `text` 普通文本 | `isAny` / `isName` / `isNumberLetter` |
| `text` 账号 / 编码 | `isNumberLetter` |
| `text` 手机 | `isPhone` 或 `isPhoneTel` |
| `text` 邮箱 | `isEmail` |
| `text` 身份证 | `isIdcard` |
| `text` 金额 | `isMoney` / `isBigMoney` |
| `number` 整数 | `isNumber` / `isNumber0` |
| `number` 小数 | `isDouble`（带 decimal） |
| `dic` | `isDic` 或 `idDic` |
| `date` | `isDate` / `isDateTime`（按 dateType） |
| `textarea` | `isAny` |

---

## 3. 控件类型（type）

| type | 用途 | 必填属性 | 可选属性 |
| ---- | ---- | -------- | -------- |
| `text` | 文本输入 | `field`, `label`, `format` | `hidden`, `placeholder` |
| `dic` | 字典 / 下拉 | `field`, `label`, `format`, `dicType` | `dicRemote`, `multiple`, `isreload`, `filtercode` |
| `date` | 日期 | `field`, `label`, `format`, `dateType` | `defaultTime`, `disabledDate` |
| `number` | 数字 | `field`, `label`, `format` | `min`, `max`, `step`, `precision` |
| `textarea` | 多行文本 | `field`, `label`, `format` | `colspan`, `rows` |
| `cascader` | 级联 | `field`, `label`, `options` | `lazy`, `lazyLoad` |

### dateType 取值

| dateType | 推荐 validator | 说明 |
| -------- | -------------- | ---- |
| `date` | `isDate` | 单日期 |
| `datetime` | `isDateTime` | 日期 + 时间 |
| `daterange` | `isDate` | 日期范围 |
| `datetimerange` | `isDateTime` | 日期时间范围 |
| `time` / `timerange` | `isTime` | 时间 / 时间范围 |

### 日期 / 时间字段按 label 关键字自动推导（强制规则）

#### 查询条件（SearchList）

| label 含关键字 | validator | dateType |
| -------------- | --------- | -------- |
| 「日期」 | `isDate` | `daterange` |
| 「时间」 | `isDate` | `daterange` |

> 查询条件不区分「日期」/「时间」，一律走 `isDate` + `daterange`。

#### 编辑 / 表单（EditList / FormList）

| label 含关键字 | validator | dateType |
| -------------- | --------- | -------- |
| 「日期」 | `isDate` | `date` |
| 「时间」 | `isDateTime` | `datetime` |

> label 不含关键字时，回退到 dateType 选型表。

---

## 4. 字典字段

| 属性 | 说明 |
| ---- | ---- |
| `dicType` | 字典编码，如 `yxzt`、`t#FUNC-DEPT-DEPTID` |
| `dicRemote` | 远程字典 API 函数 |
| `multiple` | 是否多选 |
| `isreload` | 表选字典是否每次重新加载 |

### 本地字典 vs 远程字典

```typescript
// 本地字典
{ type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'status' }

// 远程字典
{ type: 'dic', format: [0, 'isDic', 20], dicType: 't#FUNC-DEPT-DEPTID', dicRemote: findDictFromTableApi, label: '部门', field: 'deptCode' }
```

---

## 5. 字段名前缀规则

| 配置位置 | 属性名 | `u@` 前缀 | 说明 |
| ------- | ------ | --------- | ---- |
| 查询条件（## 查询） | `field` | ✅ 保留 | 与后端查询参数一致 |
| 表格列（## 表格） | `prop` | ❌ 不带 | 纯字段名 |
| 编辑表单（## 编辑） | `field` | ❌ 不带 | 纯字段名 |

空校验或未知类型时**停止生成**，向用户确认后再继续。

---

## 6. 查询条件确认表（生成前必做）

```
📋 请确认查询条件：

| # | 条件名称 | field | type | validator | maxlength | 字典 | dicType | 备注 |
|---|---------|-------|------|-----------|-----------|------|---------|------|
| 1 | 用户账号 | u@account | text | isNumberLetter | 30 | 否 | — | |
| 2 | 用户姓名 | u@userName | text | isAny | 60 | 否 | — | |
| 3 | 所属部门 | u@deptCode | dic | isDic | 20 | 是 | t#FUNC-DEPT-DEPTID | 远程字典 |
| 4 | 创建时间 | createTime | date | isDate | 10 | 否 | — | dateType: daterange |
```

### 确认规则

- 用户未提供的条件**不生成**
- `field` 需与后端查询参数一致（含 `u@` 等表别名前缀）
- 字典条件必须提供 `dicType`；远程字典额外提供 API 函数名
- 日期范围条件 `type=date`，`dateType=daterange`，validator 用 `isDate`
- 所有条件 `format[0]` 固定为 `0`
- **每条必须有明确的 validator**

---

## 7. 编辑 / 表单字段确认表（生成前必做）

```
📋 请确认编辑/表单字段：

| # | 名称 | field | type | 必填 | validator | maxlength | 扩展 |
|---|------|-------|------|------|-----------|-----------|------|
| 1 | 用户账号 | account | text | Y | isNumberLetter | 30 | disabledOnEdit |
| 2 | 状态 | status | dic | Y | idDic | 6 | dic=yxzt |
| 3 | 手机 | mobile | text | | isPhone | 11 | |
| 4 | 备注 | remark | textarea | | isAny | 200 | |
```

- 必填字典 → `idDic`；非必填字典 → `isDic`
- **每条必须有明确的 validator**

---

## 8. 代码模板

### 文本查询

```typescript
{
  type: 'text',
  format: [0, 'isNumberLetter', 30],
  label: '用户账号',
  field: 'u@account',
}
```

### 字典查询

```typescript
{
  type: 'dic',
  format: [0, 'isDic', 6],
  dicType: 'yxzt',
  label: '状态',
  field: 'status',
}
```

### 日期范围查询

```typescript
{
  type: 'date',
  format: [0, 'isDate', 10],
  dateType: 'daterange',
  label: '创建时间',
  field: 'createTime',
}
```

### 编辑表单

```typescript
{
  type: 'text',
  format: [1, 'isNumberLetter', 30],
  label: '用户账号',
  field: 'account',
},
{
  type: 'dic',
  format: [1, 'idDic', 6],
  dicType: 'yxzt',
  label: '状态',
  field: 'status',
},
{
  type: 'text',
  format: [0, 'isPhone', 11],
  label: '手机',
  field: 'mobile',
},
{
  type: 'text',
  format: [0, 'isDouble', 10, 4],
  label: '金额',
  field: 'amount',
},
```

### 完整 SearchList 工厂

```typescript
export const createUserSearchList = () => {
  return ref<FormItem[]>([
    { type: 'text', format: [0, 'isNumberLetter', 30], label: '用户账号', field: 'u@account' },
    { type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'u@status' },
    { type: 'date', format: [0, 'isDate', 10], dateType: 'daterange', label: '创建时间', field: 'createTime' },
  ]);
};
```

---

## 9. 与表格列的关系

- 搜索 `field` 与表格 `prop` 通常一致，便于列头筛选（`query: true`）
- 搜索条件独立于表格列 — 可以只搜不展示，或只展示不搜
- 生成表格列时参考 [templates/helper.md](templates/helper.md) 的表格列类型表
