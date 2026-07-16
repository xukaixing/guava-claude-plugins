/**
 * Generation-time: extract usage/API/examples from guava-press docs.
 * Runtime MCP must NOT import this for live press reads — use vendored-docs.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { resolvePressDocsDir, DOC_SLUG_TO_GV, GV_TO_DOC_SLUG } from './paths.mjs';

/**
 * @param {string} raw
 */
export function cleanDocMarkdown(raw) {
  let text = raw;
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  text = text.replace(/<Demo\b[^>]*>[\s\S]*?<\/Demo>/gi, '\n\n<!-- example: see examples[] -->\n\n');
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

/**
 * @param {string} raw
 */
export function parseExampleImports(raw) {
  const scriptMatch = raw.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) return [];
  const script = scriptMatch[1];
  /** @type {{ id: string; file: string }[]} */
  const examples = [];
  const re = /import\s+(\w+)\s+from\s+['"](\.\/examples\/[^'"]+\.vue)(?:\?raw)?['"]/g;
  let m;
  while ((m = re.exec(script))) {
    const id = m[1];
    const rel = m[2];
    if (/source$/i.test(id)) continue;
    examples.push({ id, file: rel });
  }
  const rawRe = /import\s+(\w+)\s+from\s+['"](\.\/examples\/[^'"]+\.vue)\?raw['"]/g;
  /** @type {Map<string, string>} */
  const sourceByFile = new Map();
  while ((m = rawRe.exec(script))) {
    sourceByFile.set(m[2], m[1]);
  }
  if (examples.length === 0 && sourceByFile.size) {
    for (const [file, sourceVar] of sourceByFile) {
      examples.push({ id: sourceVar.replace(/Source$/i, ''), file });
    }
  }
  // dedupe by file
  const seen = new Set();
  return examples.filter((ex) => {
    if (seen.has(ex.file)) return false;
    seen.add(ex.file);
    return true;
  });
}

/**
 * @param {string} cleanedMd
 */
export function extractApiSection(cleanedMd) {
  const apiIdx = cleanedMd.search(/^##\s+API\b/m);
  if (apiIdx < 0) return null;
  const rest = cleanedMd.slice(apiIdx);
  const stop = rest.search(/\n##\s+(?!API)/);
  return (stop > 0 ? rest.slice(0, stop) : rest).trim();
}

/**
 * @param {string} raw
 */
function extractGvTip(raw) {
  const tip = raw.match(/:::\s*tip\s*\n([\s\S]*?):::/i);
  if (!tip) return null;
  return tip[1].trim().replace(/\s+/g, ' ');
}

/**
 * Build a self-contained usage markdown with inlined example sources.
 * @param {{ tip?: string | null; markdown: string; api?: string | null; examples: { id: string; file: string; source: string | null }[] }} data
 */
export function buildUsageMarkdown(data) {
  const parts = [];
  if (data.tip) parts.push(`> ${data.tip}\n`);
  parts.push(data.markdown);
  if (data.examples?.length) {
    parts.push('\n## 示例源码（已内嵌，无需 press）\n');
    for (const ex of data.examples) {
      parts.push(`\n### ${ex.id}\n\n\`\`\`vue\n${ex.source || '// (missing)'}\n\`\`\`\n`);
    }
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Extract one component's usage payload from press (generation only).
 * @param {string} gvName
 * @param {string} [docSlug]
 * @param {string | null} [docsDir]
 */
export function extractFromPress(gvName, docSlug, docsDir = resolvePressDocsDir()) {
  const slug = docSlug || GV_TO_DOC_SLUG[gvName];
  if (!docsDir) {
    return { gvName, docSlug: slug || null, error: 'guava-press docs not found (generation-only)' };
  }
  if (!slug) {
    return { gvName, docSlug: null, error: `No press slug mapping for ${gvName}` };
  }
  const docPath = path.join(docsDir, `${slug}.md`);
  if (!fs.existsSync(docPath)) {
    return { gvName, docSlug: slug, error: `Missing ${docPath}` };
  }
  const raw = fs.readFileSync(docPath, 'utf8');
  const markdown = cleanDocMarkdown(raw);
  const api = extractApiSection(markdown);
  const tip = extractGvTip(raw);
  const exampleImports = parseExampleImports(raw);
  const examples = exampleImports.map((ex) => {
    const abs = path.resolve(docsDir, ex.file);
    let source = null;
    if (fs.existsSync(abs)) {
      source = fs.readFileSync(abs, 'utf8');
      if (source.length > 20000) source = `${source.slice(0, 20000)}\n\n…(truncated)`;
    }
    return { id: ex.id, file: ex.file, source };
  });

  const usageMarkdown = buildUsageMarkdown({ tip, markdown, api, examples });

  return {
    gvName,
    docSlug: slug,
    tip,
    markdown,
    api,
    examples,
    usageMarkdown,
    generatedAt: new Date().toISOString(),
    source: 'guava-press (vendored at generate time)',
  };
}

/**
 * @returns {{ gvName: string; docSlug: string; hasDoc: boolean }[]}
 */
export function listPressComponents(docsDir = resolvePressDocsDir()) {
  return Object.entries(DOC_SLUG_TO_GV).map(([docSlug, gvName]) => ({
    gvName,
    docSlug,
    hasDoc: !!(docsDir && fs.existsSync(path.join(docsDir, `${docSlug}.md`))),
  }));
}
