# 后端实体层生成（PO / Mapper / MapperXml / DTO）

> `code-backend` 只生成 Controller/Service/ServiceImpl，**不生成实体层**。本 skill 从表结构直接生成这四类，写入 `GUAVA_BACKEND_ROOT` 对应模块。
> 包结构遵循 `guava-pro/guava-admin-starter/src/main/resources/generator.yml` 的 `defineChildPackage`：`controller / service / impl / repository / model.po / model.dto`。

## 参考实现

- **`guava-entity-starter/.../SysCompanyPO.java`（首选参考）**：`extends BasePO` + `@Data` + `@EqualsAndHashCode(callSuper = true)` + `@TableName`/`@TableId`/`@TableField`，字段注释原文取自 `COLUMN_COMMENT`。
- `guava-entity-starter/.../SysBizConfPO.java`（同风格精简版）
- `guava-admin-starter/.../SysNoticePO.java`（`@Schema` + `@Getter/@Setter` 版，需要 Swagger 注解时选它）

## 1. 目标文件

| 文件 | 路径（以 `module=guava-admin-starter`、`package=com.guava.admin`、entity=`SysNotice`、表=`sys_notice` 为例） |
|------|------|
| PO | `guava-admin-starter/src/main/java/com/guava/admin/model/po/SysNoticePO.java` |
| Mapper | `guava-admin-starter/src/main/java/com/guava/admin/repository/SysNoticeMapper.java` |
| MapperXml | `guava-admin-starter/src/main/resources/mapper/SysNoticeMapper.xml` |
| DTO | `guava-admin-starter/src/main/java/com/guava/admin/model/dto/SysNoticeDTO.java`（可选） |

> 若目标模块已有同名 PO（如 `guava-entity-starter` 已存在），不重复生成，改为引用。

## 2. PO 模板

> 通用 PO 模板已沉淀到 [../code-backend/templates/po.md](../code-backend/templates/po.md)；本节给出 DB 驱动（`DATA_TYPE`）的 JavaType 映射。

```java
package com.guava.{package 末段}.model.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.guava.component.model.BasePO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>{tableComment}（{tableName}）po实体类</p>
 * @author: {git user.name} <{git user.email}>
 * @created: {YYYY-MM-DD}
 * @version v1.0.1
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("{tableName}")
public class {Entity}PO extends BasePO
{
  /** 编号 */
  @TableId(value = "id", type = IdType.AUTO)
  private Long id;

  /** {columnComment} */
  @TableField("{snake_col}")
  private {JavaType} {camelField};
  // ...每列一条

  public {Entity}PO()
  {
  }
}
```

### JavaType 映射

| MySQL DATA_TYPE | Java 类型 |
|-----------------|-----------|
| `bigint` | `Long` |
| `int` / `integer` / `mediumint` | `Integer` |
| `smallint` / `tinyint` | `Integer`（布尔语义可 `Integer`） |
| `decimal` / `numeric` | `java.math.BigDecimal` |
| `float` | `Float`；`double` | `Double` |
| `datetime` / `timestamp` | `java.time.LocalDateTime` |
| `date` | `java.time.LocalDate` |
| `time` | `java.time.LocalTime` |
| 其余（varchar/char/text/json…） | `String` |

- snake_case → camelCase：`notice_title` → `noticeTitle`。
- `@TableField` 值 = 数据库列名原样。

## 3. Mapper 模板

```java
package com.guava.{package 末段}.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.guava.{package 末段}.model.po.{Entity}PO;

/**
 * <p>{tableComment} mapper</p>
 * @author: {git user.name} <{git user.email}>
 * @created: {YYYY-MM-DD}
 */
public interface {Entity}Mapper extends BaseMapper<{Entity}PO>
{
}
```

> 后续需要自定义查询时再追加方法（`code-backend` Step 5 的 SqlProvider）。

## 4. MapperXml 模板

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.guava.{package 末段}.repository.{Entity}Mapper">

</mapper>
```

> 查询 SQL 由 `code-backend` 的 SqlProvider 追加（见 [../code-backend/search-conditions.md](../code-backend/search-conditions.md) 的 SqlProvider 模板）。

## 5. DTO 模板（可选，`isGeneratePackage.dto=true` 时）

```java
package com.guava.{package 末段}.model.dto;

import lombok.Data;

/**
 * <p>{tableComment} dto</p>
 */
@Data
public class {Entity}DTO
{
  /** {columnComment} */
  private {JavaType} {camelField};
  // ...镜像 PO（去掉继承的审计字段）
}
```

## 6. 关键规则

- PO 继承 `BasePO`（`com.guava.component.model.BasePO`），审计字段由基类承载，本表自己的 `create_time/update_time` 等不重复声明（除非基类没有）。
- 主键统一 `@TableId(value="id", type=IdType.AUTO)` + `private Long id`。
- 类头 Javadoc 对齐 `SysNoticePO`：`@author` / `@created` / `@version v1.0.1`。
- 覆盖策略：已存在同文件时**保留**原 `@since`/`@created`，仅补充缺失字段；禁止无脑覆盖。
