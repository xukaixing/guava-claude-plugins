/**
 * Per-component Guava UI MCP factory.
 * Runtime: npm types (node_modules/guava-ui) + vendored usage.json (from press at generate time).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getComponentFromTypes } from './npm-types.mjs';
import { createStdioServer } from './stdio.mjs';
import { toMcpKey } from './paths.mjs';
import { loadVendoredUsage } from './vendored-docs.mjs';

/**
 * @param {{ gvName: string; componentDir?: string }} opts
 */
export function startComponentServer({ gvName, componentDir }) {
  const serverName = toMcpKey(gvName);
  const dir = componentDir;

  const tools = [
    {
      name: 'get_usage',
      description: `Get ${gvName} usage guide (vendored from press: tip + markdown + inlined examples). Call before writing Vue templates.`,
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_api',
      description: `Get ${gvName} Attributes / Events / Slots / Exposes API (vendored from press).`,
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_examples',
      description: `Get ${gvName} example Vue sources (vendored; no press needed at runtime).`,
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Optional example id filter (e.g. basic)' },
        },
      },
    },
    {
      name: 'get_props',
      description: `Get ${gvName} props/emits from installed guava-ui (node_modules/.../lib/types/index.d.ts).`,
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_all',
      description: `Full ${gvName}: npm props + vendored usage/API/examples.`,
      inputSchema: { type: 'object', properties: {} },
    },
  ];

  function callTool(name, args = {}) {
    const usage = loadVendoredUsage(gvName, dir);
    const pkg = getComponentFromTypes(gvName);

    switch (name) {
      case 'get_usage':
        return {
          component: gvName,
          tip: usage.tip,
          markdown: usage.usageMarkdown || usage.markdown,
          docSlug: usage.docSlug,
          generatedAt: usage.generatedAt,
          error: usage.error,
        };
      case 'get_api':
        return {
          component: gvName,
          api: usage.api,
          tip: usage.tip,
          error: usage.error || (usage.api ? undefined : 'No API in usage.json'),
        };
      case 'get_examples': {
        let list = usage.examples || [];
        if (args.id) {
          const q = String(args.id).toLowerCase();
          list = list.filter(
            (e) =>
              String(e.id).toLowerCase().includes(q) || String(e.file).toLowerCase().includes(q),
          );
        }
        return { component: gvName, count: list.length, examples: list, error: usage.error };
      }
      case 'get_props':
      case 'get_package':
        return pkg;
      case 'get_all':
        return {
          component: gvName,
          rule: 'Prefer Gv*; use vendored usage + npm props. Do not invent props. No press/guava-ui source needed.',
          props: pkg,
          docs: {
            tip: usage.tip,
            markdown: usage.usageMarkdown || usage.markdown,
            api: usage.api,
            examples: usage.examples,
            docSlug: usage.docSlug,
            generatedAt: usage.generatedAt,
            error: usage.error,
          },
        };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  createStdioServer({
    name: serverName,
    version: '1.1.0',
    tools,
    callTool,
  });
}

/**
 * Resolve component dir from the calling server.mjs import.meta.url
 * @param {string} importMetaUrl
 */
export function componentDirFrom(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}
