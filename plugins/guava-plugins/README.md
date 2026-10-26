# Guava 全栈代码生成（guava-plugins）

## Agent

| Agent | 说明 |
|-------|------|
| `guava-codegen` | 给一个 md 路径 / 表名 / 生成请求，自动选择并执行下面的 code-* skill（也可显式指定） |

### guava-codegen 用法

在消费项目里用自然语言派活，agent 读取输入后自动选择 skill：

| 你说 | agent 执行 |
|------|-----------|
| "用 guava-codegen 按 `src/pages/userMng.md` 生成代码" | 读 md → 前后端配置都有 → `code-all` |
| "根据 `src/pages/deptList.md` 只生成前端" | → `code-frontend` |
| "从 `sys_user` 表生成全栈页面" | → `code-from-db`（走 mysql-schema MCP） |
| "生成 `sys_role` 的 PO 就行" | → `code-from-db` PO-only 模式 |
| "优化 `src/views/userMng/` 的性能，有点卡" | → `code-optimize`（frontend） |
| "分析一下后端这个接口为什么慢" | → `code-optimize`（backend） |
| "用 code-backend 生成这个 md 的接口" | 显式指定 → `code-backend` |

调度规则：md 含前端+后端配置 → `code-all`；只含一端 → 对应单端 skill；表名/表结构 → `code-from-db`；优化类请求 → `code-optimize`。也可显式点名：`Task(subagent_type: "guava-plugins:guava-codegen", prompt: "...")`。

前置条件与直接调用 skill 相同：已 `pnpm install`（含 guava-ui）、`GUAVA_BACKEND_ROOT` 已配置、`db.yml` 已填（code-from-db 需要）。

## 命令

| 命令 | 说明 |
|------|------|
| `/guava-plugins:code-frontend` | 当前项目前端 Vue/API/i18n |
| `/guava-plugins:code-backend` | `GUAVA_BACKEND_ROOT` 下 Java（Controller/Service/ServiceImpl + PO 实体；缺实体时连库读表生成 PO） |
| `/guava-plugins:code-all` | 先 front 后 back |
| `/guava-plugins:code-from-db` | 连接 MySQL 读表结构 → 生成 `.md` → 全栈页面表单 |
| `/guava-plugins:code-optimize` | 前端/后端性能分析 + 优先级排序的修复 |

配置放在消费项目的 `src/pages/**/*.md`。

## 数据库配置（code-from-db / code-backend 需要）

每个项目的数据库连接信息不同，**不要修改插件目录里的 `db.yml`**，而是在你的业务工程根目录创建自己的 `db.yml`：

```bash
# 在你的业务工程根目录（如 ses-web/）
cp <插件目录>/mcp/mysql-schema/db.example.yml ./db.yml
# 编辑 db.yml 填写真实连接信息
```

**查找优先级**（高 → 低）：
1. `${CLAUDE_PROJECT_DIR}/db.yml` ← **推荐**：每个工程独立配置，文件已 gitignore
2. 插件自带 `mcp/mysql-schema/db.yml` ← 全局兜底（占位值，生产勿用）

> ⚠️ `db.yml` 含密码，务必确认它已在你的 `.gitignore` 中！

## 从 MySQL 表生成（code-from-db）

1. 按上方「数据库配置」在业务工程根目录准备好 `db.yml`。
2. `/mcp` 确认 `mysql-schema` 已连接。
3. 运行 `/guava-plugins:code-from-db`：
   - **PO-only**：指定一张或多张表，只生成 `{Entity}PO.java`（不生成其它文件）。
   - **full-stack**（默认）：选表 → 确认命名与字段 → 生成 `.md` → 走前端/后端流水线 + 实体层。

## Skill + MCP

安装本插件后同时获得：

| 能力 | 来源 |
|------|------|
| 生成流程 / 模板 | `skills/code-frontend` 等 |
| Gv* 用法与 props | `.mcp.json` → `mcp/`（`guava-ui` + `gv-*`） |
| 后端依赖 / 分层 / 平台类索引 | `.mcp.json` → `mcp/guava-backend`（`get_stack` / `search_dependencies` / `search_platform_classes`） |

写 template 前用 MCP：`get_page_recipe` / `get_usage` / `get_props`；写 Java 前用 `guava-backend`：`get_stack` + `search_platform_classes`。详见 [mcp/README.md](mcp/README.md)。

## 前后端隔离

`guava-codegen` agent 按端拆独立 subagent 执行（全栈 = 前端 subagent → 后端 subagent 串行），每个 subagent 只加载本端 skill 文档与 context，省 token 防串味；汇总与对齐核对由主 agent 完成。

## Java 格式化（IDEA 等价）

后端 `.java` 由 hook 走 **IDEA headless format**（`Contents/MacOS/idea format`，等价 IDE「保存时格式化」：4 空格 + Allman 大括号），按批在 `PostToolBatch` / `Stop` 执行：

- 代码风格来源：项目 `.idea/codeStyles/Project.xml` → `GUAVA_IDEA_SCHEME` env → JetBrains 配置目录自定义方案（如 `Default Custom.xml`）→ 工厂默认
- IDEA 定位：`GUAVA_IDEA_FORMAT` / `GUAVA_IDEA_HOME` env → `/Applications/IntelliJ IDEA.app`；不可用时回退 google-java-format / spotless（`GUAVA_JAVA_FORMAT` 控制：`auto` | `idea` | `google-java-format` | `spotless` | `none`）

## 消费项目

```text
/plugin marketplace add <guava-claude-plugins>
/plugin install guava-plugins@guava-tools
/reload-plugins
```

项目 `.claude/settings.json` 只需 `env`（如 `GUAVA_BACKEND_ROOT`）与 permissions；**不必**再放一份 MCP。保证已 `pnpm add guava-ui`。

- 前端 template 优先 **Gv\***；查 MCP 无对应封装时可用 `el-*`

## Hook

Hook 未触发时：`/reload-plugins`。Cursor Agent（非 Claude Code 插件）见 `hooks/cursor-hooks.json.example`。
