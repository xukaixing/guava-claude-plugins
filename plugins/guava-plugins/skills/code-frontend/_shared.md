# code-frontend 共享规则

> 代码风格 · Gv* 组件 · 命名 · 文件头 → [conventions.md](conventions.md)
> Git · 安全 · 命令 → [../../README.md](../../README.md)

---

## 覆盖策略

| 文件 | 已存在时 |
|------|----------|
| `types.d.ts`、`helper.tsx`、`data.ts`、`*.vue` | **Write 整文件覆盖**；保留 `@date`，更新 `@LastEditTime` / `@version` |
| `src/api/<module>.ts` | **仅追加**缺失 API 函数，不覆盖已有；**`frontendOnly` 时整节跳过** |
| `zh-CN.ts` / `en.ts` | **替换**整个 `<i18nKey>` 分组 |

禁止因「已存在」跳过 Write。API 已存在不阻页面生成。

---

## Vue 生成要点

| 项 | 规则 |
|----|------|
| **输出目录** | `src/views/<YAML.view>/`（[config-parser.md](config-parser.md#23-view--目录)） |
| **frontendOnly** | 不生成 api；列表 / 表单数据在 `data.ts`（[templates/data.md](templates/data.md)） |
| **i18n** | `false`（默认）= 仅中文，不走 `t()`；`true` = 双语言 + `t()` |
| **template** | 优先 `Gv*`；写前用 MCP（`get_page_recipe` / `get_usage` / `get_props`）；无对应封装时才用 `el-*` |
| **字段配置** | 走 `GvForm` / `GvTable` + helper 的 `FormItem[]` / `TableHeadItem[]` |
| **工厂函数** | 新页面用 `create*List`；`i18n: false` 时禁止 `t()` |
| **@section 顺序** | conventions 规定，禁止数字注释 |
| **JSDoc** | `@methods` 下每个方法多行 JSDoc（禁止单行 `/** @todo xxx */`） |

---

## MCP fallback

MCP 不可用时从工程 `node_modules/guava-ui` 取组件信息（类型 / 源码 / 导出列表路径与查找顺序见 [SKILL.md](SKILL.md)「MCP 不可用时的 fallback」）。只要执行过 `pnpm install`，fallback 始终可用。

---

## 生成后

**每次写/改完前端文件，ESLint + Prettier 必须通过（不通过的自动修复后再验）：**

1. 插件 hook `lint-fix.sh` 在 `PostToolUse`/`PostToolBatch` 自动执行 `prettier --write` + `eslint --fix` + `stylelint --fix`（样式文件 `*.css/*.scss/*.less/*.sass/*.styl`，顺序执行、自动修复），`Stop` 时复查（eslint + stylelint + prettier --check + java），失败会阻止结束。见 [../../context/front.md](../../context/front.md)。
2. 若 hook 未生效（如 hook 缺失的环境）或 `Stop` 被阻止：**自己执行** `prettier --write` + `eslint --fix`（+ `stylelint --fix`）修复目标文件，复检通过后（三项 check 均退出码 0）再继续。改动文件清单用 `git diff --name-only HEAD` + `git status --porcelain` 确认；禁止用 `--no-error-on-unmatched-pattern` 之类跳过检查；历史遗留报错不要顺手大改，如实告知用户。
3. 完成清单中的「lint-fix.sh 无报错」= eslint、stylelint、prettier 均通过；任何一项失败都不得结束本轮生成。
