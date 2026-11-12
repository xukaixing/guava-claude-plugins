# Bug 台账与测试报告落盘规范

> 主流程 `SKILL.md` Step 5/7

测试产物除 spec 外落两份文档，均位于消费项目 `e2e/` 下，可提交 git（**禁止写入凭据**）：

| 文件 | 性质 | 写入时机 |
| --- | --- | --- |
| `e2e/bugs.md` | 统一 bug 台账（append-only，跨功能累积） | 每条「疑似被测系统 bug」确认后立即追加 |
| `e2e/reports/<feature>-<YYYYMMDD-HHmm>.md` | 单次运行完整报告 | 每轮测试结束（含重跑后最终结果） |

---

## 1. `e2e/bugs.md`（统一 bug 文档）

文件不存在时创建，头部固定：

```markdown
# E2E 缺陷台账

> 由 guava-test 自动追加；状态流转：待确认 → 已提工单 / 已修复 / 误报
> 证据相对路径基于工程根（screenshot / trace 在 e2e/test-results/ 下）

| 编号 | 日期 | 功能 | 环境 | 用例 | 期望 | 实际 | 复现步骤 | 证据 | suspected 层 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

每条疑似系统 bug 追加一行：

| 列 | 取值规则 |
| --- | --- |
| 编号 | `BUG-<4位序号>`，续现有最大序号 +1 |
| 日期 | `YYYY-MM-DD` |
| 功能 | feature 名（如 `userMng`） |
| 环境 | baseUrl 主机名部分（如 `foton.ses.ccexpert.top`） |
| 用例 | spec 用例标题（中文） |
| 期望 / 实际 | 一句话各概括 |
| 复现步骤 | `1. … 2. … 3. …`，从 spec 操作提炼 |
| 证据 | screenshot / trace / video 相对路径，多个用 `<br>` 分隔 |
| suspected 层 | `前端` / `后端` / `待定位` |
| 状态 | 新条目固定 `待确认` |

**不入台账的**：选择器 / 测试代码问题（修 spec 重跑即可）、超出授权跳过的用例、测试数据构造失败——这些只进运行报告。

## 2. `e2e/reports/<feature>-<YYYYMMDD-HHmm>.md`（单次运行报告）

结构在 SKILL.md Step 7 报告格式基础上增加：bug 台账回链（`→ BUG-0007`）、每轮执行的通过/失败计数（重跑记录各轮）。命名用开跑时间戳，重跑覆盖同一份（更新最终结果与轮次记录）。

## 3. 证据留存

- 失败用例的 screenshot / trace 由 Playwright 自动产出在 `e2e/test-results/`；报告与台账只引用相对路径，**禁止拷贝大文件**
- trace 目录会被下次运行清理（outputDir 覆盖），重要证据在报告里注明后由人工归档
