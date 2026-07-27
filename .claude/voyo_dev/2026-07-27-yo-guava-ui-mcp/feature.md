# yo-guava-ui MCP 重新设计

## 需求
在 `mcp/yo-guava-ui/` 目录下构建一个新的 MCP server：
- 独立 package.json，依赖 `@modelcontextprotocol/sdk` 和 `@voyo/docs-db`
- 使用 jieba 分词 + SQLite 倒排索引实现关键词搜索
- init.mjs 从 `mcp/components/**/usage.md` 构建基础数据
- 每个组件生成 question 字段（含中英文关键词）
- 两个 tool：list（列出所有组件）+ query（关键词搜索）
- index.js 入口：检查并安装依赖后启动 main.mjs

## 使用 agent
- 前端 agent: voyowork:frontend-vue
- 后端 agent: 无

agent提醒: 注意阅读 `yo-dev-xxl` skill , 明确你当前的管理的进度位置。

- 管理进度1: [x]设计功能点文档
- 管理进度2: [x]设计开发计划文档
- 管理进度3: [x]实现功能开发
- 管理进度4: [x]代码review
- 管理进度5: [x]功能测试
