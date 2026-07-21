---
name: guava-backend
description: >
  Backend: Spring Boot Controller/Service/ServiceImpl under GUAVA_BACKEND_ROOT.
  Invoke /guava-plugins:guava-backend. Read context/backend.md + this SKILL.
disable-model-invocation: true
---

# guava-backend

> [_shared.md](_shared.md) · [conventions.md](conventions.md) · [code-review.md](code-review.md) · [../../context/backend.md](../../context/backend.md)

## 流程

Step 0：Read `GUAVA_BACKEND_ROOT` 下同模块实现（`sysbizconf` / `sysuser`）。

Step 1：Module、package、Feature、Entity、RequestMapping、Swagger Tag（见 context/backend.md）。

Step 1.1：查询条件（必选，[search-conditions.md](search-conditions.md)，field 与前端一致）。

Step 1.2：业务字段（add/edit 时）。

Step 1.3：CRUD（禁止默认全开，查询必选）。

Step 2–4：Write Controller → Service → ServiceImpl（覆盖策略 [_shared.md](_shared.md)）：

| 文件 | 模板 |
|------|------|
| Controller | [controller.md](templates/controller.md) |
| Service | [service.md](templates/service.md) |
| ServiceImpl | [service-impl.md](templates/service-impl.md) |

Step 5：Mapper/SqlProvider、`getTransHash()`、`@MarkLog`、与前端 `paths` 对齐。

Step 6 — 本次生成代码检查（必做）：按 [code-review.md](code-review.md) 对本轮 Java 做三检（**规范** / **安全** / **性能**）。Critical 须修复并再检；通过后输出三行简报。

Step 7：Step 6 通过 · `lint-fix.sh` Java 格式化无报错。
