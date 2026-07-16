---
name: guava-all
description: >
  Full-stack from src/pages/*.md: Phase A guava-front then Phase B guava-backend.
  Invoke /guava-plugins:guava-all. Read config-bridge.md + phase SKILLs.
disable-model-invocation: true
---

# guava-all

> [config-bridge.md](config-bridge.md) · Phase A [../guava-front/SKILL.md](../guava-front/SKILL.md) · Phase B [../guava-backend/SKILL.md](../guava-backend/SKILL.md)

**顺序固定**：先前端（ses-web）→ 再后端（`GUAVA_BACKEND_ROOT`）。**不做** git、不改路由。

## 流程

1. Read `src/pages/<config>.md` + [config-bridge.md](config-bridge.md) 推导前后端参数
2. Read [../../context/front.md](../../context/front.md)（仅 Phase A 所需段落）
3. **Phase A — guava-front**：严格按 [../guava-front/SKILL.md](../guava-front/SKILL.md) Write 本仓库文件（Vue 前用插件 MCP 查 Gv*）
4. Read [../../context/backend.md](../../context/backend.md) + `GUAVA_BACKEND_ROOT`
5. **Phase B — guava-backend**：严格按 [../guava-backend/SKILL.md](../guava-backend/SKILL.md) Write 后端文件
6. 对齐检查：`apiBase`/`paths`/`field` 与前端 API 一致（见 config-bridge）
7. hooks lint 无报错（front eslint + back java format）

## 中断规则

Phase A 未完成不进入 Phase B。Phase B 缺 `backend.module` 等必填项时 Interactive 确认，不猜测路径。
