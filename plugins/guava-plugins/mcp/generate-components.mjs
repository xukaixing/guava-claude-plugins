#!/usr/bin/env node
/**
 * Generate per-component MCPs inside this plugin:
 * - Read guava-press → vendor usage.json / usage.md
 * - Write plugin .mcp.json with ${CLAUDE_PLUGIN_ROOT} paths
 *
 * Usage (from anywhere):
 *   node plugins/guava-plugins/mcp/generate-components.mjs
 *
 * Optional:
 *   GUAVA_PRESS_COMPONENTS_DOCS=/path/to/.../components
 *   CLAUDE_PROJECT_DIR=/path/to/ses-web   # for checking npm types presence
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPONENTS_DIR,
  MCP_ROOT,
  resolvePluginRoot,
  resolvePressDocsDir,
  toMcpKey,
  DOC_SLUG_TO_GV,
} from './_shared/paths.mjs';
import { extractFromPress, listPressComponents } from './_shared/press-extract.mjs';
import { listGvFromTypes } from './_shared/npm-types.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolvePluginRoot();
const pressDir = resolvePressDocsDir();

if (!pressDir) {
  console.error(
    '[generate] ERROR: guava-press docs not found.\n' +
      'Set GUAVA_PRESS_COMPONENTS_DOCS or place checkout at ../guava/guava-press/.../components',
  );
  process.exit(1);
}

console.log(`[generate] press docs: ${pressDir}`);
console.log(`[generate] plugin root: ${pluginRoot}`);
console.log(`[generate] mcp root: ${MCP_ROOT}`);

fs.mkdirSync(COMPONENTS_DIR, { recursive: true });

const pressList = listPressComponents(pressDir).filter((c) => c.hasDoc);
const npmNames = new Set(listGvFromTypes());

const components = pressList.map((c) => ({
  ...c,
  inNpm: npmNames.has(c.gvName),
}));

let ok = 0;
let fail = 0;

for (const { gvName, docSlug, inNpm } of components) {
  const dir = path.join(COMPONENTS_DIR, gvName);
  fs.mkdirSync(dir, { recursive: true });

  const extracted = extractFromPress(gvName, docSlug, pressDir);
  if (extracted.error && !extracted.usageMarkdown) {
    console.warn(`[generate] skip ${gvName}: ${extracted.error}`);
    fail++;
    continue;
  }

  const usagePayload = {
    gvName,
    docSlug: extracted.docSlug,
    tip: extracted.tip,
    markdown: extracted.markdown,
    api: extracted.api,
    examples: extracted.examples,
    usageMarkdown: extracted.usageMarkdown,
    generatedAt: extracted.generatedAt,
    source: extracted.source,
    inNpm,
  };

  fs.writeFileSync(path.join(dir, 'usage.json'), `${JSON.stringify(usagePayload, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'usage.md'), `${extracted.usageMarkdown}\n`);

  const serverPath = path.join(dir, 'server.mjs');
  fs.writeFileSync(
    serverPath,
    `#!/usr/bin/env node
/**
 * ${gvName} MCP (plugin-bundled)
 * - Usage: usage.json (vendored from press)
 * - Props: \${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: '${gvName}',
  componentDir: componentDirFrom(import.meta.url),
});
`,
  );
  fs.chmodSync(serverPath, 0o755);

  const mcpKey = toMcpKey(gvName);
  fs.writeFileSync(
    path.join(dir, 'README.md'),
    `# ${gvName} MCP

随 **guava-plugins** 分发。运行时不依赖 press / guava-ui 源码。

| 数据 | 来源 |
| --- | --- |
| 用法 / API / 示例 | 本目录 \`usage.json\` |
| props / emits | 消费项目 \`node_modules/guava-ui\`（\`CLAUDE_PROJECT_DIR\`） |

注册名：\`${mcpKey}\`
`,
  );
  ok++;
  console.log(`[generate] ${gvName} (${extracted.examples?.length || 0} examples, npm=${inNpm})`);
}

/** Plugin .mcp.json — paths use CLAUDE_PLUGIN_ROOT so install works anywhere */
const mcpServers = {
  'guava-ui': {
    type: 'stdio',
    command: 'node',
    args: ['${CLAUDE_PLUGIN_ROOT}/mcp/guava-ui/server.mjs'],
  },
};

for (const { gvName } of components) {
  if (!fs.existsSync(path.join(COMPONENTS_DIR, gvName, 'server.mjs'))) continue;
  mcpServers[toMcpKey(gvName)] = {
    type: 'stdio',
    command: 'node',
    args: [`\${CLAUDE_PLUGIN_ROOT}/mcp/components/${gvName}/server.mjs`],
  };
}

const mcpJsonPath = path.join(pluginRoot, '.mcp.json');
fs.writeFileSync(mcpJsonPath, `${JSON.stringify({ mcpServers }, null, 2)}\n`);

const rows = components
  .filter((c) => fs.existsSync(path.join(COMPONENTS_DIR, c.gvName, 'usage.json')))
  .map(
    (c) =>
      `| \`${toMcpKey(c.gvName)}\` | \`${c.docSlug}.md\` → usage.json | ${c.inNpm ? '✓' : '✗'} |`,
  )
  .join('\n');

fs.writeFileSync(
  path.join(COMPONENTS_DIR, 'README.md'),
  `# Guava 组件 MCP（plugin 内）

安装 \`guava-plugins@guava-tools\` 后自动连接。用法来自 \`usage.json\`；props 来自消费项目的 \`guava-ui\`。

共 **${ok}** 个。

| MCP | 用法 | npm 类型 |
| --- | --- | --- |
${rows}

\`\`\`bash
# 作者机（有 press）更新用法快照
CLAUDE_PROJECT_DIR=/path/to/ses-web node mcp/generate-components.mjs
\`\`\`
`,
);

// Also refresh guava-ui README pointer
fs.writeFileSync(
  path.join(MCP_ROOT, 'guava-ui', 'README.md'),
  `# guava-ui MCP（catalog）

随 **guava-plugins** 分发。见上级 [../README.md](../README.md) 与插件根 \`.mcp.json\`。

运行时：
- props：\`\${CLAUDE_PROJECT_DIR}/node_modules/guava-ui\`
- 用法：各 \`components/Gv*/usage.json\`
`,
);

console.log(`[generate] done: ${ok} ok, ${fail} failed`);
console.log(`[generate] wrote ${mcpJsonPath}`);
console.log(`[generate] DOC_SLUG map size ${Object.keys(DOC_SLUG_TO_GV).length}`);
// silence unused
void __dirname;
