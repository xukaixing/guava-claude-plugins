# 前端上下文（按需）

> 流程 `skills/guava-front/SKILL.md` · 规范 `skills/guava-front/conventions.md`

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
- 配置 → `/guava-plugins:guava-front src/pages/...md`
- 示例：`src/pages/sysMng/userMng.md`
- 覆盖策略：`skills/guava-front/_shared.md`
- 生成后 hook：`hooks/lint-fix.sh`（插件自动加载）
