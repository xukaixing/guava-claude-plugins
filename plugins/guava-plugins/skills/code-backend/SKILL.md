---
name: code-backend
description: >
  Backend: Spring Boot Controller/Service/ServiceImpl under GUAVA_BACKEND_ROOT.
  Invoke /guava-plugins:code-backend. Read context/backend.md + this SKILL.
  由 guava-codegen 以独立 subagent 执行，勿与其他端 skill 混载。
disable-model-invocation: true
---

# code-backend

> [\_shared.md](_shared.md) · [conventions.md](conventions.md) · [code-review.md](code-review.md) · [../../context/backend.md](../../context/backend.md) · [MCP](../../mcp/guava-backend/README.md)

**工作流文档一次性读取**（省 API 往返）：动手生成前，在**一条消息内**并行 Read 本任务涉及的全部工作流文档——`SKILL.md`、[_shared.md](_shared.md)、[conventions.md](conventions.md)、[search-conditions.md](search-conditions.md)、[templates/](templates/)（controller.md / service.md / service-impl.md；po.md 待 Step 4.5 确认 PO 不存在时再读）、[../../context/backend.md](../../context/backend.md)。生成过程中直接复用已读内容，**禁止二次 Read**（仅当上下文压缩导致内容丢失时才允许重读个别文件）。

## 流程

Step 0：**guava-backend MCP 必查**（同轮复用，禁止重复查询）：

| 时机 | 工具 |
|------|------|
| 写任何后端代码前 | `get_stack`（模块分层 / 版本 / 职责），整轮 1 次 |
| 写任何工具逻辑前（日期 / 加密 / 字符串 / JSON / 文件 / IP…） | `list_utils` 或 `search_utils`（按用途关键字）→ 命中后 `get_util` 确认签名，整轮 ≤ 3 次 |
| 用到注解 / 平台服务 / 组件类时 | `search_platform_classes`（用精确类名，整轮 ≤ 3 次），结果当轮复用；utils 类不在其中，走上一行 |
| 需要引入新三方依赖时 | `search_dependencies`（版本以 parent-starter BOM 为准） |

**框架优先原则**：工具/断言/常量/翻译/导出/加解密等能力，**必须优先复用 entity / component / platform 三层框架已提供**的类（utils 工具逻辑先经 `list_utils` / `search_utils` / `get_util`，其余经 `search_platform_classes` 确认签名后使用），**禁止自造等价实现**。详见 [conventions.md §常用工具类](conventions.md)。

Step 0.1：**grep 优先，不整读大文件**——`grep -rl "class {Entity}" $GUAVA_BACKEND_ROOT --include=*.java` 确认目标模块是否已有同类实现；仅在需要覆盖 / 端点对齐时 Read 具体文件的相关方法段，**不整读参考大文件**。

Step 1：Module、package、Feature、Entity、RequestMapping、Swagger Tag（见 context/backend.md）。

Step 1.0：**服务配置(backend) 小节消费**（设计器「后端配置」步骤产物，**优先级最高**：覆盖 GUAVA_BACKEND_ROOT 推导与 Interactive 确认）：

解析 `## 服务配置(backend)` 小节（完整格式见 [context/backend.md §服务配置(backend) 格式](../../context/backend.md)）。各小节消费规则：

**### 基本信息**（逐项消费）：

| 字段 | 用途 |
|------|------|
| 工程 | 生成文件的磁盘绝对位置（Maven 子模块根，如 `/.../guava-admin-starter`）→ **直接作为输出根**，覆盖 `GUAVA_BACKEND_ROOT` 推导 |
| 包路径 | Java 主包根（如 `com.guava.admin`），文件写入 `{工程}/src/main/java/{包路径}/` |
| 功能 | controller/service 目录名（如 `usermng1`）→ `controller/{功能}/`、`service/{功能}/` |
| 数据库实例 | mysql-schema 连库依据：PO 生成、表存在校验（Step 4.5） |
| 请求上下文 | Controller `@RequestMapping("/sysuser1/")` |
| Swagger Tag | `@Tag(name = "admin-usermng1")`，缺失默认 `admin-{功能}` |
| 实体 | PO 类名（`model/po/{实体}.java`），并决定 Controller/Service/ServiceImpl/Mapper/SqlProvider 命名 |

**### 服务逻辑描述**（仅生成勾选操作，「查询」必选）：

| 标记 | 生成 |
|------|------|
| 操作：查询 | `find{Entity}` 端点 |
| 操作：保存 | `save{Entity}` 端点 |
| 操作：更新 | `update{Entity}` 端点 |
| 状态更新 | 额外生成 `update{Entity}Status` 端点 |
| 导出 | 额外生成 `export{Entity}Data` 端点（Excel） |
| 逻辑描述 | 业务逻辑备注（供 ServiceImpl 参考） |

**### 字典翻译**：每行 `- field：dic\|xx` → `getTransHash()` 配置（详见 Step 5.1）。

**### 列表数据表**（设计器「列表画布」产物，**每行 = 一个列表 = 一套独立查询方法与 SQL**）：

```markdown
- 用户信息列表（主画布）：数据库 guava_sys；表 sys_user（别名 su）
  - 查询列：userName、account、status、text_4、deptId、text_10
- 登录日志列表：数据库 guava_sys；表 sys_login_log（别名 sl）
  - 查询列：userName、loginTime、ip
```

| 项 | 用途 |
|----|------|
| 列表名（主画布） | 与 `## 表格 - <描述>` 同名列表对应；`（主画布）` 标记 = 页面主列表 |
| 数据库 + 表（别名） | 该列表 SqlProvider `FROM {表} {别名}`；查询 field 表别名来源（`su@字段`，见 Step 1.1）；Step 4.5 PO 生成的表名 / 库名来源（主画布列表） |
| 查询列 | 该列表 SqlProvider SELECT 列（`db_column camelAlias`，驼峰别名与前端表格 prop 对齐） |

**多列表生成规则**：每个列表各生成一套 `find{Xxx}` 方法（Controller + Service + ServiceImpl + SqlProvider SQL），方法名与 SQL 互不共用——
- 主画布列表：方法名取 frontmatter `api.operations.list` 末段（如 `findUsers`）
- 其余列表：按列表名去「列表」后缀转 PascalCase 推导（如 `登录日志列表` → `findLoginLog`），全栈时与前端对齐参数核对
- 每套 SQL 的 FROM 表 / 别名 / SELECT 列严格按该行声明，不跨列表合并、不共用 SqlProvider 方法

md 另有 `### 数据表描述`（旧版/手写，主表 + 关联 JOIN）时用于多表 JOIN 配置；两处表名冲突以 `### 列表数据表` 为准。

Step 1.1：查询条件（必选，[search-conditions.md](search-conditions.md)，field 与前端一致）。

Step 1.1a：**查询 SQL 规则**——单表走 `MyUtil.getConditionsWhere` 模式（context/backend.md §对齐表），FROM 表与 SELECT 列按 `### 列表数据表` 生成；多表按 `### 数据表描述` 的 JOIN 配置生成 JOIN 查询（SELECT 列带表别名，WHERE 条件同样走条件构造器，不拼用户原始入参）。设计器只存配置不生成 SQL，SQL 一律由本 skill 生成。

Step 1.2：业务字段（add/edit 时）。

Step 1.3：CRUD（禁止默认全开，查询必选）。

Step 2–4：**并发 Write** Controller / Service / ServiceImpl（一条消息内多个 Write 调用；覆盖策略 [_shared.md](_shared.md)）；模板已在上文一次性读取——controller.md / service.md / service-impl.md 直接复用，**po.md 先查后读**（见 Step 4.5）：

| 文件 | 模板 |
|------|------|
| Controller | [controller.md](templates/controller.md) |
| Service | [service.md](templates/service.md) |
| ServiceImpl | [service-impl.md](templates/service-impl.md) |

Step 4.5：PO 实体（ServiceImpl 引用 `{Entity}PO`，缺失则编译失败，**必做**）：

1. 先 `grep -r "class {Entity}PO" $GUAVA_BACKEND_ROOT --include=*.java` → **已存在则直接引用，不读 [po.md](templates/po.md)，跳过生成**。
2. 没有 → **连库读表生成**：表名 / 数据库实例**优先取 `### 列表数据表` 声明**（`表 sys_user` / `数据库 guava_sys`）；未声明时按 `{Entity}` PascalCase → snake_case 推导（如 `SysNotice` → `sys_notice`）。mysql-schema `list_tables` 确认表存在后，`get_table_columns` 拿精确 `DATA_TYPE` 生成 `{Entity}PO.java`。
3. MCP 不可用 / 表不存在 → 按 `.md` 的 Guava 类型映射兜底生成，`number`/`date` 歧义在待确认清单标注。

Step 5：Mapper/SqlProvider、`getTransHash()`、`@MarkLog`、与前端 `paths` 对齐。

Step 5.1：**`getTransHash()` 字典翻译**——从 `### 字典翻译` 小节逐条写入 `transHash.put(field, transValue)`。规则详见 [conventions.md §字典翻译](conventions.md)；无该小节时仅翻译 `createTime`。

Step 6 — 本次生成代码检查（必做，速查优先）：

先凭刚写完的内容速查：包路径 / 命名与前端 `paths` 对齐；写操作有 `@MarkLog` + `AssertMyUtil` 校验；查询条件走 `MyUtil.getConditionsWhere`，不拼用户原始入参；列表查询分页；无循环内单条查库；Javadoc 齐全（`<p>` + 标准 `@param`/`@return`/`@since`，声明 `throws` 的方法带 `@throws` 中文说明）、覆盖时保留原 `@since`；工具方法已 static import、`HashMap.newHashMap(16)`、接口 `throws IOException` 的实现按实际收窄；工具/常量/翻译等能力复用三层框架现成类、未自造。

全过 → 输出三行简报（`规范 / 安全 / 性能：通过（速查）`）；任一可疑 → Read [code-review.md](code-review.md) 深检，Critical 须修复并再检。

Step 7：Step 6 通过 · IDEA 格式化已生效（`hooks/lint-fix.sh` 对 Java 走 IDEA headless format，等价 IDE 保存格式化；Stop 时校验，失败须修复后再结束）。
