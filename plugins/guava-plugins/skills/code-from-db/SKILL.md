---
name: code-from-db
description: >
  From MySQL table (mysql-schema MCP). PO-only mode: generate just {Entity}PO
  for one/more tables. Full-stack mode: generate src/pages/*.md then delegate
  to code-frontend (Vue) + code-backend (Java) plus PO / Mapper / MapperXml / DTO.
  Invoke /guava-plugins:code-from-db. No routes/git.
disable-model-invocation: true
---

# code-from-db

> [type-mapping.md](type-mapping.md) · [field-rules.md](field-rules.md) · [backend-entity.md](backend-entity.md)
> 复用 [../code-frontend/SKILL.md](../code-frontend/SKILL.md) · [../code-backend/SKILL.md](../code-backend/SKILL.md) · [../code-all/config-bridge.md](../code-all/config-bridge.md)

**职责**：读 MySQL 表结构 → 映射字段 → 生成 `src/pages/**/*.md` → 委托既有流水线出全栈代码；也支持 **PO-only** 模式只生成 `{Entity}PO`。**不做**：路由、git、字典编码臆造。

---

## 0. 前置

- MCP `mysql-schema` 已连接（`/mcp` 应看到）；`db.yml` 已填——优先放业务工程根 `${CLAUDE_PROJECT_DIR}/db.yml`（每个工程连自己的库），否则用插件 `mcp/mysql-schema/db.yml`（复制 `db.example.yml`）。
- 前端工程已 `pnpm install`（含 `guava-ui`）；后端 `GUAVA_BACKEND_ROOT` 正确指向 Maven/Gradle 多模块根。

---

## 1. 流程

### Step 0：选模式

先与用户确认模式（默认 **full-stack**）：

| 模式 | 产物 |
|------|------|
| **PO-only** | 仅 `{Entity}PO.java`（一张或多张表），走下方「PO-only 快速路径」后结束 |
| **full-stack** | `.md` + 前端 Vue/api + 后端 Controller/Service/ServiceImpl + PO/Mapper/MapperXml/DTO，继续 Step 1–7 |

### PO-only 快速路径

1. `list_tables` → 用户指定一张或多张表（如 `sys_company`、`sys_biz_conf`）。
2. 逐张 `get_table_columns({database, table})` + `get_table_comment`。
3. 推导 `Entity`（表名 → PascalCase）、后端 `module`/`package`、目标路径 `<module>/src/main/java/<pkg>/model/po/{Entity}PO.java`，展示确认后再写。
4. 按 [backend-entity.md](backend-entity.md) §2 只生成 `{Entity}PO.java`：`extends BasePO` + `@Data` + `@EqualsAndHashCode(callSuper = true)` + `@TableName("{表名}")` + 主键 `@TableId(value="id", type=IdType.AUTO)` + 每列 `@TableField("{列名}")`；JavaType 映射见 §2 表。
5. **不生成**：Mapper / MapperXml / DTO / `src/pages/*.md` / 前端 / Controller / Service / ServiceImpl。
6. 收尾：`lint-fix.sh` Java 格式化无报错；输出待人工确认清单（包路径、作者、审计字段剔除）。

### Step 1：选表

1. MCP `list_tables`（可带 `database`）→ 展示表清单（表名 + 注释）。
2. 用户选一张或多张表（批量时逐张走 Step 2–6）。

### Step 2：读字段

MCP `get_table_columns({database, table})` + `get_table_comment` → 拿到：
`COLUMN_NAME / COLUMN_TYPE / DATA_TYPE / COLUMN_KEY / IS_NULLABLE / COLUMN_COMMENT / CHARACTER_MAXIMUM_LENGTH / NUMERIC_PRECISION / NUMERIC_SCALE / EXTRA`。

### Step 3：推导命名（生成前必须展示确认）

| 项 | 推导规则 | 示例（表 `sys_notice`） |
|----|---------|------------------------|
| `feature` | 表名 → camelCase | `sysNotice` |
| `title` | `TABLE_COMMENT`，空则表名 | `公告` |
| `entity` | 表名 → PascalCase | `SysNotice` |
| `view` | `<domain>/<feature>`，`domain`=表名第一个下划线段（无则 database），可覆写 | `sysMng/sysNotice` |
| `apiBase` | `/<feature 小写去下划线>` | `/sysnotice` |
| `find` 端点 | `{apiBase}/find{Entity 去 Sys 前缀}s` | `/sysnotice/findNotices` |
| `save` 端点 | `{apiBase}/save{Entity 去 Sys 前缀}` | `/sysnotice/saveNotice` |
| `update` 端点 | `{apiBase}/update{Entity 去 Sys 前缀}/{id}` | `/sysnotice/updateNotice/{id}` |
| `delete` 端点 | `{apiBase}/remove{Entity 去 Sys 前缀}/{id}` | `/sysnotice/removeNotice/{id}` |
| 后端模块/包 | 读 `GUAVA_BACKEND_ROOT` 下同模块实现确定（默认 `guava-admin-starter` / `com.guava.admin`） | — |

> 命名仅作起点，Step 3 用「确认表」展示，允许用户逐项覆写后再写 `.md`。

### Step 4：字段映射

逐列按 [field-rules.md](field-rules.md) 分类（主键 / 审计 / 字典 / 普通），再按 [type-mapping.md](type-mapping.md) 映射为 Guava 字段配置：

- 生成 `## 查询`（可搜字段，field 带 `u@`，校验必填，必填位固定 `0`）
- 生成 `## 表格`（展示字段，`prop` 不带 `u@`，字典/日期/金额列写「类型」）
- 生成 `## 操作列`（默认 `编辑,删除`）
- 生成 `## 编辑`（非主键/审计字段；`IS_NULLABLE=NO` → 必填 `Y`）

### Step 5：写 `.md`

Write `src/pages/<domain>/<feature>.md`（覆盖策略见下方）。YAML 头 + `backend:` 块（module/package/feature/entity）。

### Step 6：委托既有流水线

1. **Phase A 前端**：严格按 [../code-frontend/SKILL.md](../code-frontend/SKILL.md) 用刚写的 `.md` 生成 Vue/api/helper/types/i18n（写 template 前查 MCP `get_page_recipe` / `gv-*`）。
2. **Phase B 后端**：严格按 [../code-backend/SKILL.md](../code-backend/SKILL.md) 生成 Controller/Service/ServiceImpl。
3. **补齐实体层**：按 [backend-entity.md](backend-entity.md) 生成 `{Entity}PO` / `{Entity}Mapper` / `{Entity}Mapper.xml` / DTO（`code-backend` 不生成这些，须由本 skill 从表结构生成）。

### Step 7：收尾

- 输出「待人工确认」清单（字典编码 `dic=xxx`——默认表已命中者自动填、未命中者留空待补；精确 validator `isPhone/isEmail/...`；中文标签是否按 `COLUMN_COMMENT` 修正；`domain`/`apiBase` 命名）。
- hooks `lint-fix.sh` 无报错（前端 eslint + 后端 java format）。

---

## 2. `.md` 产物模板

```markdown
---
feature: sysNotice
title: 公告
view: sysMng/sysNotice
pageType: crud-module
layout: module
editPage: true
i18n: false
api:
  module: admin/sysNotice
  base: /sysnotice
  operations:
    list: /sysnotice/findNotices
    create: /sysnotice/saveNotice
    update: /sysnotice/updateNotice/{id}
    delete: /sysnotice/removeNotice/{id}
backend:
  module: guava-admin-starter
  package: com.guava.admin
  feature: sysnotice
  entity: SysNoticePO
---

## 查询
| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| 公告标题 | u@noticeTitle | text | isAny | 200 | |

## 表格
| 名称 | 字段 | 宽度 | 筛选 | 类型 |
| 公告标题 | noticeTitle | 200 | Y | |
| 公告状态 | noticeStatus | 100 | | dic:noticeStatus |
| 发布日期 | releaseDate | 180 | | date:datetime |

## 操作列
编辑,删除

## 编辑
| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读 | 占用列 | 扩展 |
| 公告标题 | noticeTitle | text | Y | isAny | 200 | N | 1 | |
| 公告内容 | noticeContent | textarea | | isAny | 200 | N | 3 | |
| 公告状态 | noticeStatus | dic | Y | idDic | 6 | N | 1 | dic= |
| 发布日期 | releaseDate | date | | isDate | | N | 1 | dateType: datetime |
```

---

## 3. 关键约束

| 约束 | 说明 |
|------|------|
| **字典编码** | 按 [type-mapping.md §3.1](type-mapping.md) 默认表命中即自动填（`status→yxzt`、`sex→xb`、含「是否/if」→`sf`、`biz_type→ywlx`、`position/岗位→qdgw`）；未命中 `dic=` 留空，Step 7 交人工确认 |
| **主键不入编辑** | `COLUMN_KEY=PRI` 不进 `## 编辑`；`update/remove` 路径用 `{id}` |
| **审计字段** | `create_time/update_time/create_by/update_by/deleted/...` 编辑只读或剔除 |
| **查询 field 带 `u@`** | 表格/编辑不带；与后端 `MyUtil.getConditionsWhere` 对齐 |
| **校验必填** | 查询/编辑每条 FormItem 的 `format` 第二位 validator 必填 |
| **实体层本 skill 生成** | PO/Mapper/MapperXml/DTO 走 [backend-entity.md](backend-entity.md)，不走 code-backend |
| **PO-only 只出 PO** | PO-only 模式只写 `{Entity}PO.java`，不生成 Mapper/MapperXml/DTO/`.md`/前端/Controller |
| **先确认再写** | Step 3 命名 + Step 4 字典字段须经用户确认 |
