#!/usr/bin/env node
/**
 * Guava Test Manager MCP server (stdio JSON-RPC, async-aware).
 *
 * Bridges Claude agent ↔ Test Manager REST API（/api/mgmt/**）。
 * 零 npm 依赖（Node 18+ 全局 fetch），自包含异步 stdio 循环
 * （_shared/stdio.mjs 的 callTool 是同步的，不支持 fetch，故不复用）。
 *
 * 配置（env）：
 *   GUAVA_TEST_MANAGER_URL   默认 http://localhost:7010
 *   GUAVA_TEST_MANAGER_TOKEN 平台管理 token（对应服务端 API_TOKEN）
 */
const SERVER_INFO = { name: 'test-manager', version: '1.0.0' };

const BASE_URL = (process.env.GUAVA_TEST_MANAGER_URL || 'http://localhost:7010').replace(/\/$/, '');
const API_TOKEN = process.env.GUAVA_TEST_MANAGER_TOKEN || 'change-me-api-token';

// ---- REST 封装 ----------------------------------------------------------

async function callApi(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Token': API_TOKEN,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // 非 JSON 响应
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  if (json && json.code !== 0) {
    throw new Error(`${json.message || '请求失败'} (code=${json.code})`);
  }
  return json ? json.datas : null;
}

const get = (path) => callApi('GET', path);
const put = (path, body) => callApi('PUT', path, body);
const del = (path) => callApi('DELETE', path);
const post = (path, body) => callApi('POST', path, body ?? {});

// ---- 工具定义 -----------------------------------------------------------

const TOOLS = [
  {
    name: 'list_projects',
    description: '列出全部已注册的被测应用（项目卡片：最近运行、通过率统计）',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'upsert_project',
    description: '注册或更新被测应用（幂等，按 projectKey 覆盖）。一个 agent 可管理多个应用',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: '应用唯一标识，如 guava-pro' },
        name: { type: 'string', description: '应用名称' },
        baseUrl: { type: 'string', description: '被测应用访问地址' },
        appType: { type: 'string', description: '应用类型，如 vue3+springboot' },
        loginConfig: {
          type: 'object',
          description: '登录配置（密码明文传入，服务端 AES 加密存储）',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
            loginPath: { type: 'string' },
            menuSelector: { type: 'string' },
          },
        },
        description: { type: 'string' },
      },
      required: ['projectKey', 'name'],
    },
  },
  {
    name: 'get_project',
    description: '查询应用详情（含 webhook token，供 DevOps 接入）',
    inputSchema: {
      type: 'object',
      properties: { projectKey: { type: 'string' } },
      required: ['projectKey'],
    },
  },
  {
    name: 'list_suites',
    description: '列出应用下的测试套件',
    inputSchema: {
      type: 'object',
      properties: { projectKey: { type: 'string' } },
      required: ['projectKey'],
    },
  },
  {
    name: 'upsert_suite',
    description: '创建或更新测试套件（幂等）',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string' },
        suiteKey: { type: 'string', description: '套件标识，如 smoke / menu / form' },
        name: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['projectKey', 'suiteKey', 'name'],
    },
  },
  {
    name: 'delete_suite',
    description: '删除测试套件（级联停用，逻辑删除）',
    inputSchema: {
      type: 'object',
      properties: { projectKey: { type: 'string' }, suiteKey: { type: 'string' } },
      required: ['projectKey', 'suiteKey'],
    },
  },
  {
    name: 'list_cases',
    description: '列出套件下的测试用例（含 spec 源码）',
    inputSchema: {
      type: 'object',
      properties: { projectKey: { type: 'string' }, suiteKey: { type: 'string' } },
      required: ['projectKey', 'suiteKey'],
    },
  },
  {
    name: 'upsert_case',
    description: '创建或更新测试用例（幂等；specContent 为完整 Playwright spec 文件源码，自带 import）',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string' },
        suiteKey: { type: 'string' },
        caseKey: { type: 'string', description: '用例标识，如 menu-nav / login-submit' },
        title: { type: 'string', description: '用例标题（中文）' },
        specContent: { type: 'string', description: '完整 Playwright spec 源码' },
        tags: { type: 'string', description: '标签，逗号分隔，如 smoke,menu' },
        priority: { type: 'string', description: 'P0/P1/P2' },
      },
      required: ['projectKey', 'suiteKey', 'caseKey', 'title', 'specContent'],
    },
  },
  {
    name: 'delete_case',
    description: '删除测试用例',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string' },
        suiteKey: { type: 'string' },
        caseKey: { type: 'string' },
      },
      required: ['projectKey', 'suiteKey', 'caseKey'],
    },
  },
  {
    name: 'create_run',
    description: '触发一次测试运行（创建 run 并按调度模式异步执行）',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string' },
        suiteKeys: { type: 'array', items: { type: 'string' }, description: '缺省执行全部启用套件' },
        baseUrl: { type: 'string', description: '覆盖项目默认地址' },
        env: { type: 'string', description: '环境标识，如 dev/uat' },
        remark: { type: 'string', description: '触发说明' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'get_run',
    description: '查询运行状态（PENDING/RUNNING/PASSED/FAILED/CANCELED/TIMEOUT，含统计）',
    inputSchema: {
      type: 'object',
      properties: { runNo: { type: 'string' } },
      required: ['runNo'],
    },
  },
  {
    name: 'list_run_cases',
    description: '查询运行的用例结果（失败分析入口；onlyFailed 只看失败用例，含错误信息与产物路径）',
    inputSchema: {
      type: 'object',
      properties: {
        runNo: { type: 'string' },
        onlyFailed: { type: 'boolean', description: '只看失败用例，默认 false' },
      },
      required: ['runNo'],
    },
  },
  {
    name: 'rerun_run',
    description: '基于历史运行重新触发一次新运行',
    inputSchema: {
      type: 'object',
      properties: { runNo: { type: 'string' } },
      required: ['runNo'],
    },
  },
  {
    name: 'save_analysis',
    description: '回写运行的失败分析结论（markdown，Web 查看器「失败分析」页签展示）',
    inputSchema: {
      type: 'object',
      properties: { runNo: { type: 'string' }, content: { type: 'string' } },
      required: ['runNo', 'content'],
    },
  },
];

// ---- 工具实现 -----------------------------------------------------------

async function callTool(name, args) {
  switch (name) {
    case 'list_projects':
      return get('/api/mgmt/projects');
    case 'upsert_project':
      return put('/api/mgmt/projects', args);
    case 'get_project':
      return get(`/api/mgmt/projects/${args.projectKey}`);
    case 'list_suites':
      return get(`/api/mgmt/projects/${args.projectKey}/suites`);
    case 'upsert_suite':
      return put(`/api/mgmt/projects/${args.projectKey}/suites/${args.suiteKey}`, {
        name: args.name,
        description: args.description,
      });
    case 'delete_suite':
      return del(`/api/mgmt/projects/${args.projectKey}/suites/${args.suiteKey}`);
    case 'list_cases':
      return get(`/api/mgmt/projects/${args.projectKey}/suites/${args.suiteKey}/cases`);
    case 'upsert_case':
      return put(
        `/api/mgmt/projects/${args.projectKey}/suites/${args.suiteKey}/cases/${args.caseKey}`,
        {
          title: args.title,
          specContent: args.specContent,
          tags: args.tags,
          priority: args.priority,
          source: 'agent',
        },
      );
    case 'delete_case':
      return del(
        `/api/mgmt/projects/${args.projectKey}/suites/${args.suiteKey}/cases/${args.caseKey}`,
      );
    case 'create_run':
      return post('/api/mgmt/runs', {
        projectKey: args.projectKey,
        suiteKeys: args.suiteKeys,
        baseUrl: args.baseUrl,
        env: args.env,
        remark: args.remark,
      });
    case 'get_run':
      return get(`/api/mgmt/runs/${args.runNo}`);
    case 'list_run_cases':
      return get(
        `/api/mgmt/runs/${args.runNo}/cases?size=500${args.onlyFailed ? '&onlyFailed=true' : ''}`,
      );
    case 'rerun_run':
      return post(`/api/mgmt/runs/${args.runNo}/rerun`);
    case 'save_analysis':
      return callApi('PUT', `/api/mgmt/runs/${args.runNo}/analysis`, { content: args.content });
    default:
      throw new Error(`未知工具: ${name}`);
  }
}

// ---- 异步 stdio 循环 ----------------------------------------------------

function send(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}

function ok(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function handleMessage(msg) {
  if (!msg || msg.jsonrpc !== '2.0') return;
  const { id, method, params } = msg;
  if (id === undefined || id === null) return; // 通知类消息忽略

  try {
    switch (method) {
      case 'initialize':
        ok(id, {
          protocolVersion: params?.protocolVersion || '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });
        return;
      case 'ping':
        ok(id, {});
        return;
      case 'tools/list':
        ok(id, { tools: TOOLS });
        return;
      case 'tools/call': {
        const result = await callTool(params?.name, params?.arguments || {});
        ok(id, {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        });
        return;
      }
      default:
        fail(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    fail(id, -32000, err instanceof Error ? err.message : String(err));
  }
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    try {
      void handleMessage(JSON.parse(line));
    } catch (err) {
      fail(null, -32700, `Parse error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
});
process.stdin.on('end', () => {
  // 不立即 exit：让进行中的异步响应（fetch）有机会写出；
  // 事件循环排空后进程自然退出
});
