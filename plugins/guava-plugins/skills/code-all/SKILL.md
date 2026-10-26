---
name: code-all
description: >
  Full-stack from src/pages/*.md: Phase A code-frontend then Phase B code-backend.
  Invoke /guava-plugins:code-all. Read config-bridge.md + phase SKILLs.
  由 guava-codegen 以两个独立 subagent 串行执行，勿与其他端 skill 混载。
disable-model-invocation: true
---

# code-all（编排）

> [config-bridge.md](config-bridge.md) · Phase A [../code-frontend/SKILL.md](../code-frontend/SKILL.md) · Phase B [../code-backend/SKILL.md](../code-backend/SKILL.md)

**纯编排文档**：本 skill 自身不执行生成，由 `guava-codegen` agent 按上表拆成 **两个独立 subagent 串行执行**（先前端后后端），上下文互不加载，省 token 防串味。

**顺序固定**：Phase A 前端（`${CLAUDE_PROJECT_DIR}`）→ Phase B 后端（`GUAVA_BACKEND_ROOT`）。**不做** git、不改路由。

## Phase A — 前端 subagent

- prompt：按 [guava-codegen Step 3](../agents/guava-codegen.md) 前端模板，传入 md 路径
- 返回：写入文件清单 + 三检简报 + **对齐参数**（`apiBase` / `paths.*` / 查询表 `field` / YAML `backend` 块或推导值）

## Phase B — 后端 subagent

- 前置：按 [config-bridge.md](config-bridge.md) 用 Phase A 返回推导 `module` / `package` / `feature` / `entity`（Interactive 可覆写）；缺必填项**先问用户**
- prompt：按 [guava-codegen Step 3](../agents/guava-codegen.md) 后端模板，带入 Phase A 对齐参数
- 返回：写入文件清单（相对 `GUAVA_BACKEND_ROOT`）+ 三检简报

## 编排规则（guava-codegen 执行）

1. Phase A 未完成（含前端三检 Critical 未清）不进入 Phase B。
2. Phase B 缺 `backend.module` 等必填项时 Interactive 确认，不猜测路径。
3. 汇总：前端三检 + 后端三检 + 对齐核对（`apiBase`/`RequestMapping`、`paths`/端点、`field`/查询条件）。
4. hooks lint 无报错（front eslint + prettier + back IDEA java format）。

## 覆盖策略与桥接细节

见 [config-bridge.md](config-bridge.md)（前后端参数推导、CRUD 对齐、输出清单）。
