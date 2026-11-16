---
name: guava-test-manager
description: >
  Guava 自动化测试管理入口：注册应用、生成/维护 Playwright 用例、触发执行、分析失败并回写结论。
  当用户说"自动化测试 / 功能测试 / 页面测试 / 测试某个功能 / 帮我测一下 / 生成测试用例 /
  分析测试失败 / 回归测试"，并给出系统 URL、账号、功能（或 projectKey / run 编号）时使用。
  本 skill 仅做入口转发，实际工作由 guava-test-manager agent 完成。
---

# guava-test-manager

使用 `Agent` 工具启动测试管理调度 agent：

- `subagent_type`: `"guava-plugins:guava-test-manager"`
- `prompt`: 透传用户的原始请求（系统 URL、账号密码、功能范围、projectKey 或 run 编号等）

本 skill 不执行任何逻辑，不要自行调用 MCP 或编写测试代码。
