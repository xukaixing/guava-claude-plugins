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

## 流程

Step 0：**guava-backend MCP 必查**（同轮复用，禁止重复查询）：

| 时机 | 工具 |
|------|------|
| 写任何后端代码前 | `get_stack`（模块分层 / 版本 / 职责），整轮 1 次 |
| 用到工具类 / 注解 / 平台服务时 | `search_platform_classes`（用精确类名，整轮 ≤ 3 次），结果当轮复用 |
| 需要引入新三方依赖时 | `search_dependencies`（版本以 parent-starter BOM 为准） |

**框架优先原则**：生成代码中凡工具方法、断言、常量、翻译、导出、加解密、上下文取值等能力，**必须优先复用 entity / component / platform 三层框架已提供**的 util / service / 注解 / 常量（经 `search_platform_classes` 确认类与签名后使用），**禁止自造等价实现**（不手写判空工具、不 new 翻译器、不自定义业务异常码）。框架能力不够时才允许扩展，并在待确认清单标注。

Step 0.1：**grep 优先，不整读大文件**——`grep -rl "class {Entity}" $GUAVA_BACKEND_ROOT --include=*.java` 确认目标模块是否已有同类实现；仅在需要覆盖 / 端点对齐时 Read 具体文件的相关方法段，**不整读参考大文件**。

Step 1：Module、package、Feature、Entity、RequestMapping、Swagger Tag（见 context/backend.md）。

Step 1.1：查询条件（必选，[search-conditions.md](search-conditions.md)，field 与前端一致）。

Step 1.2：业务字段（add/edit 时）。

Step 1.3：CRUD（禁止默认全开，查询必选）。

Step 2–4：**并发 Write** Controller / Service / ServiceImpl（一条消息内多个 Write 调用；覆盖策略 [_shared.md](_shared.md)）；模板按需读取——controller.md / service.md / service-impl.md 必读，**po.md 先查后读**（见 Step 4.5）：

| 文件 | 模板 |
|------|------|
| Controller | [controller.md](templates/controller.md) |
| Service | [service.md](templates/service.md) |
| ServiceImpl | [service-impl.md](templates/service-impl.md) |

Step 4.5：PO 实体（ServiceImpl 引用 `{Entity}PO`，缺失则编译失败，**必做**）：

1. 先 `grep -r "class {Entity}PO" $GUAVA_BACKEND_ROOT --include=*.java` → **已存在则直接引用，不读 [po.md](templates/po.md)，跳过生成**。
2. 没有 → **连库读表生成**：mysql-schema `list_tables` 确认表存在（表名 = `{Entity}` PascalCase → snake_case，如 `SysNotice` → `sys_notice`，或按 `backend.feature`），`get_table_columns` 拿精确 `DATA_TYPE` 生成 `{Entity}PO.java`。
3. MCP 不可用 / 表不存在 → 按 `.md` 的 Guava 类型映射兜底生成，`number`/`date` 歧义在待确认清单标注。

Step 5：Mapper/SqlProvider、`getTransHash()`、`@MarkLog`、与前端 `paths` 对齐。

Step 6 — 本次生成代码检查（必做，速查优先）：

先凭刚写完的内容速查：包路径 / 命名与前端 `paths` 对齐；写操作有 `@MarkLog` + `AssertMyUtil` 校验；查询条件走 `MyUtil.getConditionsWhere`，不拼用户原始入参；列表查询分页；无循环内单条查库；Javadoc 齐全（`<p>` + 标准 `@param`/`@return`/`@since`，声明 `throws` 的方法带 `@throws` 中文说明）、覆盖时保留原 `@since`；工具方法已 static import、`HashMap.newHashMap(16)`、接口 `throws IOException` 的实现按实际收窄；工具/常量/翻译等能力复用三层框架现成类、未自造。

全过 → 输出三行简报（`规范 / 安全 / 性能：通过（速查）`）；任一可疑 → Read [code-review.md](code-review.md) 深检，Critical 须修复并再检。

Step 7：Step 6 通过 · IDEA 格式化已生效（`hooks/lint-fix.sh` 对 Java 走 IDEA headless format，等价 IDE 保存格式化；Stop 时校验，失败须修复后再结束）。
