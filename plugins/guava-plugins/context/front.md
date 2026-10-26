# 前端上下文（按需）

> 流程 `skills/code-frontend/SKILL.md` · 规范 `skills/code-frontend/conventions.md`

## 工程

Vue 3 + TS + Vite + Guava UI · pnpm >= 11.9 · Node >= 24.18 · `@/` → `src/`

```bash
pnpm install | dev | build | preview
pnpm lint:lint-staged
```

## 目录

`src/api/` · `src/views/` · `src/pages/`（生成配置）· `src/locales/` · `src/hook/`

## 生成要点

- template **优先 Gv***；写 template 前用插件 MCP（`guava-ui` / `gv-*`）；无对应组件时可用 `el-*`
- 配置 → `/guava-plugins:code-frontend src/pages/...md`
- 示例：`src/pages/sysMng/userMng.md`
- 覆盖策略：`skills/code-frontend/_shared.md`
- 生成后 hook：`hooks/lint-fix.sh`（插件自动加载，prettier --write + eslint --fix + stylelint --fix）

## 代码规范（每次任务完成后必做）

任务结束前，必须对**本次改动的文件**执行格式检查并修复，全部通过后方可汇报完成：

```bash
# 改动文件清单（相对仓库根）
git diff --name-only HEAD   # 已跟踪的改动
git status --porcelain      # 含新增未跟踪文件，注意 ?? 前缀

pnpm prettier --write <改动文件...>
pnpm eslint --fix <改动文件...>
pnpm stylelint --fix <改动文件...>   # 仅改动样式文件（*.css/*.scss/*.less/*.sass/*.styl）时
```

- `--fix` 能自动修的全部修掉；无法自动修复的报错必须手动修复（**禁止** `--no-error-on-unmatched-pattern` 之类跳过检查）
- 若报错来自本次未改动的历史文件，不要顺手大改，如实告知用户
- 多文件时可并行执行；最后重新跑一次（`prettier --check` + `eslint` + `stylelint`）确认无剩余 error
- 后端 `.java`：IDEA headless format（hook 自动按批执行，见 backend.md）
