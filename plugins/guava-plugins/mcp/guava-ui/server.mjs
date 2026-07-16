#!/usr/bin/env node
/**
 * Guava UI MCP server (stdio JSON-RPC).
 * Exposes Gv* component catalog so Claude Code can generate pages with Guava UI.
 */
import {
  EL_TO_GV,
  getCatalog,
  getComponentDetail,
  getPageRecipe,
  resolveComponent,
  searchComponents,
} from './lib/catalog.mjs';

const SERVER_INFO = {
  name: 'guava-ui',
  version: '1.0.0',
};

const TOOLS = [
  {
    name: 'list_gv_components',
    description:
      'List all Guava UI Gv* components with category and summary. Call before generating Vue pages to prefer Gv* over el-*.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional filter: form | data | action | feedback | layout | nav | shell | other',
        },
        pageLevelOnly: {
          type: 'boolean',
          description: 'If true, only components commonly used in business pages',
        },
      },
    },
  },
  {
    name: 'get_gv_component',
    description:
      'Get one Gv* component: props, emits, usage notes, and README. Use when writing template bindings for a specific component.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name, e.g. GvForm / GvTable / GvButton',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'search_gv_components',
    description: 'Search Gv* components by keyword (name, prop, summary, el-* alias).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword' },
      },
      required: ['query'],
    },
  },
  {
    name: 'resolve_gv_component',
    description:
      'Map Element Plus tag (el-form) or Chinese/English intent (表单/dialog) to the preferred Gv* component, with props.',
    inputSchema: {
      type: 'object',
      properties: {
        hint: {
          type: 'string',
          description: 'el-* tag, component keyword, or Chinese intent',
        },
      },
      required: ['hint'],
    },
  },
  {
    name: 'get_page_recipe',
    description:
      'Get recommended Gv* composition for a page type: crud-list | form-edit | form-only | tabs. Call when scaffolding a page.',
    inputSchema: {
      type: 'object',
      properties: {
        recipe: {
          type: 'string',
          description: 'crud-list | form-edit | form-only | tabs',
        },
      },
      required: ['recipe'],
    },
  },
  {
    name: 'list_el_to_gv_mapping',
    description: 'Return full Element Plus → Guava UI (Gv*) mapping table used when generating templates.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * @param {string} name
 * @param {Record<string, unknown>} args
 */
function callTool(name, args = {}) {
  switch (name) {
    case 'list_gv_components': {
      let list = getCatalog(true);
      if (args.category) {
        const cat = String(args.category).toLowerCase();
        list = list.filter((c) => c.category === cat);
      }
      if (args.pageLevelOnly) list = list.filter((c) => c.pageLevel);
      return {
        count: list.length,
        rule: 'Prefer Gv* from guava-ui; use el-* only when no Gv* wrapper exists.',
        components: list.map((c) => ({
          name: c.name,
          category: c.category,
          summary: c.summary,
          pageLevel: c.pageLevel,
          elFallback: c.elFallback,
          propCount: c.props.length,
          hasReadme: c.hasReadme,
        })),
      };
    }
    case 'get_gv_component': {
      const detail = getComponentDetail(String(args.name || ''));
      if (!detail) {
        return { error: `Component not found: ${args.name}`, hint: 'Try list_gv_components or search_gv_components' };
      }
      return detail;
    }
    case 'search_gv_components': {
      const hits = searchComponents(String(args.query || ''));
      return {
        count: hits.length,
        components: hits.map((c) => ({
          name: c.name,
          category: c.category,
          summary: c.summary,
          elFallback: c.elFallback,
        })),
      };
    }
    case 'resolve_gv_component':
      return resolveComponent(String(args.hint || ''));
    case 'get_page_recipe':
      return getPageRecipe(String(args.recipe || ''));
    case 'list_el_to_gv_mapping':
      return { mapping: EL_TO_GV };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function send(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}

function ok(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

/**
 * @param {any} msg
 */
async function handleMessage(msg) {
  if (!msg || msg.jsonrpc !== '2.0') return;
  const { id, method, params } = msg;

  // Notifications (no id)
  if (id === undefined || id === null) {
    if (method === 'notifications/initialized' || method === 'initialized') return;
    return;
  }

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
        const toolName = params?.name;
        const args = params?.arguments || {};
        const result = callTool(toolName, args);
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
      const msg = JSON.parse(line);
      void handleMessage(msg);
    } catch (err) {
      send({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${err instanceof Error ? err.message : String(err)}` },
      });
    }
  }
});

process.stdin.on('end', () => process.exit(0));
