---
name: guava-codegen
description: >
  入口 skill：将请求委托给 guava-plugins:guava-codegen agent。
  当用户说"生成代码/页面"、"从数据库生成"、"全栈生成"、"优化代码"并给出 md 路径或表名时使用。
---

# guava-codegen

本 skill 是 `guava-plugins:guava-codegen` agent 的入口包装。

**唯一操作**：用 `Agent` tool 启动 `guava-plugins:guava-codegen`，把用户的原始请求作为 `prompt` 传入：

```
Agent tool:
  subagent_type: "guava-plugins:guava-codegen"
  prompt: <用户的原始请求，包含 md 路径 / 表名等>
```

不要自行执行任何代码生成逻辑——全部由 agent 负责调度。
