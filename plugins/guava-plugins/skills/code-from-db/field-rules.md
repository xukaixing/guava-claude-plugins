# 列分类规则（表结构 → 配置表字段）

> 决定每列进入 `## 查询` / `## 表格` / `## 编辑` 的哪一张，以及是否只读/剔除。

## 1. 分类优先级（自上而下命中即停）

| # | 规则 | 命中 | 处理 |
|---|------|------|------|
| 1 | `COLUMN_KEY = PRI` 且 `EXTRA` 含 `auto_increment` | 自增主键 `id` | **不进入任何配置表**；`update/remove` 路径用 `{id}`；后端 PO 用 `@TableId` |
| 2 | 列名 ∈ `create_time, update_time, create_by, update_by, last_update_by, last_update_time, last_update_date, create_date, update_date, deleted, del_flag, is_delete, version, tenant_id` | 审计/平台字段 | `## 编辑` 剔除（或只读）；`create_time` 可放 `## 表格` |
| 3 | `COLUMN_COMMENT` 含「状态/类型/级别/字典」或列名命中 [type-mapping.md §3](type-mapping.md) | 字典列 | 进三张表，`type: dic`；`dic=` 按 [type-mapping.md §3.1](type-mapping.md) 默认编码表自动填，未命中留空 |
| 4 | 其余 | 业务字段 | 进三张表（长文本不默认进查询/表格） |

## 2. 标签（`名称` 列）

- `COLUMN_COMMENT` 非空 → 用注释原文（去掉「编号/ID」等冗余尾缀可酌情）。
- 空 → snake_case 直译占位（`notice_title` → `公告标题`），并在待确认清单标注。

## 3. 必填（`## 编辑` 必填列）

- `IS_NULLABLE = 'NO'` 且非主键/审计/有默认值 → `Y`
- `IS_NULLABLE = 'YES'` 或 `COLUMN_DEFAULT` 非空 → 空（非必填）
- 主键 / 审计字段不进编辑，不涉及。

## 4. 占用列（`## 编辑` 占用列）

| 情况 | 占用列 |
|------|--------|
| 长文本 `textarea` / 长描述 | `2` 或 `3` |
| 普通字段 | `1` |

## 5. 查询字段选取建议

- 默认把「可搜索的业务字段」放入 `## 查询`：名称/编号/编码/状态/类型/日期等。
- 长文本（textarea）、主键、审计字段默认**不进**查询。
- 查询 field 加 `u@` 前缀（后端 `MyUtil.getConditionsWhere` 表别名约定），表别名默认 `u`。

## 6. 表格字段选取建议

- 默认展示：主键可省；审计 `create_time` 可带；其余业务字段尽量全列。
- 宽表（>8 列）可只放核心列，其余进编辑；在待确认清单说明裁剪。

## 7. 待人工确认清单（Step 7 输出）

每次生成后汇总以下项交给用户：
1. 字典编码（`dic=xxx`）——[type-mapping.md §3.1](type-mapping.md) 默认表已命中的字段自动填（仍应人工复核语义是否正确）；未命中的必须补。
2. 精确 validator（`isPhone` / `isEmail` / `isIdcard` 等）是否改。
3. 中文标签是否按 `COLUMN_COMMENT` 二次修正。
4. `view` 的 `domain`、`apiBase`、端点命名是否按团队规范调整。
