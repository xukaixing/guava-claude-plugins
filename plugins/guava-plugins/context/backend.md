# 后端上下文（按需）

> 流程 `skills/code-backend/SKILL.md` · 规范 `skills/code-backend/conventions.md`

## 工程根路径

md `## 服务配置(backend)` 的「工程」字段（绝对路径，如 `/.../guava-admin-starter`）**优先**，直接作为生成文件的磁盘位置。

未声明时：优先 `settings.json` / `settings.local.json` 中的 **`GUAVA_BACKEND_ROOT`**（Maven 多模块根，含 `pom.xml`）。

也未配置时默认：`${CLAUDE_PROJECT_DIR}/../guava-admin`（按本机实际调整）。

生成 Java 写入工程目录下模块，例如：

```text
{工程}/src/main/java/{包路径}/
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

- 工程：/Users/.../guava-admin-starter      # 生成文件的磁盘绝对位置（Maven 子模块根）
- 包路径：com.guava.admin                    # Java 主包根
- 功能：usermng1                             # controller/service 目录名
- 数据库实例：guava_sys                      # mysql-schema 连库依据
- 请求上下文：/sysuser1                      # @RequestMapping("/sysuser1/")
- Swagger Tag：admin-usermng1               # @Tag(name = "admin-usermng1")
- 实体：SysUserPO                            # PO 类名（model/po/SysUserPO.java）

### 服务逻辑描述

- 操作：查询、保存、更新                    # 查询→find{Entity} / 保存→save{Entity} / 更新→update{Entity}；查询必选
- 状态更新：updateSysUserStatus（启用/停用）
- 导出：exportSysUserData（Excel）
- 逻辑描述：查询用户列表时左关联部门表获取部门名称

### 字典翻译

- status：dic|yxzt
- sex：dic|xb
- deptId：dept|o
- createTime：date|yyyy-MM-dd HH:mm:ss

### 列表数据表

- 用户信息列表（主画布）：数据库 guava_sys；表 sys_user（别名 su）
  - 查询列：userName、account、status、deptId、createTime
- 登录日志列表：数据库 guava_sys；表 sys_login_log（别名 sl）
  - 查询列：userName、loginTime、ip
```

- `### 列表数据表`：**每行 = 一个画布列表 = 一套独立查询方法与 SQL**（各自 `find{Xxx}` Controller/Service/ServiceImpl 方法 + SqlProvider SQL，FROM 表 / 别名 / SELECT 列按该行声明，互不共用）；`（主画布）` 标记 = 页面主列表，方法名取 `api.operations.list` 末段，其余列表按列表名去「列表」后缀转 PascalCase 推导
- 该行同时提供查询 field 表别名来源（`su@字段`）与 PO 生成的表名 / 库名（主画布列表）
- 多表 JOIN 时 md 可另带 `### 数据表描述`（旧版/手写格式）：

```markdown
### 数据表描述

- 主表：sys_user（别名 u）
- 关联：LEFT JOIN sys_dept（别名 d） ON u.dept_id = d.id
- 表逻辑：用户表左关联部门表获取部门名称
```

两处表名冲突时以 `### 列表数据表` 为准。

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
