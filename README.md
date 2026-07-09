# guava-claude-plugins

Guava 项目的 Claude Code 插件市场，供 **ses-web** 等前端工程安装使用。

## 安装

在 Claude Code 中（以本仓库为 marketplace）：

```text
/plugin marketplace add /Users/andyhsu/Workspace/guava-claude-plugins
/plugin install guava-plugins@guava-tools
```

或开发调试：

```bash
claude --plugin-dir /Users/andyhsu/Workspace/guava-claude-plugins/plugins/guava-plugins
```

## 命令

| 命令 | 说明 |
|------|------|
| `/guava-plugins:guava-front` | 生成 Vue/Gv* 页面与 API |
| `/guava-plugins:guava-backend` | 生成 Spring Boot Controller/Service |
| `/guava-plugins:guava-all` | 全栈：先 front 后 back |

配置放在消费项目的 `src/pages/**/*.md`，示例见 ses-web：`src/pages/sysMng/userMng.md`。

## ses-web 集成

ses-web 的 `.claude/settings.json` 仅保留项目级 `env` 与 `permissions`；skills/hooks 由本插件提供。

```json
{
  "env": {
    "GUAVA_BACKEND_ROOT": "${CLAUDE_PROJECT_DIR}/../guava-admin"
  }
}
```

## 插件结构

```text
plugins/guava-plugins/
├── .claude-plugin/plugin.json
├── README.md
├── skills/          # guava-front, guava-backend, guava-all
├── context/         # front.md, backend.md
└── hooks/
    ├── hooks.json
    └── lint-fix.sh
```

## 开发

修改插件后于 Claude Code 执行 `/reload-plugins` 热加载。

### ESLint hook 排查

1. 确认插件已安装且 hooks 已加载（`/reload-plugins`）
2. 调试：在消费项目 `settings.local.json` 加 `"GUAVA_LINT_DEBUG": "1"`
3. 若用 **Cursor Agent**（非 Claude Code 插件），需在 ses-web 配置 `.cursor/hooks.json`（见 `plugins/guava-plugins/hooks/cursor-hooks.json.example`）
