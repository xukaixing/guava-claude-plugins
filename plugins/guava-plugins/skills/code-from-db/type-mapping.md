# MySQL 类型 → Guava 字段配置映射

> 输入：`get_table_columns` 返回的 `DATA_TYPE` / `COLUMN_TYPE` / `CHARACTER_MAXIMUM_LENGTH` / `NUMERIC_PRECISION` / `NUMERIC_SCALE` / `COLUMN_NAME`。
> 输出：`.md` 配置表里的「类型 / 校验 / 长度 / 扩展」列。
> 校验类型全集见 [../code-frontend/search-conditions.md](../code-frontend/search-conditions.md)。

## 1. 按 DATA_TYPE 映射

| MySQL DATA_TYPE | Guava type | validator | 长度/扩展 | 说明 |
|-----------------|-----------|-----------|----------|------|
| `varchar` / `char`（≤200） | `text` | 见下「文本校验」 | `CHARACTER_MAXIMUM_LENGTH` | 默认 `isAny`；列名含 phone/email/tel 时按规则换 |
| `varchar` / `char`（>200） | `textarea` | `isAny` | `CHARACTER_MAXIMUM_LENGTH` | 长文本转 textarea |
| `text` / `mediumtext` / `longtext` / `tinytext` | `textarea` | `isAny` | 200（无精确长度时给默认） | |
| `tinyint` / `smallint` / `mediumint` / `int` / `bigint` | `number` | `isNumber` | `NUMERIC_PRECISION` | 列名以 status/state/type/level/grade/flag 结尾 → 转 `dic`（见下） |
| `decimal` / `numeric` | `number` | `isDouble` | `NUMERIC_PRECISION`，第 4 位=`NUMERIC_SCALE` | `format: [x,'isDouble',P,S]` |
| `float` / `double` | `number` | `isDouble` | — | 小数位未知时用 `isDouble` 无第 4 位 |
| `date` | `date` | `isDate` | — | 扩展 `dateType: date` |
| `datetime` / `timestamp` | `date` | `isDateTime` | — | 扩展 `dateType: datetime` |
| `time` | `date` | `isTime` | — | 扩展 `dateType: time` |
| `json` / `blob` 等 | `textarea` | `isAny` | 200 | 兜底，人工确认 |

## 2. 文本校验（按列名关键字）

| 列名含 | validator |
|--------|-----------|
| `phone` / `mobile` / `tel`（且为纯手机语义） | `isPhone` |
| `email` / `mail` | `isEmail` |
| `idcard` / `id_no` / `identity` | `isIdcard` |
| `vin` / `chassis` | `isVin` |
| `url` / `link` | `isUrl` |
| `ip` | `isIp` |
| 其余 | `isAny` |

> 以上为**建议**，`COLUMN_COMMENT` 有更明确语义时以注释为准；拿不准保留 `isAny` 并在待确认清单标注。

## 3. 整数转字典（按列名/注释）

命中下列特征 → `type: dic`，validator `isDic`（查询）/ `idDic`（编辑必填）：

- 列名以 `status` / `state` / `type` / `level` / `grade` / `flag` / `category` / `source` / `channel` 结尾
- `COLUMN_COMMENT` 含「状态/类型/级别/字典/枚举」等字样
- 列名是纯 `type`（如 `sys_biz_conf.type`）

> 例外：`is_*` / `has_*` / `deleted` / `del_flag` 这类布尔语义列归为普通 `number` 或剔除，不转字典。

### 3.1 默认 dic 编码（命中即自动填，不再留空）

> 适用前提：字典列数据库类型为整数（`DATA_TYPE` ∈ `int`/`tinyint`/`smallint`/`mediumint`，`COLUMN_TYPE` 形如 `int(6)`）。其余非整数字典列（如 `varchar` 存码）不套用本表，`dic=` 仍留空待确认。

按列名 / 注释匹配（自上而下**命中即停**）：

| # | 命中条件 | dic 编码 |
|---|---------|---------|
| 1 | 列名 = `status` | `yxzt` |
| 2 | 列名 = `sex` | `xb` |
| 3 | `COLUMN_COMMENT` 或列名含「是否」/「if」 | `sf` |
| 4 | 列名 = `biz_type` | `ywlx` |
| 5 | 列名含 `position` 或 `COLUMN_COMMENT` 含「岗位」 | `qdgw` |
| 6 | 其余字典列 | `dic=` 留空，交人工确认 |

- 命中后：`## 表格`「类型」列写 `dic:{编码}`；`## 编辑`「扩展」列写 `dic={编码}`。
- 命名冲突时（如既 `status` 又含「是否」），按上表顺序取先命中项。

## 4. 查询 vs 编辑差异

| 位置 | type | validator | 必填位 |
|------|------|-----------|--------|
| `## 查询` | 同映射 | 字典用 `isDic`，日期范围用 `isDate`+`daterange` | 固定 `0` |
| `## 编辑` | 同映射 | 字典必填用 `idDic`，日期用 `isDate`/`isDateTime` | `IS_NULLABLE=NO` → `Y`，否则空 |

- 查询里「日期/时间」列默认给 `dateType: daterange`（范围检索）。
- `## 表格` 的「类型」列：字典 `dic:{code}`、日期 `date:datetime`、金额 `amount`、其余留空。
