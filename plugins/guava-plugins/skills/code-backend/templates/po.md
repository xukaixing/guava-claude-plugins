# PO 实体模板

> [\_shared.md](../_shared.md) · [conventions.md](../conventions.md)

生成 `{Entity}PO.java`。参考 `SysCompanyPO.java`：`extends BasePO` + `@Data` + `@EqualsAndHashCode(callSuper = true)` + `@TableName`/`@TableId`/`@TableField`。
DB 驱动生成（`code-from-db`）的补充说明见 [../../code-from-db/backend-entity.md](../../code-from-db/backend-entity.md)。

## 生成流程（实体缺失时必做，避免编译失败）

ServiceImpl 引用了 `{Entity}PO`，实体缺失会导致生成的 Controller/Service 编译不过，故生成前按序执行：

1. `grep -r "class {Entity}PO"` 检查 `GUAVA_BACKEND_ROOT` 是否已存在 → 存在直接引用，不重复生成。
2. 不存在 → **连库读表生成**：mysql-schema `list_tables` 确认表存在（表名 = `{Entity}` PascalCase → snake_case，如 `SysNotice` → `sys_notice`，或按 `backend.feature`），`get_table_columns` 拿精确 `DATA_TYPE` 生成。
3. MCP 不可用 / 表不存在 → 按 `.md` 的 Guava 类型兜底（见下），`number`/`date` 歧义在待确认清单标注。

## 包路径

读 `GUAVA_BACKEND_ROOT` 现有 PO 确定，与 ServiceImpl 的 `import` 保持一致：

| 现有 PO 位置 | package |
|-------------|---------|
| `guava-entity-starter`（`SysCompanyPO` / `SysBizConfPO`，默认） | `com.guava.entity.po` |
| 模块内 `guava-{module}-starter`（`SysNoticePO`） | `com.guava.{module}.model.po` |

## 模板

```java
package {poPackage};

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.guava.component.model.BasePO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>{表注释}（{表名}）po实体类</p>
 * @author: {git user.name} <{git user.email}>
 * @created: {YYYY-MM-DD}
 * @version v1.0.1
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("{表名}")
public class {Entity}PO extends BasePO
{
  /**
   * 主键ID
   */
  @TableId(value = "id", type = IdType.AUTO)
  private Long id;

  /**
   * {字段注释}
   */
  @TableField("{列名}")
  private {JavaType} {camelField};
  // ...每列一条

  public {Entity}PO()
  {
  }
}
```

## 字段来源与 Java 类型映射

字段优先取 mysql-schema `get_table_columns`（精确 `DATA_TYPE`）；无 MCP 时按 `.md` 配置的 Guava 类型映射并在待确认清单标注。

| DB `DATA_TYPE` | Java 类型 |
|----------------|-----------|
| `bigint` | `Long` |
| `int` / `integer` / `mediumint` / `smallint` / `tinyint` | `Integer` |
| `decimal` / `numeric` | `java.math.BigDecimal` |
| `float` | `Float`；`double` | `Double` |
| `datetime` / `timestamp` | `java.time.LocalDateTime` |
| `date` | `java.time.LocalDate` |
| `time` | `java.time.LocalTime` |
| 其余（varchar/char/text/json…） | `String` |

Guava 类型兜底（无 MCP 时）：`text`/`textarea` → `String`；`dic` → `Integer`；`number` → `Integer`（列名含 `id`/`amount`/`price` 或长度 > 9 → `Long`/`BigDecimal`，待确认）；`date` 按 `dateType`：`date` → `LocalDate`、`datetime` → `LocalDateTime`、`time` → `LocalTime`。

- snake_case → camelCase：`notice_title` → `noticeTitle`。
- `@TableField` 值 = 数据库列名**原样**（camelCase 反推 snake_case 时，`cnameEn` 等无下划线边界以 DB 列为准）。

## 关键规则

- PO 继承 `BasePO`（`com.guava.component.model.BasePO`），审计字段（`create_by`/`create_time`/`last_update_by`/`last_update_time`/`del_flag`/`status`/`version`）由基类承载，本表**不重复声明**（除非基类没有）。
- 主键统一 `@TableId(value = "id", type = IdType.AUTO)` + `private Long id`。
- 类头 Javadoc 用 `@author:` / `@created:` / `@version v1.0.1`（区别于 Controller/Service 的 `@since`）。
- 覆盖策略：已存在时保留原 `@created`，仅补充缺失字段；禁止无脑覆盖。
