# 查询条件 / 表单 format 与校验类型

列表搜索、编辑表单、form-only 表单均通过 `FormItem.format` 声明校验。**查询条件与编辑/配置表单的「校验」列均必填**，不可省略。

> 实现源：guava-ui `packages/utils/gv.validate.ts`（GvForm 按 `format[1]` 取校验器；`isDic` / `idDic` / `isDate*` / `isTime` 由控件类型处理，无独立函数）。

## format 格式

```typescript
format: [required, validator, maxlength, decimal?]
```

| 位置 | 类型 | 说明 |
|------|------|------|
| `required` | `0 \| 1` | `0` = 非必填，`1` = 必填。**查询条件固定为 `0`** |
| `validator` | `string` | 格式校验类型，见下表（**必填**） |
| `maxlength` | `number` | 最大输入长度（汉字计 2）；日期/字典类型不走长度校验 |
| `decimal` | `number` | 仅 `isDouble`：小数位数，如 `[0, 'isDouble', 10, 4]` |

## 校验类型（validator）

### gv.validate.ts 实现的规则

| 校验类型 | 适用控件 | 说明 | 查询 | 编辑/表单 |
|---------|---------|------|------|----------|
| `isAny` | text / textarea | 默认，无格式校验（仅长度） | ✅ | ✅ |
| `isUrl` | text | URL | ✅ | ✅ |
| `isLetter` | text | 仅字母 | ✅ | ✅ |
| `isEmail` | text | 邮箱 | ✅ | ✅ |
| `isPhone` | text | 手机号 | ✅ | ✅ |
| `isIp` | text | IP 地址 | ✅ | ✅ |
| `isPhoneTel` | text | 手机号或固定电话 | ✅ | ✅ |
| `isTelephone` | text | 固定电话（`0xx-xxxxxxx`） | ✅ | ✅ |
| `isIdcard` | text | 身份证号 | ✅ | ✅ |
| `isMoney` | text / number | 金额（最多两位小数） | ✅ | ✅ |
| `isBigMoney` | text | 千位符金额 | ✅ | ✅ |
| `isNumber` | text / number | 非负整数（可含 0 开头语义按实现） | ✅ | ✅ |
| `isNumber0` | text / number | 正整数（不以 0 开头） | ✅ | ✅ |
| `isNumberLetter` | text | 数字 + 字母及部分符号 | ✅ | ✅ |
| `isDouble` | text / number | 浮点数；第 4 位为小数位数 | ✅ | ✅ |
| `isName` | text | 名称/姓名 | ✅ | ✅ |
| `isVin` | text | VIN / 底盘号（8 或 17 位） | ✅ | ✅ |
| `isCarno` | text | 车牌号（含新能源） | ✅ | ✅ |

> **拼写**：身份证用 `isIdcard`（与 `gv.validate.ts` 一致），勿写 `isIdCard`。可用 `is_any`（snake_case），GvForm 会转成 camelCase。

### 控件语义类型（非 gv.validate 函数，仍须写入 format[1]）

| 校验类型 | 适用控件 | 说明 | 查询 | 编辑/表单 |
|---------|---------|------|------|----------|
| `isDic` | dic | 字典下拉（查询；编辑非必填） | ✅ | ✅ 非必填 |
| `idDic` | dic | 字典下拉（编辑必填） | ❌ | ✅ 必填 |
| `isDate` | date | 日期 | ✅ | ✅ |
| `isDateTime` | date | 日期时间 | ✅ | ✅ |
| `isTime` | date / time | 时间 | ✅ | ✅ |

> **查询 vs 编辑字典**：查询始终 `required=0` + `isDic`；编辑必填字典用 `required=1` + `idDic`；编辑非必填用 `required=0` + `isDic`。

### 按控件选型（常用）

| 控件 type | 推荐 validator |
|-----------|----------------|
| `text` 普通文本 | `isAny` / `isName` / `isNumberLetter` |
| `text` 账号/编码 | `isNumberLetter` |
| `text` 手机 | `isPhone` 或 `isPhoneTel` |
| `text` 邮箱 | `isEmail` |
| `text` 身份证 | `isIdcard` |
| `text` 金额 | `isMoney` / `isBigMoney` |
| `number` 整数 | `isNumber` / `isNumber0` |
| `number` 小数 | `isDouble`（带 decimal） |
| `dic` | `isDic` 或 `idDic` |
| `date` | `isDate` / `isDateTime`（按 dateType） |
| `textarea` | `isAny` |

## 控件类型（type）

| type | 用途 | 必填属性 | 可选属性 |
|------|------|---------|---------|
| `text` | 文本输入 | `field`, `label`, `format` | `hidden`, `placeholder` |
| `dic` | 字典/下拉 | `field`, `label`, `format`, `dicType` | `dicRemote`, `multiple`, `isreload`, `filtercode` |
| `date` | 日期 | `field`, `label`, `format`, `dateType` | `defaultTime`, `disabledDate` |
| `number` | 数字 | `field`, `label`, `format` | `min`, `max`, `step`, `precision` |
| `textarea` | 多行文本 | `field`, `label`, `format` | `colspan`, `rows` |
| `cascader` | 级联 | `field`, `label`, `options` | `lazy`, `lazyLoad` |

### dateType 取值

| dateType | 推荐 validator | 说明 |
|----------|----------------|------|
| `date` | `isDate` | 单日期 |
| `datetime` | `isDateTime` | 日期 + 时间 |
| `daterange` | `isDate` | 日期范围 |
| `datetimerange` | `isDateTime` | 日期时间范围 |
| `time` / `timerange` | `isTime` | 时间 / 时间范围 |

## 字典字段

| 属性 | 说明 |
|------|------|
| `dicType` | 字典编码，如 `yxzt`、`zzlx`、`t#FUNC-DEPT-DEPTID` |
| `dicRemote` | 远程字典 API 函数（表选字典时使用） |
| `multiple` | 是否多选，`true` / 省略 |
| `isreload` | 表选字典是否每次重新加载 |

### 本地字典 vs 远程字典

```typescript
// 本地字典 — 仅需 dicType
{
  type: 'dic',
  format: [0, 'isDic', 6],
  dicType: 'yxzt',
  label: t('userMng.status'),
  field: 'status',
}

// 远程字典 — 额外指定 dicRemote
{
  type: 'dic',
  format: [0, 'isDic', 20],
  dicType: 't#FUNC-DEPT-DEPTID',
  dicRemote: findDictFromTableApi,
  label: t('userMng.deptCode'),
  field: 'deptCode',
}
```

## 配置表「校验」列（必填）

查询表与编辑表均须填写「校验」列，取值必须是上表中的 validator。

| 表 | 列 | 规则 |
|----|-----|------|
| ## 查询 | `校验` | **必填**；`format[0]=0` + 该 validator |
| ## 编辑 | `校验` | **必填**；配合「必填」列：字典 Y→`idDic`，字典空→`isDic` |

空校验或未知类型时 **停止生成**，向用户确认后再继续。

## 查询条件确认表（生成前必做）

向用户展示以下格式，**逐条确认**后再写入 `helper.tsx`：

```
📋 请确认查询条件：

| # | 条件名称 | field | type | validator | maxlength | 字典 | dicType | 备注 |
|---|---------|-------|------|-----------|-----------|------|---------|------|
| 1 | 用户账号 | u@account | text | isNumberLetter | 30 | 否 | — | |
| 2 | 用户姓名 | u@userName | text | isAny | 60 | 否 | — | |
| 3 | 所属部门 | u@deptCode | dic | isDic | 20 | 是 | t#FUNC-DEPT-DEPTID | 远程字典 |
| 4 | 部门级别 | u@userLevel | dic | isDic | 6 | 是 | zzlx | |
| 5 | 创建时间 | createTime | date | isDate | 10 | 否 | — | dateType: daterange |
```

### 确认规则

- 用户未提供的条件**不生成**
- `field` 需与后端查询参数一致（含 `u@` 等表别名前缀）
- 字典条件必须提供 `dicType`；远程字典额外提供 API 函数名
- 日期范围条件 `type=date`，`dateType=daterange`，validator 用 `isDate`
- 所有条件 `format[0]` 固定为 `0`
- **每条必须有明确的 validator**

## 编辑/表单字段确认表（生成前必做）

add/edit、tabs inline-form、form-only 均须确认：

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
- **每条必须有明确的 validator**（与 gv.validate / 控件语义表一致）

## 代码模板

### 文本查询

```typescript
{
  type: 'text',
  format: [0, 'isNumberLetter', 30],
  label: t('<i18nKey>.account'),
  field: 'u@account',
}
```

### 字典查询

```typescript
{
  type: 'dic',
  format: [0, 'isDic', 6],
  dicType: 'yxzt',
  label: t('<i18nKey>.status'),
  field: 'status',
}
```

### 日期范围查询

```typescript
{
  type: 'date',
  format: [0, 'isDate', 10],
  dateType: 'daterange',
  label: t('<i18nKey>.createTime'),
  field: 'createTime',
}
```

### 编辑表单（含类型校验示例）

```typescript
{
  type: 'text',
  format: [1, 'isNumberLetter', 30],
  label: t('<i18nKey>.account'),
  field: 'account',
},
{
  type: 'dic',
  format: [1, 'idDic', 6],
  dicType: 'yxzt',
  label: t('<i18nKey>.status'),
  field: 'status',
},
{
  type: 'text',
  format: [0, 'isPhone', 11],
  label: t('<i18nKey>.mobile'),
  field: 'mobile',
},
{
  type: 'text',
  format: [0, 'isDouble', 10, 4],
  label: t('<i18nKey>.amount'),
  field: 'amount',
},
```

### 完整 SearchList 工厂

```typescript
export const createUserSearchList = () => {
  const { t } = useI18n();
  return ref<FormItem[]>([
    {
      type: 'text',
      format: [0, 'isNumberLetter', 30],
      label: t('userMng.account'),
      field: 'u@account',
    },
    {
      type: 'dic',
      format: [0, 'isDic', 6],
      dicType: 'yxzt',
      label: t('userMng.status'),
      field: 'u@status',
    },
    {
      type: 'date',
      format: [0, 'isDate', 10],
      dateType: 'daterange',
      label: t('userMng.createTime'),
      field: 'createTime',
    },
  ]);
};
```

## 与表格列的关系

- 搜索 `field` 与表格 `prop` 通常一致，便于列头筛选（`query: true`）
- 搜索条件独立于表格列 — 可以只搜不展示，或只展示不搜
- 生成表格列时参考 [templates/helper.md](templates/helper.md) 的表格列类型表
