# 后端上下文（按需）

> 流程 `skills/code-backend/SKILL.md` · 规范 `skills/code-backend/conventions.md`

## 工程根路径

优先 `settings.json` / `settings.local.json` 中的 **`GUAVA_BACKEND_ROOT`**（Maven 多模块根，含 `pom.xml`）。

未配置时默认：`${CLAUDE_PROJECT_DIR}/../guava-admin`（按本机实际调整）。

生成 Java 写入该目录下模块，例如：

```text
{GUAVA_BACKEND_ROOT}/guava-admin-starter/src/main/java/com/guava/admin/
├── controller/{feature}/
├── service/{feature}/
└── ...
```

## 与前端对齐

| 前端配置 | 后端 |
|----------|------|
| `apiBase: /sysuser` | `@RequestMapping("/sysuser/")` 或 feature 段一致 |
| `paths.find/save/...` | Controller 端点同名 |
| 查询表 `field` | `MyUtil.getConditionsWhere` 字段一致（见 `search-conditions.md`） |
| 表格列 `dicType` | `getTransHash()` 字典翻译自动收集 |
| 扩展端点标记（状态更新/导出） | 对应 Controller/Service 方法 |

## 服务配置(backend) 格式（设计器导出）

```markdown
## 服务配置(backend)

### 基本信息

- 工程：/Users/.../guava-admin-starter
- 包路径：com.guava.admin
- 功能：sysuser
- 请求上下文：/sysuser
- Swagger Tag：admin-sysuser
- 数据库：guava_demo
- 实体：SysUserPO

### 服务逻辑描述

- 操作：查询、保存、更新
- 状态更新：updateSysUserStatus（启用/停用）
- 导出：exportSysUserData（Excel）
- 逻辑描述：查询用户列表时左关联部门表获取部门名称

### 字典翻译

- status：dic|yxzt
- sex：dic|xb
- deptId：dept|o
- createTime：date|yyyy-MM-dd HH:mm:ss

### 数据表描述

- 主表：sys_user（别名 u）
- 关联：LEFT JOIN sys_dept（别名 d） ON u.dept_id = d.id
- 表逻辑：用户表左关联部门表获取部门名称
```

## 环境

- JDK **>= 25**，编译等级 **>= 25**

## 命令

```bash
# 在 GUAVA_BACKEND_ROOT 下（需 JDK >= 25）
mvn -pl guava-admin-starter -am compile -q
mvn spotless:apply          # 若项目已配 spotless
```

## 生成后 hook

`hooks/lint-fix.sh` 对 `.java` 走 **IDEA headless format**（按批执行）；细节见 `skills/code-backend/SKILL.md` Step 7 与 `${CLAUDE_PLUGIN_ROOT}/hooks/lint-fix.sh`。

## guava-backend MCP

写代码前必查（工具表、查询预算、**框架优先**原则）见 `skills/code-backend/SKILL.md` Step 0；快照由作者机 `node mcp/generate-backend.mjs` 刷新。
