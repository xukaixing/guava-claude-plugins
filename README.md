# guava-claude-plugins

Guava 项目的 Claude Code 插件市场（marketplace 名：**guava-tools**），供 **ses-web** 等工程安装使用。

## 安装

```text
/plugin marketplace add <本仓库路径或 GitHub>
/plugin install guava-plugins@guava-tools
/reload-plugins
```

开发调试：

```bash
claude --plugin-dir /path/to/guava-claude-plugins/plugins/guava-plugins
```

## 命令

| 命令 | 说明 |
|------|------|
| `/guava-plugins:guava-front` | 生成 Vue/Gv* 页面与 API（写 template 前用自带 MCP） |
| `/guava-plugins:guava-backend` | 生成 Spring Boot Controller/Service |
| `/guava-plugins:guava-all` | 全栈：先 front 后 back |

## Skill 与 MCP

插件内同时包含：

```text
plugins/guava-plugins/
├── .claude-plugin/plugin.json
├── .mcp.json              # ${CLAUDE_PLUGIN_ROOT}/mcp/...
├── mcp/                   # guava-ui catalog + gv-* 单组件
├── skills/                # guava-front / guava-backend / guava-all
├── context/
└── hooks/
```

| 层 | 职责 |
|----|------|
| Skill | 生成流程、模板、约定 |
| MCP | Gv* 用法（`usage.json`）+ 消费项目 `node_modules/guava-ui` 的 props |

消费项目**无需**再配置项目级 `.mcp.json`，也**无需** clone guava-press / guava-ui 源码。

## ses-web 集成

ses-web 的 `.claude/settings.json` 仅保留项目级 `env` 与 `permissions`：

```json
{
  "env": {
    "GUAVA_BACKEND_ROOT": "${CLAUDE_PROJECT_DIR}/../guava-admin"
  }
}
```

## 更新组件用法快照（作者机）

需本机有 guava-press：

```bash
cd plugins/guava-plugins
CLAUDE_PROJECT_DIR=/path/to/ses-web node mcp/generate-components.mjs
```

## 开发

修改插件后于 Claude Code 执行 `/reload-plugins`。
