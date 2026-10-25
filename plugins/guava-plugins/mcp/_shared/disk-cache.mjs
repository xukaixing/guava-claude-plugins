/**
 * Cross-session disk cache for MCP tool results.
 *
 * Key = server | tool | canonical(args) | fingerprint(source files).
 * Fingerprint = each source file's `path:mtimeMs:size` (stat per call, cheap),
 * so any of these invalidates automatically:
 *   - generate-components.mjs rewrites usage.json
 *   - consumer runs pnpm install / upgrades guava-ui (index.d.ts mtime changes)
 *
 * Store: ${CLAUDE_PROJECT_DIR}/.claude/cache/guava-mcp/<sha1>.json
 * (per-consumer isolation; plugin root may be a read-only versioned cache dir,
 *  tmpdir would lose entries across sessions.)
 *
 * Debug: GUAVA_MCP_CACHE_DEBUG=1 logs hits/misses to stderr.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { COMPONENTS_DIR, GUAVA_UI_NPM, GUAVA_UI_TYPES, resolveProjectRoot } from './paths.mjs';

let cacheDir;
function getCacheDir() {
  if (cacheDir !== undefined) return cacheDir;
  try {
    const dir = path.join(resolveProjectRoot(), '.claude', 'cache', 'guava-mcp');
    fs.mkdirSync(dir, { recursive: true });
    cacheDir = dir;
  } catch {
    cacheDir = null; // unwritable → caching disabled, tool still works
  }
  return cacheDir;
}

/** Stable JSON (sorted keys) so equal args hash equal regardless of key order. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** `path:mtimeMs:size` per file; missing files fingerprint as `path:missing`. */
function fingerprint(files) {
  return (files || [])
    .filter(Boolean)
    .map((file) => {
      try {
        const st = fs.statSync(file);
        return `${file}:${st.mtimeMs}:${st.size}`;
      } catch {
        return `${file}:missing`;
      }
    })
    .join('|');
}

const DEBUG = process.env.GUAVA_MCP_CACHE_DEBUG === '1';
const dbg = (line) => {
  if (DEBUG) process.stderr.write(`[guava-mcp-cache] ${line}\n`);
};

/** All vendored usage.json paths (for catalog-wide tool results). */
export function allUsageJsonSources() {
  const files = [];
  try {
    for (const entry of fs.readdirSync(COMPONENTS_DIR)) {
      const usage = path.join(COMPONENTS_DIR, entry, 'usage.json');
      if (fs.existsSync(usage)) files.push(usage);
    }
  } catch {
    /* components dir unreadable → fingerprint only what we found */
  }
  return files;
}

/**
 * @param {string} serverName
 * @param {(name: string, args: Record<string, unknown>) => unknown} callTool
 * @param {() => (string | null | undefined)[]} getSources files whose mtime/size affect the result
 */
export function withDiskCache(serverName, callTool, getSources) {
  return (name, args = {}) => {
    const dir = getCacheDir();
    if (!dir) return callTool(name, args);

    const key = crypto
      .createHash('sha1')
      .update(`${serverName}|${name}|${canonical(args)}|${fingerprint(getSources())}`)
      .digest('hex');
    const file = path.join(dir, `${key}.json`);

    try {
      if (fs.existsSync(file)) {
        dbg(`hit  ${serverName}/${name} ${key.slice(0, 10)}`);
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    } catch {
      /* unreadable/corrupt entry → recompute below */
    }

    const result = callTool(name, args);
    try {
      fs.writeFileSync(file, JSON.stringify(result));
      dbg(`miss ${serverName}/${name} ${key.slice(0, 10)}`);
    } catch {
      /* unwritable → result still returned, just not cached */
    }
    return result;
  };
}

/** Sources for per-component servers: vendored usage.json + live npm types + npm source map (get_source). */
export function componentSources(componentDir) {
  return () => [
    path.join(componentDir, 'usage.json'),
    GUAVA_UI_TYPES,
    path.join(GUAVA_UI_NPM, 'lib/guava-ui.es.js.map'),
  ];
}
