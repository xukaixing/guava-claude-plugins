# guava-backend MCP

后端知识目录 MCP：为 code-backend / code-from-db / code-all 生成提供依赖、模块分层与平台类索引。前端对应物是 `guava-ui` MCP。

## 数据源

- **guava-parent-starter**（BOM）：`gradle/libs.versions.toml` + `build.gradle.kts` → 全量依赖 + 版本（`dependencies.json`）
- **guava-platform-starter**（底层框架，依赖 entity-starter / component-starter）：`src/main/java` 类索引（`platform-classes.json`）
- **模块分层**：`stack.json`（BOM → component → entity → platform → 业务工程）

三个文件由**作者机**脚本 `mcp/generate-backend.mjs` 从 guava-pro checkout 生成（vendored 快照，勿手改）：

```bash
node mcp/generate-backend.mjs [/path/to/guava-pro]   # 或 GUAVA_PRO_ROOT
```

## 工具

| 工具 | 用途 |
|------|------|
| `get_stack` | 模块分层 / 版本 / 职责。写任何后端代码前必查 |
| `list_dependencies` | parent-starter BOM 全量依赖（可 `category` 过滤） |
| `search_dependencies` | 按关键字查依赖拿托管版本（引入三方库前必查） |
| `get_dependency` | 单依赖详情 |
| `list_platform_classes` | 平台类索引（可 `module` / `kind` 过滤） |
| `search_platform_classes` | 按关键字查平台类 |
| `get_platform_class` | 单类详情（包 / 用途 / public 方法签名） |

## 新鲜度

- 每次响应带 `generatedAt` / `parentVersion`
- `version: null` = 版本由导入的 BOM 托管（spring-boot-dependencies / spring-cloud-dependencies），生成构建文件时**禁止硬编码版本**
- 若消费项目配置了 `GUAVA_BACKEND_ROOT` 且其下有 `guava-parent-starter/gradle/libs.versions.toml`，版本实时解析覆盖快照（响应 `liveOverride` 字段标识）

## 使用约定（code-backend SKILL 强制）

写 Controller / Service / ServiceImpl / PO 前：先 `get_stack`；用到工具类 / 注解 / 平台服务（`MyUtil` / `AssertMyUtil` / `BizCode` / `MarkLog` / `TransResultService` / `ExcelApiService` / `BasePO` / `Map2ObjUtil`…）时 `search_platform_classes` 确认包路径与签名；需要新三方依赖时 `search_dependencies` 确认 BOM 是否已托管。同轮复用，禁止重复查询。
