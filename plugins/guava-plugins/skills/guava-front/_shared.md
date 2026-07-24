# guava-front 共享规则

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
| **输出目录** | `src/views/<YAML.view>/`（[config-parser.md](config-parser.md#硬性规则view-决定生成目录)） |
| **frontendOnly** | 不生成 api；列表 / 表单数据在 `data.ts`（[templates/data.md](templates/data.md)） |
| **i18n** | `false`（默认）= 仅中文，不走 `t()`；`true` = 双语言 + `t()` |
| **template** | 优先 `Gv*`；写前用 MCP（`get_page_recipe` / `get_usage` / `get_props`）；无对应封装时才用 `el-*` |
| **字段配置** | 走 `GvForm` / `GvTable` + helper 的 `FormItem[]` / `TableHeadItem[]` |
| **工厂函数** | 新页面用 `create*List`；`i18n: false` 时禁止 `t()` |
| **@section 顺序** | conventions 规定，禁止数字注释 |
| **JSDoc** | `@methods` 下每个方法多行 JSDoc（禁止单行 `/** @todo xxx */`） |

---

## MCP fallback

MCP 工具不可用时，从工程 `node_modules/guava-ui` 依赖获取组件信息：

| 信息 | 路径 |
|------|------|
| 类型定义（props / emits） | `node_modules/guava-ui/lib/types/index.d.ts` |
| 组件源码 | `node_modules/guava-ui/lib/components/Gv*/src/Gv*.vue` |
| 导出列表 | `node_modules/guava-ui/lib/index.d.ts` |

> 只要 `pnpm install` 执行过（含 guava-ui 依赖），fallback 始终可用。

---

## 生成后

`hooks/lint-fix.sh`（插件）：`PostToolBatch` 前端 `eslint --fix`；`Stop` 校验。见 [../../context/front.md](../../context/front.md)。
