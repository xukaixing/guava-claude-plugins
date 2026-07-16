/**
 * Lightweight Vue SFC props/emits extraction for Gv* packages.
 */

/**
 * Extract balanced `{...}` starting at openBraceIndex.
 * @param {string} source
 * @param {number} openBraceIndex
 */
export function extractBalancedBlock(source, openBraceIndex) {
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
 * @param {string} source
 * @returns {{ name: string; type?: string; required?: boolean; default?: string }[]}
 */
export function parseProps(source) {
  const propsMatch = source.match(/\bprops\s*:\s*\{/);
  if (!propsMatch || propsMatch.index == null) return [];
  const open = source.indexOf('{', propsMatch.index + propsMatch[0].length - 1);
  const block = extractBalancedBlock(source, open);
  if (!block) return [];

  const inner = block.slice(1, -1);
  /** @type {{ name: string; type?: string; required?: boolean; default?: string }[]} */
  const props = [];
  const propRe = /^\s*([A-Za-z_][\w]*)\s*:\s*\{/gm;
  let m;
  while ((m = propRe.exec(inner))) {
    const name = m[1];
    const propOpen = inner.indexOf('{', m.index + m[0].length - 1);
    const propBlock = extractBalancedBlock(inner, propOpen);
    if (!propBlock) continue;
    const typeMatch = propBlock.match(/\btype\s*:\s*([^,\n]+)/);
    const required = /\brequired\s*:\s*true\b/.test(propBlock);
    const defaultMatch = propBlock.match(/\bdefault\s*:\s*([^,\n]+)/);
    props.push({
      name,
      type: typeMatch ? typeMatch[1].trim().replace(/\s+/g, ' ') : undefined,
      required,
      default: defaultMatch ? defaultMatch[1].trim().replace(/\s+/g, ' ') : undefined,
    });
    propRe.lastIndex = propOpen + propBlock.length;
  }
  return props;
}

/**
 * @param {string} source
 * @returns {string[]}
 */
export function parseEmits(source) {
  const arrMatch = source.match(/\bemits\s*:\s*\[([^\]]*)\]/);
  if (arrMatch) {
    return [...arrMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
  }
  const objMatch = source.match(/\bemits\s*:\s*\{/);
  if (!objMatch || objMatch.index == null) return [];
  const open = source.indexOf('{', objMatch.index + objMatch[0].length - 1);
  const block = extractBalancedBlock(source, open);
  if (!block) return [];
  return [...block.matchAll(/['"]?([A-Za-z_][\w:]*)['"]?\s*:/g)].map((x) => x[1]).filter((n) => n !== 'type');
}

/**
 * @param {string} source
 * @returns {string | null}
 */
export function parseComponentName(source) {
  const m = source.match(/name\s*:\s*['"](Gv[\w]+)['"]/);
  return m ? m[1] : null;
}
