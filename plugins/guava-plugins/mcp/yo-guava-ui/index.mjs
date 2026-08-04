#!/usr/bin/env node
/**
 * Entry: ensure deps installed, then run main.mjs.
 * Design: keeps .mcp.json command as plain `node index.js` with no build step.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nodeModules = join(__dirname, 'node_modules');

if (!existsSync(nodeModules)) {
  const r = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

await import('./main.mjs');
