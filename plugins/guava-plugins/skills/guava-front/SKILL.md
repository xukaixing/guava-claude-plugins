---
name: guava-front
description: >
  Frontend: Vue 3 + Guava UI from src/pages/*.md. Gv* not el-*. Invoke /guava-plugins:guava-front.
  Read context/front.md + this SKILL. No routes/git.
disable-model-invocation: true
---

# guava-front

> [_shared.md](_shared.md) · [conventions.md](conventions.md) · [../../context/front.md](../../context/front.md)

**只做**：按配置 Write API/Vue/helper/types/i18n。**不做**：路由、git。

## 流程

```
有 src/pages/**/*.md？
  是 → Read 配置 → config-parser + page-types 推导清单 → Write 全部 → Step 8
  否 → Interactive 逐步确认 → 同上
```

### Step 0

Read 同 pageType 参考页（[page-types.md#类型总览](page-types.md#类型总览)）+ 目标 `api`/`helper`/`types`/`locales`。

### Config File Mode

1. Read 配置（YAML + 表）
2. [config-parser.md](config-parser.md) 推导清单
3. Write 每一个文件（覆盖策略见 _shared.md）
4. Step 8

### Interactive Mode

确认：pageType → 基础字段（[config-parser.md](config-parser.md)）→ 查询（crud/tabs 必选，[search-conditions.md](search-conditions.md)）→ 编辑字段 → CRUD 操作（禁止默认全开）→ tabs 列表（tabs 时）→ 按 pageType 选模板：

| Step | crud-module | tabs | form-only |
|------|-------------|------|-----------|
| API | [api.md](templates/api.md) | 同左 | get/save |
| types | [types.md](templates/types.md) | 同左 | 同左 |
| helper | [helper.md](templates/helper.md) | [#tabs](templates/helper.md#tabs) | [#form-only](templates/helper.md#form-only) |
| 主页 | [index-page.md](templates/index-page.md) | [index-page-tabs.md](templates/index-page-tabs.md) | [form-only-page.md](templates/form-only-page.md) |
| Edit | [edit-page.md](templates/edit-page.md) | drawer 时 | — |
| i18n | [i18n.md](templates/i18n.md) | 同左 | 同左 |

### Step 8

清单 ✅ · i18n 已写 · `lint-fix.sh` 无报错（见 _shared.md）

配置模板：[config-template.md](config-template.md) · 示例：`src/pages/sysMng/userMng.md`
