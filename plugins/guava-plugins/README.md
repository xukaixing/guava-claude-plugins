# Guava 全栈代码生成（guava-plugins）

## 命令

| 命令 | 说明 |
|------|------|
| `/guava-plugins:guava-front` | 当前项目前端 Vue/API/i18n |
| `/guava-plugins:guava-backend` | `GUAVA_BACKEND_ROOT` 下 Java |
| `/guava-plugins:guava-all` | 先 front 后 back |

配置放在消费项目的 `src/pages/**/*.md`。

## Skill + MCP

安装本插件后同时获得：

| 能力 | 来源 |
|------|------|
| 生成流程 / 模板 | `skills/guava-front` 等 |
| Gv* 用法与 props | `.mcp.json` → `mcp/`（`guava-ui` + `gv-*`） |

写 template 前用 MCP：`get_page_recipe` / `get_usage` / `get_props`。详见 [mcp/README.md](mcp/README.md)。

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
