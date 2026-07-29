# yo-guava-ui MCP 设计文档

## 背景
现有 `mcp/components/Gv*/` 下有 54 个 Guava UI 组件的 usage.md。需要构建一个 MCP server，通过关键词搜索让 agent 快速找到合适的组件。

## 技术方案

### 目录结构
```
mcp/yo-guava-ui/
├── package.json          # 依赖：@modelcontextprotocol/sdk, @voyo/docs-db
├── index.js              # 入口：检查依赖 → 安装 → 启动 main.mjs
├── main.mjs              # MCP server：list + query 两个 tool
├── init.mjs              # 构建基础数据：扫描 components/**/*.md → 写入 SQLite
├── tips.mjs              # 每个组件的 question 关键词（自动生成）
└── .yo_ddb/              # dbPath + docsDir（相对本目录）
    ├── data/docs.db
    └── docs/*.md
```

### 数据模型（@voyo/docs-db）
```js
docs.write({
  type: "frontend",
  lang: "vue",
  question: "按钮 button 提交 操作 点击",  // 关键词，空格分隔
  doc_name: "GvButton",                    // 组件名
  content: "<usage.md 全文>",
})
```

### MCP Tools
| Tool | 参数 | 返回 |
|------|------|------|
| `list_components` | 无 | 所有组件列表 [{name, question}] |
| `search_components` | query: string | 匹配的组件 [{name, question, content, match_count}] |

### 依赖管理
index.js 逻辑：
1. 检查 `node_modules` 是否存在
2. 不存在则 `npm install --no-audit --no-fund`
3. `await import('./main.mjs')`

## 数据来源
- 组件列表：`mcp/components/Gv*/` 目录扫描
- 内容：每个组件的 `usage.md`
- 关键词：通过 subagent 分析 usage.md 生成（含中英文）
