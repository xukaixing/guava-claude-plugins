# 全栈配置桥接（front .md → backend）

同一 `src/pages/**/*.md` 驱动前后端。前端字段见 [../guava-front/config-parser.md](../guava-front/config-parser.md)。

## YAML 扩展（可选）

```yaml
backend:
  module: guava-admin-starter      # Maven 子模块
  package: com.guava.admin         # Java 包根
  feature: sysuser                 # 目录/feature，通常与 apiBase 去 / 后一致
  entity: SysUserPO                # 实体类名
  swaggerTag: admin-sysuser        # 可选，默认 admin-{feature}
```

省略 `backend` 块时**推导**（Interactive 可覆写）：

| YAML | 推导 |
|------|------|
| `apiBase: /sysuser` | `feature: sysuser`，`@RequestMapping("/sysuser/")` |
| `feature: userMng` | `entity: UserPO` 或按业务确认 |
| `api: admin/user` | `module: guava-admin-starter`，`package: com.guava.admin` |

## CRUD 对齐

| 前端 `crud` | 后端生成 |
|-------------|----------|
| `search` | `findXxx` POST + 查询表 → SqlProvider 条件 |
| `add` | `saveXxx` POST |
| `edit` | `updateXxx` PUT |
| `delete` | `removeXxx` POST |
| `load, save`（form-only） | `getByKey` + `save` |

`paths.*` 末段 → Controller `@PostMapping`/`@PutMapping` 路径，与 `src/api/*.ts` 一致。

## 查询 field

前端 ## 查询 表 → 后端 [search-conditions.md](../guava-backend/search-conditions.md) 确认表，`field` **字符级一致**。

## 输出清单示例（crud-module）

**Phase A（本仓库）**：见 guava-front config-parser 文件清单。

**Phase B（GUAVA_BACKEND_ROOT）**：

```text
{module}/src/main/java/{package}/controller/{feature}/{Entity}Controller.java
{module}/src/main/java/{package}/service/{feature}/{Entity}Service.java
{module}/src/main/java/{package}/service/{feature}/impl/{Entity}ServiceImpl.java
```

Mapper/SqlProvider 提醒用户按需补充（guava-backend Step 5）。
