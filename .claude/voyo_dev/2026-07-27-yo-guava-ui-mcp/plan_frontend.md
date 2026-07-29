# yo-guava-ui MCP 前端开发计划

## 模块1：基础结构
- [x] 创建 mcp/yo-guava-ui/ 目录
- [x] 编写 package.json（依赖 @modelcontextprotocol/sdk, @voyo/docs-db）
- [x] 编写 index.js（入口：检查依赖 → 安装 → 启动）

## 模块2：数据构建
- [x] 编写 tips.mjs（54 个组件的 question 关键词）
- [x] 编写 init.mjs（扫描 components/**/*.md → 写入 SQLite）

## 模块3：MCP Server
- [x] 编写 main.mjs（list_components + search_components）
- [x] 使用 @modelcontextprotocol/sdk 构建 stdio server

## 模块4：集成测试
- [ ] 运行 init.mjs 构建数据
- [ ] 启动 server 验证 list/search 功能
