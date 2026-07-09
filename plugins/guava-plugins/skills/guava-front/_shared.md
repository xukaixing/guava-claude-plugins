# guava-front 共享规则

> 代码风格 · Gv* 组件 · 命名 · 文件头 → [conventions.md](conventions.md)  
> Git · 安全 · 命令 → [../../README.md](../../README.md)

## 覆盖策略

| 文件 | 已存在时 |
|------|----------|
| `types.d.ts`、`helper.tsx`、`*.vue` | **Write 整文件覆盖**；保留 `@date`，更新 `@LastEditTime` / `@version` |
| `src/api/<module>.ts` | **仅追加**缺失 API 函数，不覆盖已有 |
| `zh-CN.ts` / `en.ts` | **替换**整个 `<i18nKey>` 分组 |

禁止因「已存在」跳过 Write。API 已存在不阻页面生成。

## Vue 生成要点

- template **仅用 Gv***（Guava UI），**禁止 el-***
- 字段走 `GvForm`/`GvTable` + helper 的 `FormItem[]`/`TableHeadItem[]`
- 新页面用 `create*List` + i18n，禁止 legacy 硬编码中文
- 分区顺序见 conventions `@section`

## 生成后

`hooks/lint-fix.sh`（插件）：`PostToolBatch` 前端 `eslint --fix`；`Stop` 校验。见 [../../context/front.md](../../context/front.md)。
