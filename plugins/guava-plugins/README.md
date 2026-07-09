# Guava 全栈代码生成（guava-plugins）

Claude Code 插件：从 `src/pages/**/*.md` 生成 Guava 前端（Vue/Gv\*）与后端（Spring Boot）。

## 命令（安装后）

| 命令                           | 范围                         |
| ------------------------------ | ---------------------------- |
| `/guava-plugins:guava-front`   | 当前项目前端 Vue/API/i18n    |
| `/guava-plugins:guava-backend` | `GUAVA_BACKEND_ROOT` 下 Java |
| `/guava-plugins:guava-all`     | 先 front 后 back             |

配置示例：`src/pages/sysMng/userMng.md`（ses-web 仓库）

## 按需 Read（勿预加载）

| 文件                 | 何时                  |
| -------------------- | --------------------- |
| `context/front.md`   | front / all Phase A   |
| `context/backend.md` | backend / all Phase B |
| `skills/*/SKILL.md`  | 对应命令触发时        |

## 环境变量

在**消费项目** `.claude/settings.json` 或 `settings.local.json` 配置：

- `GUAVA_BACKEND_ROOT` — 后端 Maven 根路径（默认 `${CLAUDE_PROJECT_DIR}/../guava-admin`）
- `GUAVA_JAVA_FORMAT` — `auto` | `google-java-format` | `spotless` | `none`

## Hooks

`hooks/lint-fix.sh`：Write/Edit 后自动 eslint（前端）+ Java 格式化（后端）。

## 约束

- 只 Write 代码；不改路由；未经要求不 git
- 前端 template 仅用 **Gv\***，禁止 `el-*`

文档：<http://www.ccexpert.top:8888/guava/>
