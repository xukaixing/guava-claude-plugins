# Guava 全栈代码生成（guava-plugins）

## Agent

| Agent | 说明 |
|-------|------|
| `guava-codegen` | 给一个 md 路径 / 表名 / 生成请求（含"只生成后端"等单端语义），自动选择并执行下面的 code-* skill（也可显式指定） |
| `guava-test` | 给系统 URL + 账号 + 功能（md 路径或菜单名），自动执行 Playwright 功能测试（菜单导航 / 按钮可用性 / 输入校验 / 保存修改），测试代码落在消费项目 `e2e/` 可复跑 |

### guava-codegen 用法

在消费项目里用自然语言派活，agent 读取输入后自动选择 skill：

| 你说 | agent 执行 |
|------|-----------|
| "用 guava-codegen 按 `src/pages/userMng.md` 生成代码" | 读 md → 前后端配置都有 → `code-all` |
| "根据 `src/pages/deptList.md` 只生成前端" | → `code-frontend` |
| "按 `src/pages/userMng.md` 只生成后端" | 显式单端 → `code-backend`（只消费 md 后端部分） |
| "只生成后端：用户管理，要 Controller/Service/PO"（无 md） | 纯后端自由文本 → `code-backend`（Interactive 确认模块/包/实体） |
| "从 `sys_user` 表生成全栈页面" | → `code-from-db`（走 mysql-schema MCP） |
| "生成 `sys_role` 的 PO 就行" | → `code-from-db` PO-only 模式 |
| "优化 `src/views/userMng/` 的性能，有点卡" | → `code-optimize`（frontend） |
| "分析一下后端这个接口为什么慢" | → `code-optimize`（backend） |
| "用 code-backend 生成这个 md 的接口" | 显式指定 → `code-backend` |

调度规则：用户**显式声明只生成某一端 → 该端 skill（最高优先级**，即使 md 含两端配置）；否则 md 含前端+后端配置 → `code-all`；只含一端 → 对应单端 skill；表名/表结构 → `code-from-db`；无 md 的纯后端生成请求（Controller/Service/PO/接口等后端信号）→ `code-backend`；优化类请求 → `code-optimize`。无法判断前后端归属时先问用户。也可显式点名：`Task(subagent_type: "guava-plugins:guava-codegen", prompt: "...")`。

前置条件与直接调用 skill 相同：已 `pnpm install`（含 guava-ui）、`GUAVA_BACKEND_ROOT` 已配置、`db.yml` 已填（code-from-db 需要）。

### guava-test 用法

在消费项目里用自然语言派活即可。输入优先级：**命令行显式参数 > `e2e.test.md` 配置 > 交互追问**。

**有 `e2e.test.md`（URL/账号一次配好，日常推荐）：**

| 你说 | agent 执行 |
|------|-----------|
| "测一下" / "跑一遍测试" | 自动发现工程根 `e2e.test.md`，环境+功能全取配置，直接开测 |
| "测一下 `e2e.test.md`" | 显式指定配置文件，同上 |
| "测一下，但只跑按钮和输入校验" | 配置取 URL/账号，范围取命令行（`scope: [buttons, validations]`） |
| "测一下 `src/pages/sysMng/deptMng.md`" | 配置取环境，功能被命令行覆盖为部门管理 |
| "测一下 `e2e.test.md`，headless 关掉，我想看着浏览器跑" | 写 `E2E_HEADLESS=false` 有头模式执行 |

**无配置（四要素全给，一次性完整输入）：**

| 你说 | agent 执行 |
|------|-----------|
| "测一下 https://guava-test.example.com，admin/123456，功能 `src/pages/sysMng/userMng.md`" | 读 md + 生成产物推导用例 → 装 Playwright、幂等生成 `e2e/` 脚手架 → 跑菜单导航 / 按钮 / 校验 / 保存修改 4 类用例 → 清理自建数据 → 报告 |
| "帮我测 https://test.example.com 账号 admin 密码 Admin@123，测用户管理" | 自然语言变体，同样解析出 URL / 账号 / 功能 |

**要素不全或功能描述模糊（agent 追问 / 自动匹配）：**

| 你说 | agent 执行 |
|------|-----------|
| "测一下用户管理" | 无配置 → 追问"系统 URL 和账号"；同时 glob `src/pages/**` 列出候选功能让你挑 |
| "测一下 https://xxx admin/123 系统管理下的用户管理" | `src/pages/**` 无匹配 → 实况探测模式：登录后按菜单路径点入，dump 菜单 / 按钮 / 表单推导用例（报告标注覆盖来源） |
| "测一下订单列表" | 功能名模糊匹配 `src/pages/**`；1 个直接用，多个列出让你选 |

**附加要求：**

| 你说 | agent 执行 |
|------|-----------|
| "只测按钮和输入校验，别做新增修改" | 按声明裁剪用例范围（写操作类用例默认只触碰 `E2E_` 前缀自建数据） |
| "编辑功能允许用预置的 admin 记录验证" | 安全门逐条确认后 `$AUTH_SCOPE` 带上该预置记录，报告标注授权来源 |

**测试配置（可选，避免每次重复输入 URL/账号）**：复制模板到工程根并填写（与 `db.yml` 同约定，含真实凭据务必 gitignore）：

```bash
# 在你的业务工程根目录（如 ses-web/）
cp <插件目录>/skills/code-test/config-template.md ./e2e.test.md
# 编辑 e2e.test.md：baseUrl / username / password / feature
# password 推荐写 ${E2E_PASSWORD}，运行时从环境变量解析
```

命令行显式参数优先级高于 `e2e.test.md` 配置。

真实环境跑测试会真实写数据：默认只新增 / 修改 / 删除**测试自建数据**（用例结束自动清理）；涉及预置数据的用例会先向你确认。复跑：`pnpm exec playwright test`；报告：`pnpm exec playwright show-report`。凭据只写 `e2e/.env.e2e`（已 gitignore）。

## 命令

| 命令 | 说明 |
|------|------|
| `/guava-plugins:code-frontend` | 当前项目前端 Vue/API/i18n |
| `/guava-plugins:code-backend` | `GUAVA_BACKEND_ROOT` 下 Java（Controller/Service/ServiceImpl + PO 实体；缺实体时连库读表生成 PO） |
| `/guava-plugins:code-all` | 先 front 后 back |
| `/guava-plugins:code-from-db` | 连接 MySQL 读表结构 → 生成 `.md` → 全栈页面表单 |
| `/guava-plugins:code-optimize` | 前端/后端性能分析 + 优先级排序的修复 |
| `/guava-plugins:guava-test` | 自动化功能测试（agent 调度）：给 URL + 账号 + 功能，Playwright 跑菜单/按钮/校验/保存修改，产物落 `e2e/` |

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
