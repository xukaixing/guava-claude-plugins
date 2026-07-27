#!/usr/bin/env node
/**
 * yo-guava-ui MCP server (stdio).
 * Tools: list_components, search_components.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { YoDocsDB } from '@voyo/docs-db';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '.yo_ddb', 'data', 'docs.db');
const DOCS_DIR = join(__dirname, '.yo_ddb', 'docs');

const db = new YoDocsDB({ dbPath: DB_PATH, docsDir: DOCS_DIR });

const server = new Server(
  { name: 'yo-guava-ui', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_components',
      description: 'List all Guava UI Gv* components with keywords.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'search_components',
      description: 'Search Guava UI components by keyword (e.g. "button 按钮").',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword' },
          limit: { type: 'number', description: 'Max results (default 5)' },
        },
        required: ['query'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  if (name === 'list_components') {
    const { documents } = db.list({ type: 'frontend', lang: 'vue' });
    const components = documents.map((d) => ({
      name: d.doc_path.replace('.md', ''),
      question: d.question,
    }));
    return { content: [{ type: 'text', text: JSON.stringify(components, null, 2) }] };
  }
  if (name === 'search_components') {
    const { results } = await db.query({
      type: 'frontend',
      lang: 'vue',
      query: String(args.query || ''),
      limit: Number(args.limit) || 5,
    });
    const hits = results.map((r) => ({
      name: r.doc_path.replace('.md', ''),
      question: r.question,
      match_count: r.match_count,
      matched_words: r.matched_words,
      content: r.content,
    }));
    return { content: [{ type: 'text', text: JSON.stringify(hits, null, 2) }] };
  }
  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[yo-guava-ui] MCP server running');
