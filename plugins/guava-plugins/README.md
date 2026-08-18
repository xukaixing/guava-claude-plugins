# Guava 全栈代码生成（guava-plugins）

## 命令

| 命令 | 说明 |
|------|------|
| `/guava-plugins:code-frontend` | 当前项目前端 Vue/API/i18n |
| `/guava-plugins:code-backend` | `GUAVA_BACKEND_ROOT` 下 Java（Controller/Service/ServiceImpl + PO 实体；缺实体时连库读表生成 PO） |
| `/guava-plugins:code-all` | 先 front 后 back |
| `/guava-plugins:code-from-db` | 连接 MySQL 读表结构 → 生成 `.md` → 全栈页面表单 |

配置放在消费项目的 `src/pages/**/*.md`。

## 从 MySQL 表生成（code-from-db）

1. 准备 `db.yml`（`db.yml` 已 gitignore）：优先放业务工程根 `${CLAUDE_PROJECT_DIR}/db.yml`（每个工程连自己的库），否则复制 `mcp/mysql-schema/db.example.yml` 为 `mcp/mysql-schema/db.yml`。
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
