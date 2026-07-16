/**
 * Runtime paths for Guava MCP (plugin or local).
 *
 * - MCP code / usage.json live under the plugin: ${CLAUDE_PLUGIN_ROOT}/mcp
 * - guava-ui types come from the consumer project: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** …/mcp/_shared → …/mcp */
export const MCP_ROOT = path.resolve(__dirname, '..');
export const COMPONENTS_DIR = path.join(MCP_ROOT, 'components');

/**
 * Consumer project root (ses-web etc.).
 * Prefer CLAUDE_PROJECT_DIR (Claude Code plugin MCP), then cwd, then walk up for guava-ui.
 */
export function resolveProjectRoot() {
  const fromEnv = process.env.CLAUDE_PROJECT_DIR || process.env.GUAVA_PROJECT_DIR;
  if (fromEnv && fs.existsSync(fromEnv)) return path.resolve(fromEnv);

  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'node_modules/guava-ui'))) return cwd;

  // Walk up from MCP_ROOT (dev: plugin next to Workspace projects)
  let dir = MCP_ROOT;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'node_modules/guava-ui/lib/types/index.d.ts'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return cwd;
}

/** @deprecated use resolveProjectRoot — kept for generate script naming */
export const REPO_ROOT = resolveProjectRoot();

/**
 * Resolve installed guava-ui package root inside the consumer project.
 */
export function resolveGuavaUiNpm() {
  const fromEnv = process.env.GUAVA_UI_NPM;
  if (fromEnv && fs.existsSync(path.join(fromEnv, 'lib/types/index.d.ts'))) {
    return path.resolve(fromEnv);
  }

  const projectRoot = resolveProjectRoot();
  const direct = path.join(projectRoot, 'node_modules/guava-ui');
  if (fs.existsSync(path.join(direct, 'lib/types/index.d.ts'))) return direct;

  // pnpm: node_modules/guava-ui may be a symlink — still works via direct
  return direct;
}

export const GUAVA_UI_NPM = resolveGuavaUiNpm();
export const GUAVA_UI_TYPES = path.join(GUAVA_UI_NPM, 'lib/types/index.d.ts');

/**
 * Generation-only: guava-press component docs (author machine).
 */
export function resolvePressDocsDir() {
  const fromEnv = process.env.GUAVA_PRESS_COMPONENTS_DOCS;
  if (fromEnv && fs.existsSync(fromEnv)) return path.resolve(fromEnv);

  const projectRoot = resolveProjectRoot();
  const candidates = [
    path.resolve(projectRoot, '../guava/guava-press/docs/guava-api/frontend/components'),
    path.resolve(projectRoot, '../../guava/guava-press/docs/guava-api/frontend/components'),
    path.resolve(MCP_ROOT, '../../../../guava/guava-press/docs/guava-api/frontend/components'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/** doc slug → Gv* (for generation from press) */
export const DOC_SLUG_TO_GV = {
  anchor: 'GvAnchor',
  badge: 'GvBadge',
  bodyDialog: 'GvBodyDialog',
  button: 'GvButton',
  card: 'GvCard',
  cascader: 'GvCascader',
  checkbox: 'GvCheckbox',
  checkboxbutton: 'GvCheckboxButton',
  checkboxgroup: 'GvCheckboxGroup',
  col: 'GvCol',
  dialog: 'GvDialog',
  drawer: 'GvDrawer',
  form: 'GvForm',
  input: 'GvInput',
  inputNumber: 'GvInputNumber',
  popover: 'GvPopover',
  radio: 'GvRadio',
  radiobutton: 'GvRadioButton',
  radiogroup: 'GvRadioGroup',
  row: 'GvRow',
  searchBar: 'GvSearchBar',
  select: 'GvSelect',
  table: 'GvTable',
  tabs: 'GvTabs',
  tree: 'GvTree',
  upload: 'GvUpload',
  validate: 'GvValidate',
};

export const GV_TO_DOC_SLUG = Object.fromEntries(
  Object.entries(DOC_SLUG_TO_GV).map(([slug, gv]) => [gv, slug]),
);

/** GvForm → gv-form */
export function toMcpKey(gvName) {
  return gvName
    .replace(/^Gv/, 'gv-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/** Plugin root (…/guava-plugins) when MCP lives at …/guava-plugins/mcp */
export function resolvePluginRoot() {
  if (process.env.CLAUDE_PLUGIN_ROOT && fs.existsSync(process.env.CLAUDE_PLUGIN_ROOT)) {
    return path.resolve(process.env.CLAUDE_PLUGIN_ROOT);
  }
  // mcp/ is directly under plugin root
  return path.resolve(MCP_ROOT, '..');
}
