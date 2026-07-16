# Guava MCP（随 guava-plugins 分发）

安装 `guava-plugins@guava-tools` 后自动连接（插件根 `.mcp.json`，路径用 `${CLAUDE_PLUGIN_ROOT}`）。

## 与 skill 配合

| 层 | 作用 |
| --- | --- |
| `/guava-plugins:guava-front` | 页面生成流程 |
| MCP `guava-ui` | 目录 / el→Gv / page recipe |
| MCP `gv-form` / `gv-table` / … | 单组件用法（`usage.json`）+ props（消费项目 `guava-ui`） |

Skill 要求：写 Vue template 前先调 MCP。

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
