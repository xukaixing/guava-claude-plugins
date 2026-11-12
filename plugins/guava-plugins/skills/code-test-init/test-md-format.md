# 测试功能 md 格式规范（e2e/cases/<feature>.md）

> code-test-init 的生成目标格式，也是 guava-test `feature` 输入的解析格式。
> **仅供生成/核对时读**；frontmatter 禁止出现 `baseUrl` / `username` / `password`（那是 `e2e.test.md` 环境配置的字段）。

## 完整骨架

```markdown
---
# 测试专用功能 md（与 src/pages 生成配置独立维护）
# 维护时机：功能逻辑变化（字段/按钮/校验/文案）时同步更新本文件
feature: <feature>            # 与 src/pages md 的 feature 一致（纯源码模式取 view 末级）
title: <页面标题>
view: <module/view>          # → src/views/<view>/，guava-test 用它交叉核对
menuPath: [一级菜单, 二级菜单]   # 可选；router/菜单配置里找不到就省略
---

# 布局/联动备注（可选）：树+表格、页签、多编辑容器、字典联动等测试需要知道的页面结构

## 查询

| 名称 | 字段 | 类型 | 校验 | 长度 | 扩展 |
| <label> | <field> | text/dic/date/… | <format 校验> | <长度> | dic=<字典>，默认值等 |

## 表格

| 名称 | 字段 | 类型 | 扩展 |
| <列名> | <prop> | dic:<字典>/tag/GvSwitch/… | 固定列、渲染备注 |

## 表格工具栏

<按钮文案>（容器/行为备注）,…

## 操作列

<按钮文案>（行级，行为备注）,…

## 编辑表单

编辑容器：<GvDialog/GvDrawer 等>，标题「<标题>」，<尺寸>；保存按钮位置与文案；联动逻辑备注。

| 名称 | 字段 | 类型 | 必填 | 校验 | 长度 | 只读/禁用 | 扩展 |
| <label> | <field> | <type> | Y/空 | <format> | <长度> | <条件> | dic=、默认值、联动 |

<!-- 漂移记录（仅与 src/pages md 有冲突时列出）：
  - <项>：<旧 md 说法> → <源码实际>
-->
```

## 字段映射规则（Vue 源码 → 表行）

| 源码信号 | 提取为 |
| --- | --- |
| `format: [n, 'isXxx', len]` | `必填` = `Y`（n=1）/空（n=0）；`校验` = `isXxx`；`长度` = `len` |
| `type: 'dic'` + `dicType` | `类型` = `dic`，`扩展` += `dic=<dicType>` |
| `value` / `showLabel` 硬编码默认值 | `扩展` += `默认「<label>」(<value>)` |
| `disabled` / `hidden: true` | `只读/禁用` 列写明条件 |
| `crud.save/update` + `ElMessage` 文案 | 编辑表单备注里的成功提示 |
| `confirm('<文案>')` | 对应按钮备注里的二次确认文案 |
| 按钮 `v-if` 权限条件 | 按钮备注里注明可见条件 |

## 漂移记录约定

- 只在「src/pages md 基线与源码冲突」时写，逐条：`- <项>：<旧 md> → <源码实际>`
- 纯源码模式（无基线 md）不写漂移块，报告里覆盖来源标「纯源码」
