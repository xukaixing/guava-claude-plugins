---
name: guava-test
description: >
  自动化测试入口：将请求委托给 guava-plugins:guava-test agent。
  当用户说"自动化测试 / 功能测试 / 页面测试 / 测试某个功能"并给出系统 URL、
  用户名、密码与功能（md 路径或菜单名），或给出 e2e.test.md / *.test.md
  测试配置路径（URL/账号一次配置复用）时使用。
---

# guava-test

本 skill 是 `guava-plugins:guava-test` agent 的入口包装。

**唯一操作**：用 `Agent` tool 启动 `guava-plugins:guava-test`，把用户的原始请求作为 `prompt` 传入：

```
Agent tool:
  subagent_type: "guava-plugins:guava-test"
  prompt: <用户的原始请求，包含系统 URL / 用户名 / 密码 / 功能（md 路径或功能名）>
```

不要自行执行任何测试逻辑——全部由 agent 负责调度。
