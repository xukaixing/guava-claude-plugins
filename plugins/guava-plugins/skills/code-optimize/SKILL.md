---
name: code-optimize
description: >
  代码优化：分析性能问题、内存泄漏和可优化点，给出 Prioritized 修复方案。
  支持前端(Vue 3 / TypeScript / Scss / ElementPlus / Echarts / Axios / Pinia / Router)
  与后端(Java / SpringCloud / SpringBoot / Redis / MyBatis)。
  执行时带参数：frontend（默认）或 backend。
  当用户请求"优化代码"/"性能分析"/"内存泄漏"/"卡顿"/"慢"/"code-optimize"时触发。
---

# code-optimize

**职责**：分析目标代码的性能瓶颈、内存泄漏和优化机会，按优先级给出可落地的修复方案。

**参数**：

| 位置 | 参数 | 说明 | 必填 |
|------|------|------|------|
| 第 1 个 | `frontend` / `backend` | 分析模式：前端或后端 | ✅ 必填 |
| 第 2 个 | `<path>` | 目标文件或文件夹路径（省略则分析整个项目） | 可选 |

**用法**：

```bash
/code-optimize frontend                              # 分析整个前端项目
/code-optimize frontend src/views/user/UserList.vue # 分析单个文件
/code-optimize frontend src/views/user/             # 分析指定文件夹
/code-optimize backend                              # 分析整个后端项目
/code-optimize backend src/main/java/.../UserService.java  # 分析单个文件
/code-optimize backend src/main/java/.../service/   # 分析指定文件夹
```

---

## 执行流程

### 1. 解析参数

```
/code-optimize <mode> [<path>]
  ├── mode: frontend | backend（必填）
  └── path: 文件或文件夹路径（可选，省略则扫描整个项目）
```

- 第 1 个参数为模式（`frontend` / `backend`），**必填**
- 第 2 个参数为目标路径，**可选**
  - 单个文件 → 仅分析该文件
  - 文件夹 → 递归分析该目录下所有相关文件
  - 省略 → 前端扫描 `src/`，后端扫描项目根目录

### 2. 确定分析范围

根据第 2 个参数确定目标：

| 第 2 参数 | 行为 |
|-----------|------|
| 无 | 前端默认 `src/`，后端默认项目根目录 |
| 文件路径 | Read 该文件，仅分析此文件 |
| 文件夹路径 | 递归列出目录下所有相关源文件，逐个分析 |

### 3. 读取对应规则文件

根据模式 Read 对应的技术栈规则文件，**只加载当前模式需要的规则**：

| 模式 | 规则文件 | 覆盖技术栈 |
|------|----------|-----------|
| `frontend` | [frontend.md](frontend.md) | Vue 3 · TS · JS · Scss · ElementPlus · Echarts · Axios · Pinia · Router |
| `backend` | [backend.md](backend.md) | Java · SpringBoot · SpringCloud · Redis · MyBatis · MySQL · MQ · JVM |

### 4. 按规则分析

按对应文件中的五维分析框架逐项审查，**按优先级**输出。

### 5. 输出格式

按以下结构输出分析结果，**严格按严重性降序排列**：

```markdown
## 优化报告 — <文件名/模块名> [frontend|backend]

### 🔴 Critical（必须修复）

**[C1] 问题标题**
- **位置**：`file.ts:42` / `UserService.java:108`
- **解释**：为什么这是问题，有什么后果
- **修复方案**：
  ```ts
  // Before
  ...
  // After
  ...
  ```

### 🟠 High（强烈建议修复）

**[H1] 问题标题**
- **位置**：`file.ts:108`
- **解释**：...
- **修复方案**：
  ```ts
  // Before / After
  ```

### 🟡 Medium（建议修复）

**[M1] 问题标题**
- **位置**：`file.ts:55`
- **解释**：...
- **修复方案**：...

### 🟢 Low（可选优化）

**[L1] 问题标题**
- **位置**：`file.ts:20`
- **解释**：...
- **修复方案**：...

### 总结
- 预计影响：修复后性能/稳定性提升
- 优先修复顺序：C1 → H1 → M1（建议按此顺序）
```

### 6. 修复执行

- 用户确认后，按优先级从高到低逐个修复
- 每个修复需说明"改了什么"和"为什么"
- 修复完成后再次验证是否引入新问题

---

## 注意事项

- 不做：重构整体架构（除非用户要求）、修改业务逻辑、改路由
- 每次分析聚焦 **指定文件/模块**，不随意扩大范围
- 给出修复建议时附带 **代码示例**，便于用户理解
- 有 Critical 问题时先修复 Critical，再处理其他
- 修复后提示用户验证效果
- 后端分析时，若涉及数据库变更（如加索引），需提示用户**先在测试环境验证执行计划**
