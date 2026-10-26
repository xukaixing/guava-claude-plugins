# Guava MCP（随 guava-plugins 分发）

安装 `guava-plugins@guava-tools` 后自动连接（插件根 `.mcp.json`，路径用 `${CLAUDE_PLUGIN_ROOT}`）。

## 与 skill 配合

| 层 | 作用 |
| --- | --- |
| `/guava-plugins:code-frontend` | 页面生成流程 |
| MCP `guava-ui` | 目录 / el→Gv / page recipe |
| MCP `gv-form` / `gv-table` / … | 单组件用法（`usage.json`）+ props（消费项目 `guava-ui`） |
| `/guava-plugins:code-backend` | Java 生成流程（模板对齐 SysUser* 参考） |
| MCP `guava-backend` | 模块分层 / BOM 依赖+版本 / 平台类索引（见 [guava-backend/README.md](guava-backend/README.md)） |

Skill 要求：写 Vue template 前先调 MCP；写 Java 前先 `guava-backend` → `get_stack`，用工具类前 `search_platform_classes`。

## 后端知识（guava-backend）

数据源为 `guava-parent-starter`（依赖 + 版本）与 `guava-platform-starter`（底层框架，依赖 entity-starter / component-starter）的 vendored 快照（`guava-backend/data/*.json`）。作者机刷新：

```bash
cd plugins/guava-plugins
node mcp/generate-backend.mjs /path/to/guava-pro   # 或 GUAVA_PRO_ROOT
```

## MySQL 表结构（mysql-schema）

`/guava-plugins:code-from-db` 用它读 `information_schema` 表结构。连接配置在 `db.yml`，查找优先级：

1. 业务工程根 `${CLAUDE_PROJECT_DIR}/db.yml`（如 `ses-web/db.yml`，每个工程连自己的库）
2. 插件自身 `mcp/mysql-schema/db.yml`（全局兜底）

模板见 `mcp/mysql-schema/db.example.yml`；`db.yml` 已 gitignore，不提交凭据。支持 MySQL 8.0 SSL（`ssl: true`，可选 `ssl_ca`/`ssl_cert`/`ssl_key`、`ssl_reject_unauthorized`）。

## 运行时依赖

- **用法**：本目录 `components/Gv*/usage.json`（已 vendored）
- **props**：`${CLAUDE_PROJECT_DIR}/node_modules/guava-ui/lib/types/index.d.ts`

消费项目只需 `pnpm install`（含 `guava-ui`），**不需要** guava-press / guava-ui 源码。

## 作者机更新用法

```bash
cd plugins/guava-plugins
CLAUDE_PROJECT_DIR=/path/to/ses-web node mcp/generate-components.mjs
```

会刷新 `usage.json` 与插件根 `.mcp.json`。

## 自测

```bash
cd /path/to/ses-web
CLAUDE_PROJECT_DIR=$PWD CLAUDE_PLUGIN_ROOT=/path/to/guava-claude-plugins/plugins/guava-plugins \
  node "$CLAUDE_PLUGIN_ROOT/mcp/components/GvForm/server.mjs"
```
