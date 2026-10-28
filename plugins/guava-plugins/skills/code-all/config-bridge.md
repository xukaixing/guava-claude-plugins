# 全栈配置桥接（front .md → backend）

同一 `src/pages/**/*.md` 驱动前后端。前端字段见 [../code-frontend/config-parser.md](../code-frontend/config-parser.md)。

旧字段 `frontendOnly: true/false` **已废弃**（设计器不再输出）：frontmatter 无 `backend:` 块 = 纯前端，**不执行本桥接、不生成后端**；有 `backend:` 块 = 全栈生成。存量文件按此兼容判读。

## YAML 扩展（设计器「后端配置」步骤生成）

```yaml
api:                                  # 由设计器按 backend 配置自动推导，无需手写
  module: admin/userMng
  base: /userMng
  operations:
    list: /userMng/findUsers          # 仅列勾选的操作
    create: /userMng/saveUser
backend:
  module: guava-admin-starter      # Maven 子模块
  package: com.guava.admin         # Java 包根
  feature: userMng                 # 目录/feature
  entity: SysUserPO                # 实体类名（PascalCase(表名)+PO）
  database: guava_demo             # 来源数据库
  tables:                          # 主表 + 关联表（去重）
    - name: sys_user
    - name: sys_dept
  joins:                           # 多表关联（可选）
    - table: sys_dept
      type: left                   # left / inner / right
      left: sys_user.dept_id       # 主表或前序已关联表.字段
      right: sys_dept.id           # 本关联表.字段
  operations: [list, save]         # 勾选操作；list 必选
```

省略 `backend` 块（或手工简写）时**推导**（Interactive 可覆写）：

| YAML | 推导 |
|------|------|
| `api.base: /sysuser` | `feature: sysuser`，`@RequestMapping("/sysuser/")` |
| `backend.tables[0]` | `entity: SysUserPO`（全表名 PascalCase + `PO`） |
| 表名 `sys_notice` | 端点动词 `Notice` → `findNotices` / `saveNotice` / `updateNotice/{id}` / `removeNotice/{id}`（去首段前缀 PascalCase，与 code-from-db Step 3 一致） |
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

前端 ## 查询 表 → 后端 [search-conditions.md](../code-backend/search-conditions.md) 确认表，`field` **字符级一致**。

**别名来源**：查询 field 的表别名双方各自从 md「服务配置(backend)」/「数据表描述」声明的主表别名读取（如 `主表：sys_user（别名 su）` → `su@字段`），**不依赖前端产物传参、不沿用文档示例的 `u@`**。md 未声明别名时查询 field 不带别名。任一端发现别名不一致时，以 md 声明为准生成本端代码并在返回中标注，禁止跨 subagent 发消息返工。

## 输出清单示例（crud-module）

**Phase A（本仓库）**：见 code-frontend config-parser 文件清单。

**Phase B（GUAVA_BACKEND_ROOT）**：

```text
{module}/src/main/java/{package}/controller/{feature}/{Entity}Controller.java
{module}/src/main/java/{package}/service/{feature}/{Entity}Service.java
{module}/src/main/java/{package}/service/{feature}/impl/{Entity}ServiceImpl.java
```

Mapper/SqlProvider 提醒用户按需补充（code-backend Step 5）。
