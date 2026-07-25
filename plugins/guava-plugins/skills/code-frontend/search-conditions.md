# 查询条件 / 表单校验

列表搜索、编辑表单、form-only 均通过 `FormItem.format` 声明校验。**校验列必填**。

> 实现源：`gv.validate.ts`。

---

## 1. format 格式

`format: [required, validator, maxlength, decimal?]`

| 位置 | 说明 |
| ---- | ---- |
| `required` | `0`=非必填，`1`=必填。**查询固定 `0`** |
| `validator` | 校验类型（必填） |
| `maxlength` | 最大长度（汉字计 2） |
| `decimal` | 仅 `isDouble`：小数位数 |

---

## 2. 校验类型

### gv.validate.ts 规则

| 类型 | 控件 | 说明 |
| ---- | ---- | ---- |
| `isAny` | text/textarea | 默认无校验 |
| `isLength` | text | 长度校验（汉字计 2） |
| `isDouble` | text/number | 浮点数，第 4 位=小数位 |
| `isIdcard` | text | 身份证 |
| `isCarno` | text | 车牌号 |
| `isMoney` | text/number | 金额（最多 2 位小数） |
| `isBigMoney` | text | 千位符金额 |
| `isLetter` | text | 仅字母 |
| `isNumber` | text/number | 非负整数 |
| `isNumber0` | text/number | 正整数 |
| `isNumberLetter` | text | 数字+字母+符号 |
| `isName` | text | 名称/姓名 |
| `isPhone` | text | 手机号 |
| `isEmail` | text | 邮箱 |
| `isTelephone` | text | 固定电话 |
| `isPhoneTel` | text | 手机或固话 |
| `isIp` | text | IP 地址 |
| `isUrl` | text | URL |
| `isVin` | text | VIN/底盘号（8/17 位） |

> 拼写：`isIdcard`（非 `isIdCard`）。可用 `is_any`（snake_case）。

### 控件语义类型

| 类型 | 控件 | 说明 |
| ---- | ---- | ---- |
| `isDic` | dic | 查询；编辑非必填 |
| `idDic` | dic | 编辑必填 |
| `isDate` | date | 日期 |
| `isDateTime` | date | 日期时间 |
| `isTime` | date/time | 时间 |

### 按控件选型

| type | 推荐 validator |
| ---- | -------------- |
| 普通文本 | `isAny` / `isName` / `isNumberLetter` |
| 账号/编码 | `isNumberLetter` |
| 手机 | `isPhone` / `isPhoneTel` |
| 邮箱 | `isEmail` |
| 身份证 | `isIdcard` |
| 金额 | `isMoney` / `isBigMoney` |
| 整数 | `isNumber` / `isNumber0` |
| 小数 | `isDouble` |
| 字典 | `isDic` / `idDic` |
| 日期 | `isDate` / `isDateTime` |
| textarea | `isAny` |

---

## 3. 控件类型

| type | 必填属性 | 可选属性 |
| ---- | -------- | -------- |
| `text` | `field`, `label`, `format` | `hidden`, `placeholder` |
| `dic` | `field`, `label`, `format`, `dicType` | `dicRemote`, `multiple`, `isreload`, `filtercode` |
| `date` | `field`, `label`, `format`, `dateType` | `defaultTime`, `disabledDate` |
| `number` | `field`, `label`, `format` | `min`, `max`, `step`, `precision` |
| `textarea` | `field`, `label`, `format` | `colspan`, `rows` |
| `cascader` | `field`, `label`, `options` | `lazy`, `lazyLoad` |

### dateType

| dateType | validator | 说明 |
| -------- | --------- | ---- |
| `date` | `isDate` | 单日期 |
| `datetime` | `isDateTime` | 日期+时间 |
| `daterange` | `isDate` | 日期范围 |
| `datetimerange` | `isDateTime` | 日期时间范围 |
| `time`/`timerange` | `isTime` | 时间 |

### 日期按 label 关键字推导

**查询**：含「日期」/「时间」→ `isDate` + `daterange`
**编辑**：含「日期」→ `isDate` + `date`；含「时间」→ `isDateTime` + `datetime`

---

## 4. 字典字段

| 属性 | 说明 |
| ---- | ---- |
| `dicType` | 编码如 `yxzt`、`t#FUNC-DEPT-DEPTID` |
| `dicRemote` | 远程字典 API |
| `multiple` | 多选 |
| `isreload` | 每次重新加载 |

```typescript
// 本地字典
{ type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'status' }
// 远程字典
{ type: 'dic', format: [0, 'isDic', 20], dicType: 't#FUNC-DEPT-DEPTID', dicRemote: findDictFromTableApi, label: '部门', field: 'deptCode' }
```

---

## 5. 字段名前缀

| 位置 | 属性 | `u@` |
| ---- | ---- | ---- |
| 查询 | `field` | ✅ |
| 表格 | `prop` | ❌ |
| 编辑 | `field` | ❌ |

---

## 6. 确认表（生成前必做）

### 查询条件

```
| # | 条件名称 | field | type | validator | maxlength | 字典 | dicType | 备注 |
|---|---------|-------|------|-----------|-----------|------|---------|------|
| 1 | 用户账号 | u@account | text | isNumberLetter | 30 | 否 | — | |
| 2 | 所属部门 | u@deptCode | dic | isDic | 20 | 是 | t#FUNC-DEPT-DEPTID | 远程字典 |
```

### 编辑/表单字段

```
| # | 名称 | field | type | 必填 | validator | maxlength | 扩展 |
|---|------|-------|------|------|-----------|-----------|------|
| 1 | 用户账号 | account | text | Y | isNumberLetter | 30 | disabledOnEdit |
```

---

## 7. 代码模板

```typescript
// 文本查询
{ type: 'text', format: [0, 'isNumberLetter', 30], label: '用户账号', field: 'u@account' }
// 字典查询
{ type: 'dic', format: [0, 'isDic', 6], dicType: 'yxzt', label: '状态', field: 'status' }
// 日期范围
{ type: 'date', format: [0, 'isDate', 10], dateType: 'daterange', label: '创建时间', field: 'createTime' }
// 编辑表单
{ type: 'text', format: [1, 'isNumberLetter', 30], label: '用户账号', field: 'account' }
{ type: 'dic', format: [1, 'idDic', 6], dicType: 'yxzt', label: '状态', field: 'status' }
{ type: 'text', format: [0, 'isDouble', 10, 4], label: '金额', field: 'amount' }
// 默认值
{ type: 'dic', field: 'status', showLabel: '启用', value: { value: '10601', label: '启用' } }
```
