/**
 * Runtime: load vendored usage.json next to each component MCP.
 */
import fs from 'node:fs';
import path from 'node:path';
import { COMPONENTS_DIR } from './paths.mjs';

/**
 * @param {string} gvName
 * @param {string} [componentDir]
 */
export function loadVendoredUsage(gvName, componentDir) {
  const dir = componentDir || path.join(COMPONENTS_DIR, gvName);
  const jsonPath = path.join(dir, 'usage.json');
  if (!fs.existsSync(jsonPath)) {
    return {
      gvName,
      error:
        'usage.json missing. On a machine with guava-press, run: node .claude/mcp/generate-components.mjs',
    };
  }
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return { ...data, gvName: data.gvName || gvName, vendoredPath: jsonPath };
  } catch (err) {
    return {
      gvName,
      error: `Failed to parse usage.json: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
