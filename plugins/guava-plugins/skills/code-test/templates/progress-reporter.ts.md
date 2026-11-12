---
target: e2e/progress-reporter.ts            # e2e/ 下，与 fixtures.ts 同级
needs: ['@playwright/test']
---

提取下方 ```ts 代码块，**逐字**写入 `e2e/progress-reporter.ts`（已存在则跳过，见 fixtures.md §1）。
该 reporter 由 `playwright.config.ts` 注册：每条用例结束实时写 `e2e/progress.log`（时间戳 / 进度序号 / 单条耗时 / worker），运行结束写 `e2e/reports/last-run-summary.json`（总耗时 + 每用例耗时 + 最慢 Top5）。后台跑测试时可 `tail -f e2e/progress.log` 观察实时进度。

```ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * 实时进度 reporter
 * - 每条用例结束即写一行到 e2e/progress.log（含耗时 / worker / 进度序号），并同步输出到 stdout
 * - 运行结束追加汇总行，并落盘 e2e/reports/last-run-summary.json（总耗时 + 每用例耗时 + 最慢 Top5）
 * 后台 agent 跑测试时，主会话可 tail -f e2e/progress.log 实时观察进度
 */
const E2E_DIR = path.dirname(new URL(import.meta.url).pathname);
const LOG_FILE = path.join(E2E_DIR, 'progress.log');
const SUMMARY_FILE = path.join(E2E_DIR, 'reports', 'last-run-summary.json');

const fmtDuration = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;
const now = (): string => new Date().toLocaleTimeString('zh-CN', { hour12: false });

const STATUS_ICON: Record<string, string> = {
  passed: '✓',
  failed: '✗',
  timedOut: '✗',
  skipped: '↓',
  interrupted: '✗',
};

/** 用例标题（describe 路径 › 用例名），去除 file / project 前缀 */
const titleOf = (test: TestCase): string => {
  const parts: string[] = [];
  let parent: Suite | undefined = test.parent;
  while (parent && parent.title) {
    parts.unshift(parent.title);
    parent = parent.parent;
  }
  return [...parts, test.title].join(' › ');
};

export default class ProgressReporter implements Reporter {
  private startedAt = 0;
  private total = 0;
  private finished = 0;
  private rows: { title: string; status: string; duration: number }[] = [];

  onBegin(_config: unknown, suite: Suite) {
    this.startedAt = Date.now();
    this.total = suite.allTests().length;
    this.finished = 0;
    this.rows = [];
    const header = `[${now()}] ▶ 开始执行 ${this.total} 条用例`;
    fs.writeFileSync(LOG_FILE, `${header}\n`);
    process.stdout.write(`${header}\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.finished += 1;
    const title = titleOf(test);
    this.rows.push({ title, status: result.status, duration: result.duration });
    const icon = STATUS_ICON[result.status] ?? '?';
    const line = `[${now()}] ${icon} ${String(this.finished).padStart(3, '0')}/${String(this.total).padStart(3, '0')}  ${fmtDuration(result.duration).padStart(7)}  w${result.workerIndex}  ${title}`;
    try {
      fs.appendFileSync(LOG_FILE, `${line}\n`);
    } catch {
      // 日志写入失败不影响测试
    }
    process.stdout.write(`${line}\n`);
    if (result.status === 'failed' || result.status === 'timedOut') {
      const errLine = `    └─ ${result.error?.message?.split('\n')[0] ?? '未知错误'}`;
      try {
        fs.appendFileSync(LOG_FILE, `${errLine}\n`);
      } catch {
        // 忽略
      }
      process.stdout.write(`${errLine}\n`);
    }
  }

  onEnd(result: FullResult) {
    const wallMs = Date.now() - this.startedAt;
    const passed = this.rows.filter((r) => r.status === 'passed').length;
    const failed = this.rows.filter((r) => r.status === 'failed' || r.status === 'timedOut').length;
    const skipped = this.rows.filter((r) => r.status === 'skipped').length;
    const slowest = [...this.rows].sort((a, b) => b.duration - a.duration).slice(0, 5);
    const footer = `[${now()}] ■ 运行结束：${result.status}，总耗时 ${fmtDuration(wallMs)}（共 ${this.rows.length} 条：通过 ${passed} / 失败 ${failed} / 跳过 ${skipped}）`;
    try {
      fs.appendFileSync(LOG_FILE, `${footer}\n`);
      for (const row of slowest) {
        fs.appendFileSync(LOG_FILE, `    最慢 ${fmtDuration(row.duration).padStart(7)}  ${row.title}\n`);
      }
      fs.mkdirSync(path.dirname(SUMMARY_FILE), { recursive: true });
      fs.writeFileSync(
        SUMMARY_FILE,
        JSON.stringify(
          {
            startTime: new Date(this.startedAt).toISOString(),
            endTime: new Date().toISOString(),
            wallTimeMs: wallMs,
            status: result.status,
            total: this.rows.length,
            passed,
            failed,
            skipped,
            slowestTop5: slowest,
            tests: this.rows,
          },
          null,
          2,
        ),
      );
    } catch {
      // 汇总落盘失败不影响测试结果
    }
    process.stdout.write(`${footer}\n`);
    return undefined;
  }
}
```
