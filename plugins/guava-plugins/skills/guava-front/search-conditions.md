# 查询条件配置参考

列表页搜索表单通过 `create<Feature>SearchList` 工厂生成，每个条件对应一个 `FormItem`。

## format 格式

```typescript
format: [required, validator, maxlength, minlength?]
```

| 位置 | 类型 | 说明 |
|------|------|------|
| `required` | `0 \| 1` | `0` = 非必填，`1` = 必填。**查询条件固定为 `0`** |
| `validator` | `string` | 格式校验类型，见下表 |
| `maxlength` | `number` | 最大输入长度 |
| `minlength` | `number` | 可选，最小输入长度 |

## 校验类型（validator）

| 校验类型 | 适用控件 | 说明 | 查询常用 |
|---------|---------|------|---------|
| `isAny` | text / textarea | 任意字符 | ✅ |
| `text` | text | 普通文本（同 isAny，项目内混用） | ✅ |
| `isNumberLetter` | text | 字母 + 数字 | ✅ |
| `isLetter` | text | 仅字母 | ✅ |
| `isNumber` | text / number | 仅数字 | ✅ |
| `isPhone` | text | 手机号 | ✅ |
| `isEmail` / `isMail` | text | 邮箱 | ✅ |
| `isIdCard` | text | 身份证号 | ✅ |
| `isVin` | text | 车架号 | ✅ |
| `isDate` | date | 日期格式 | ✅ |
| `isName` | text | 姓名 | ✅ |
| `isDic` | dic | 字典下拉（查询/非必填编辑） | ✅ |
| `idDic` | dic | 字典下拉（编辑必填） | ❌ 仅编辑表单 |

> **查询 vs 编辑**：查询条件始终 `required=0` + `isDic`；编辑表单必填字典用 `required=1` + `idDic`。

## 控件类型（type）

| type | 用途 | 必填属性 | 可选属性 |
|------|------|---------|---------|
| `text` | 文本输入 | `field`, `label`, `format` | `hidden`, `placeholder` |
| `dic` | 字典/下拉 | `field`, `label`, `format`, `dicType` | `dicRemote`, `multiple`, `isreload`, `filtercode` |
| `date` | 日期 | `field`, `label`, `format`, `dateType` | `defaultTime`, `disabledDate` |
| `number` | 数字 | `field`, `label`, `format` | `min`, `max`, `step`, `precision` |
| `cascader` | 级联 | `field`, `label`, `options` | `lazy`, `lazyLoad` |

### dateType 取值

| dateType | 说明 |
|----------|------|
| `date` | 单日期 |
| `datetime` | 日期 + 时间 |
| `daterange` | 日期范围 |
| `datetimerange` | 日期时间范围 |

## 字典字段

字典条件需额外配置：

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
