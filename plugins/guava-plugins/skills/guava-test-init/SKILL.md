---
name: guava-test-init
description: >
  入口 skill：将请求委托给 guava-plugins:guava-test-init agent。
  当用户说"生成测试 md / 反向生成 e2e/cases 配置 / 初始化测试配置 / 同步测试 md"
  并给出功能（src/pages/<feature>.md 路径、功能名或 all 批量）时使用。
---

# guava-test-init

本 skill 是 `guava-plugins:guava-test-init` agent 的入口包装。

**唯一操作**：用 `Agent` tool 启动 `guava-plugins:guava-test-init`，把用户的原始请求作为 `prompt` 传入：

```
Agent tool:
  subagent_type: "guava-plugins:guava-test-init"
  prompt: <用户的原始请求，包含功能 md 路径 / 功能名 / all 批量，以及是否强制更新已存在的测试 md>
```

不要自行执行任何生成逻辑——全部由 agent 负责调度。
