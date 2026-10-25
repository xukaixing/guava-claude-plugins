/**
 * Runtime: original component sources from the PUBLISHED guava-ui package.
 *
 * The npm package ships `lib/guava-ui.es.js.map` with full `sourcesContent`
 * (the original Gv*.vue SFCs). This is the npm-freshness layer: press-derived
 * usage.json can be stale, but what get_source returns is literally the code
 * the consumer project runs.
 *
 * Works on any consumer machine with `pnpm install` — no press, no source checkout.
 */
import fs from 'node:fs';
import path from 'node:path';
import { GUAVA_UI_NPM } from './paths.mjs';

export const GUAVA_UI_SOURCE_MAP = path.join(GUAVA_UI_NPM, 'lib/guava-ui.es.js.map');

let mapCache = { mtimeMs: null, value: null };

function loadMap() {
  let st;
  try {
    st = fs.statSync(GUAVA_UI_SOURCE_MAP);
  } catch {
    return { error: `source map not found: ${GUAVA_UI_SOURCE_MAP}` };
  }
  if (mapCache.value && mapCache.mtimeMs === st.mtimeMs) return mapCache.value;
  try {
    const map = JSON.parse(fs.readFileSync(GUAVA_UI_SOURCE_MAP, 'utf8'));
    /** @type {Record<string, { file: string; content: string }[]>} */
    const byComp = {};
    for (let i = 0; i < map.sources.length; i++) {
      const m = map.sources[i].match(/packages\/(Gv\w+)\//);
      if (!m) continue;
      const content = map.sourcesContent?.[i];
      if (content == null) continue;
      const rel = map.sources[i].replace(/^\.\.\//, '');
      (byComp[m[1]] = byComp[m[1]] || []);
      if (byComp[m[1]].some((e) => e.file === rel)) continue; // vue + tsx compile dupes
      byComp[m[1]].push({ file: rel, content });
    }
    mapCache = { mtimeMs: st.mtimeMs, value: { components: byComp } };
    return mapCache.value;
  } catch (err) {
    return { error: `failed to parse ${GUAVA_UI_SOURCE_MAP}: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/** Parse the SFC header JSDoc (@title / @version / @LastEditTime …). */
function parseSfcHeader(content) {
  const m = content.match(/<!--\s*\n([\s\S]*?)-->/);
  if (!m) return null;
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/@(\w+):\s*(.+)/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

export function getPackageVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(GUAVA_UI_NPM, 'package.json'), 'utf8')).version;
  } catch {
    return null;
  }
}

/**
 * Original sources of one Gv* component, straight from the installed package.
 * @param {string} gvName
 */
export function getComponentNpmSource(gvName) {
  const loaded = loadMap();
  if (loaded.error) return { component: gvName, package: 'guava-ui', error: loaded.error };
  const entries = loaded.components[gvName] || [];
  if (!entries.length) {
    return { component: gvName, package: 'guava-ui', error: `${gvName} not found in guava-ui source map` };
  }
  const files = entries.map(({ file, content }) => ({ file, content, header: parseSfcHeader(content) }));
  const sfc = files.find((f) => f.file.endsWith('.vue'));
  return {
    component: gvName,
    package: 'guava-ui',
    packageVersion: getPackageVersion(),
    sfcVersion: sfc?.header?.version || null,
    sfcLastEditTime: sfc?.header?.LastEditTime || null,
    files: files.map(({ file, content }) => ({ file, content })),
  };
}
