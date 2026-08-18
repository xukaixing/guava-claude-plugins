#!/usr/bin/env node
/**
 * MySQL schema MCP server (stdio JSON-RPC).
 * Reads connection from db.yml, exposes information_schema tools so Claude can
 * introspect tables and generate Guava page configs from DB structure.
 *
 * Self-contained stdio loop (async-aware): mysql2 queries are async, so we do
 * NOT reuse _shared/stdio.mjs (whose tools/call is synchronous).
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SERVER_INFO = { name: 'mysql-schema', version: '1.0.0' };

// ---- config ------------------------------------------------------------
function parseDbConfig(text) {
  const cfg = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    const hash = val.indexOf(' #');
    if (hash >= 0) val = val.slice(0, hash).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) cfg[key] = val;
  }
  return cfg;
}

// db.yml 解析优先级（高 → 低）：
// 1. ${CLAUDE_PROJECT_DIR}/db.yml —— 业务工程（如 ses-web）根目录，可独立配置某个库，随工程 gitignore
// 2. ${CLAUDE_PLUGIN_ROOT}/mcp/mysql-schema/db.yml —— 插件自身全局兜底
function resolveDbConfigPath() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.env.GUAVA_PROJECT_DIR;
  if (projectDir) {
    const projectDb = join(projectDir, 'db.yml');
    if (existsSync(projectDb)) return projectDb;
  }
  return join(__dirname, 'db.yml');
}

let dbConfig = null;
try {
  dbConfig = parseDbConfig(readFileSync(resolveDbConfigPath(), 'utf8'));
} catch {
  dbConfig = null;
}

function toBool(value) {
  return value === true || value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

async function getPool() {
  if (!dbConfig) {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.env.GUAVA_PROJECT_DIR;
    const candidates = projectDir
      ? [join(projectDir, 'db.yml'), join(__dirname, 'db.yml')]
      : [join(__dirname, 'db.yml')];
    throw new Error(
      `未配置 db.yml：请复制 db.example.yml 为 db.yml 并填写连接信息。查找位置：\n  ${candidates.join('\n  ')}`
    );
  }
  const {
    host,
    port,
    database,
    user,
    password,
    ssl,
    ssl_reject_unauthorized,
    ssl_ca,
    ssl_cert,
    ssl_key,
  } = dbConfig;
  const useSsl = toBool(ssl);

  // MySQL 8.0 默认认证为 caching_sha2_password：
  // - 开启 SSL 时密码走 TLS 通道，无需额外配置；
  // - 未开 SSL 时 mysql2 会自动索取服务端 RSA 公钥完成认证（无 allowPublicKeyRetrieval 选项）。
  const sslOptions = useSsl
    ? {
        // 内网/自签证书默认放宽校验；生产环境设 ssl_reject_unauthorized: true 走系统 CA
        rejectUnauthorized: toBool(ssl_reject_unauthorized),
        ...(ssl_ca ? { ca: readFileSync(ssl_ca) } : {}),
        ...(ssl_cert ? { cert: readFileSync(ssl_cert) } : {}),
        ...(ssl_key ? { key: readFileSync(ssl_key) } : {}),
      }
    : undefined;

  return mysql.createPool({
    host,
    port: Number(port) || 3306,
    database,
    user,
    password,
    ssl: sslOptions,
    waitForConnections: true,
    connectionLimit: 2,
    connectTimeout: 5000,
  });
}

// ---- tools -------------------------------------------------------------
const TOOLS = [
  {
    name: 'list_databases',
    description: 'List all databases on the connected MySQL server.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_tables',
    description: 'List tables (name + comment) in a database. Defaults to the database in db.yml.',
    inputSchema: {
      type: 'object',
      properties: {
        database: { type: 'string', description: 'Database name (optional; defaults to db.yml database)' },
      },
    },
  },
  {
    name: 'get_table_columns',
    description: 'Return column metadata for one table (name, type, key, nullable, default, comment, lengths).',
    inputSchema: {
      type: 'object',
      properties: {
        database: { type: 'string', description: 'Database name' },
        table: { type: 'string', description: 'Table name' },
      },
      required: ['database', 'table'],
    },
  },
  {
    name: 'get_table_comment',
    description: 'Return table name + comment (used as page title).',
    inputSchema: {
      type: 'object',
      properties: {
        database: { type: 'string', description: 'Database name' },
        table: { type: 'string', description: 'Table name' },
      },
      required: ['database', 'table'],
    },
  },
];

async function callTool(toolName, args) {
  const pool = await getPool();
  try {
    switch (toolName) {
      case 'list_databases': {
        const [rows] = await pool.query('SHOW DATABASES');
        return { databases: rows.map((r) => Object.values(r)[0]) };
      }
      case 'list_tables': {
        const db = args.database || dbConfig?.database;
        const [rows] = await pool.query(
          `SELECT TABLE_NAME, TABLE_COMMENT
             FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME`,
          [db]
        );
        return { database: db, tables: rows };
      }
      case 'get_table_columns': {
        const { database, table } = args;
        const [rows] = await pool.query(
          `SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE, COLUMN_KEY, IS_NULLABLE,
                  COLUMN_DEFAULT, COLUMN_COMMENT, CHARACTER_MAXIMUM_LENGTH,
                  NUMERIC_PRECISION, NUMERIC_SCALE, EXTRA, ORDINAL_POSITION
             FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION`,
          [database, table]
        );
        return { database, table, columns: rows };
      }
      case 'get_table_comment': {
        const { database, table } = args;
        const [rows] = await pool.query(
          `SELECT TABLE_NAME, TABLE_COMMENT
             FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [database, table]
        );
        return rows[0] || { TABLE_NAME: table, TABLE_COMMENT: '' };
      }
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } finally {
    await pool.end();
  }
}

// ---- stdio (async-aware) ----------------------------------------------
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
  if (id === undefined || id === null) return;

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
        const result = await callTool(toolName, args);
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
