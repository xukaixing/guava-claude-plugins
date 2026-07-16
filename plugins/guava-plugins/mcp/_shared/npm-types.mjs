/**
 * Parse Gv* component props/emits from node_modules/guava-ui/lib/types/index.d.ts
 */
import fs from 'node:fs';
import { GUAVA_UI_TYPES, GUAVA_UI_NPM } from './paths.mjs';

/**
 * @param {string} source
 * @param {number} openBraceIndex
 */
function extractBalancedBlock(source, openBraceIndex) {
  if (source[openBraceIndex] !== '{') return null;
  let depth = 0;
  let inStr = null;
  let escaped = false;
  for (let i = openBraceIndex; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(openBraceIndex, i + 1);
    }
  }
  return null;
}

/**
 * Map constructor / PropType text to a short type string.
 * @param {string} propBlock
 */
function inferType(propBlock) {
  const propType = propBlock.match(/PropType<\s*([^>]+)\s*>/);
  if (propType) return propType[1].trim().replace(/\s+/g, ' ');
  if (/BooleanConstructor/.test(propBlock)) return 'boolean';
  if (/StringConstructor/.test(propBlock)) return 'string';
  if (/NumberConstructor/.test(propBlock)) return 'number';
  if (/ObjectConstructor/.test(propBlock)) return 'object';
  if (/ArrayConstructor/.test(propBlock)) return 'array';
  if (/FunctionConstructor/.test(propBlock)) return 'function';
  return undefined;
}

/**
 * @param {string} propsBlock inner `{ ... }` of ExtractPropTypes
 */
function parsePropsBlock(propsBlock) {
  const inner = propsBlock.slice(1, -1);
  /** @type {{ name: string; type?: string; required?: boolean; default?: string }[]} */
  const props = [];
  const propRe = /^\s*([A-Za-z_][\w]*)\s*:\s*\{/gm;
  let m;
  while ((m = propRe.exec(inner))) {
    const name = m[1];
    const propOpen = inner.indexOf('{', m.index + m[0].length - 1);
    const propBlock = extractBalancedBlock(inner, propOpen);
    if (!propBlock) continue;
    const required = /\brequired\s*:\s*true\b/.test(propBlock);
    const defaultMatch = propBlock.match(/\bdefault\s*:\s*([^;\n]+)/);
    props.push({
      name,
      type: inferType(propBlock),
      required,
      default: defaultMatch ? defaultMatch[1].trim().replace(/\s+/g, ' ') : undefined,
    });
    propRe.lastIndex = propOpen + propBlock.length;
  }
  return props;
}

/**
 * After first ExtractPropTypes block, look for emits tuple like `("click" | "confirm")[]`
 * @param {string} afterProps
 */
function parseEmitsFromTail(afterProps) {
  const tuple = afterProps.match(/\(\s*((?:"[^"]+"\s*\|\s*)*"[^"]+")\s*\)\s*\[\]/);
  if (tuple) {
    return [...tuple[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  return [];
}

/**
 * @param {string} [typesPath]
 */
export function loadTypesSource(typesPath = GUAVA_UI_TYPES) {
  if (!fs.existsSync(typesPath)) {
    return { error: `guava-ui types not found: ${typesPath}. Run pnpm install.`, source: '' };
  }
  return { source: fs.readFileSync(typesPath, 'utf8'), typesPath, npmRoot: GUAVA_UI_NPM };
}

/**
 * List all `export declare const Gv*` names.
 * @param {string} [source]
 */
export function listGvFromTypes(source) {
  const { source: src, error } = source ? { source } : loadTypesSource();
  if (error) return [];
  return [...src.matchAll(/export declare const (Gv[A-Za-z0-9]+)\s*:/g)].map((m) => m[1]);
}

/**
 * @param {string} gvName
 * @param {string} [source]
 */
export function getComponentFromTypes(gvName, source) {
  const loaded = source ? { source, typesPath: GUAVA_UI_TYPES, npmRoot: GUAVA_UI_NPM } : loadTypesSource();
  if (loaded.error) {
    return { name: gvName, props: [], emits: [], error: loaded.error, source: 'npm-types' };
  }
  const src = loaded.source;
  const re = new RegExp(`export declare const ${gvName}\\s*:\\s*DefineComponent<`);
  const m = re.exec(src);
  if (!m || m.index == null) {
    return {
      name: gvName,
      props: [],
      emits: [],
      error: `${gvName} not found in guava-ui types`,
      source: 'npm-types',
      typesPath: loaded.typesPath,
    };
  }

  const after = src.slice(m.index + m[0].length);
  /** @type {{ name: string; type?: string; required?: boolean; default?: string }[]} */
  let props = [];
  let emits = [];

  if (after.trimStart().startsWith('ExtractPropTypes')) {
    const braceIdx = after.indexOf('{');
    const propsBlock = extractBalancedBlock(after, braceIdx);
    if (propsBlock) {
      props = parsePropsBlock(propsBlock);
      const afterProps = after.slice(braceIdx + propsBlock.length);
      emits = parseEmitsFromTail(afterProps);
    }
  } else if (after.trimStart().startsWith('{')) {
    // DefineComponent<{ ... }> (e.g. GvIcon style) — try first brace as props
    const braceIdx = after.indexOf('{');
    const propsBlock = extractBalancedBlock(after, braceIdx);
    if (propsBlock && propsBlock.length > 2) {
      props = parsePropsBlock(propsBlock);
    }
  }

  return {
    name: gvName,
    props,
    emits,
    source: 'npm-types',
    typesPath: loaded.typesPath,
    npmRoot: loaded.npmRoot,
    package: 'guava-ui',
  };
}

/**
 * Full catalog from npm types.
 */
export function buildNpmCatalog() {
  const loaded = loadTypesSource();
  if (loaded.error) return { error: loaded.error, components: [] };
  const names = listGvFromTypes(loaded.source);
  return {
    npmRoot: loaded.npmRoot,
    typesPath: loaded.typesPath,
    components: names.map((name) => getComponentFromTypes(name, loaded.source)),
  };
}
