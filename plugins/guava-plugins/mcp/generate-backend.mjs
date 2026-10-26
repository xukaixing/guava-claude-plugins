#!/usr/bin/env node
/**
 * Generate the guava-backend MCP data snapshot inside this plugin.
 *
 * Reads a guava-pro checkout (parent-starter version catalog + platform /
 * entity / component starter sources) and writes:
 *   mcp/guava-backend/data/stack.json           module layering + versions
 *   mcp/guava-backend/data/dependencies.json    parent-starter BOM catalog
 *   mcp/guava-backend/data/platform-classes.json platform/component/entity class index
 *
 * Usage (from anywhere):
 *   node plugins/guava-plugins/mcp/generate-backend.mjs [/path/to/guava-pro]
 *
 * Optional:
 *   GUAVA_PRO_ROOT=/path/to/guava-pro
 *
 * Author machine only; NOT a runtime dependency (like generate-components.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MCP_ROOT, resolvePluginRoot } from './_shared/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @returns {string} guava-pro checkout root */
function resolveGuavaProRoot() {
  const fromArg = process.argv[2];
  if (fromArg && fs.existsSync(path.join(fromArg, 'guava-parent-starter'))) return path.resolve(fromArg);
  const fromEnv = process.env.GUAVA_PRO_ROOT;
  if (fromEnv && fs.existsSync(path.join(fromEnv, 'guava-parent-starter'))) return path.resolve(fromEnv);
  const homeDefault = path.join(process.env.HOME || '', 'Workspace/guava/guava-pro');
  if (fs.existsSync(path.join(homeDefault, 'guava-parent-starter'))) return homeDefault;
  // walk up from the plugin looking for a sibling guava-pro
  let dir = path.resolve(__dirname, '../../..');
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(path.dirname(dir), 'guava-pro');
    if (fs.existsSync(path.join(candidate, 'guava-parent-starter'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  console.error('[generate-backend] ERROR: guava-pro checkout not found.\n' + 'Pass the path as argv[1] or set GUAVA_PRO_ROOT (must contain guava-parent-starter/).');
  process.exit(1);
}

const proRoot = resolveGuavaProRoot();
const pluginRoot = resolvePluginRoot();
const dataDir = path.join(MCP_ROOT, 'guava-backend', 'data');
fs.mkdirSync(dataDir, { recursive: true });

console.log(`[generate-backend] guava-pro: ${proRoot}`);
console.log(`[generate-backend] data dir:  ${dataDir}`);

// ---------------------------------------------------------------------------
// libs.versions.toml  (regex parse; enough for the simple flat TOML we ship)
// ---------------------------------------------------------------------------

function parseVersionCatalog(tomlPath) {
  const text = fs.readFileSync(tomlPath, 'utf8');
  const versions = {};
  const libraries = {};

  let section = '';
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) {
      section = sec[1];
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();

    if (section === 'versions') {
      const m = value.match(/^"(.+)"$/);
      if (m) versions[key] = m[1];
    } else if (section === 'libraries') {
      const module = value.match(/module\s*=\s*"([^"]+)"/);
      const versionRef = value.match(/version\.ref\s*=\s*"([^"]+)"/);
      const versionInline = value.match(/version\s*=\s*"([^"]+)"/);
      if (!module) continue;
      const [group, artifact] = module[1].split(':');
      libraries[key] = {
        name: key,
        group,
        artifact: artifact || key,
        version: versionRef ? versions[versionRef[1]] || null : versionInline ? versionInline[1] : null,
        versionRef: versionRef ? versionRef[1] : null,
      };
    }
  }
  return { versions, libraries };
}

// ---------------------------------------------------------------------------
// build.gradle.kts → categorized dependency list (parent-starter BOM)
// ---------------------------------------------------------------------------

function parseGradleDependencies(ktsPath) {
  const text = fs.readFileSync(ktsPath, 'utf8');
  const deps = [];
  let category = 'other';
  for (const rawLine of text.split('\n')) {
    const cat = rawLine.match(/^\s*\/\/\s*=+\s*(.+?)\s*=+\s*$/);
    if (cat) {
      category = cat[1].trim();
      continue;
    }
    const dep = rawLine.match(/\b(?:api|implementation|compileOnly|runtimeOnly|annotationProcessor|testImplementation)\s*\(\s*(?:platform\s*\()?\s*libs\.([A-Za-z0-9_.]+)\s*\)?\s*\)/);
    if (dep) deps.push({ catalogKey: dep[1].replace(/\./g, '-'), category });
  }
  return deps;
}

// ---------------------------------------------------------------------------
// Java source index: package / type / javadoc / public method signatures
// ---------------------------------------------------------------------------

const CLASS_DOC_MAX = 120;
const METHODS_PER_CLASS_MAX = 50;
const SIGNATURE_MAX = 200;

function javadocSummary(javaText, typePos) {
  const before = javaText.slice(0, typePos);
  const docEnd = before.lastIndexOf('*/');
  if (docEnd < 0) return '';
  const docStart = before.lastIndexOf('/**', docEnd);
  if (docStart < 0) return '';
  const body = before
    .slice(docStart + 3, docEnd)
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter((l) => l && !l.startsWith('@'));
  const text = body.join(' ').replace(/<\/?p>/g, '').trim();
  return text.length > CLASS_DOC_MAX ? text.slice(0, CLASS_DOC_MAX) + '…' : text;
}

function publicMethods(javaText) {
  const methods = [];
  // join continuation lines so multi-line signatures collapse to one
  const flat = javaText.replace(/\n\s+/g, ' ');
  // `public` optional: interface methods are implicitly public (no modifier);
  // private / package-private members never match (no modifier at line start).
  const re = /(?:public\s+)?(?:static\s+|final\s+|abstract\s+|synchronized\s+)*(?:<[^>]+>\s+)?[\w.<>\[\], ?]+\s+\w+\s*\([^;{}]*\)\s*(?:throws [\w., ]+)?[;{]/g;
  let m;
  while ((m = re.exec(flat)) && methods.length < METHODS_PER_CLASS_MAX) {
    let sig = m[0].replace(/\s+/g, ' ').replace(/\s*[{;]\s*$/, '').trim();
    if (sig.startsWith('public class') || sig.startsWith('public interface') || sig.startsWith('public enum') || sig.startsWith('public @interface')) continue;
    if (sig.startsWith('if ') || sig.startsWith('for ') || sig.startsWith('while ') || sig.startsWith('switch ') || sig.startsWith('return ') || sig.startsWith('new ')) continue;
    // reject control-flow / lambda captures that slipped through (e.g. "if (x) {")
    if (/^(if|for|while|switch|catch|return|throw)\b/.test(sig)) continue;
    if (sig.length > SIGNATURE_MAX) sig = sig.slice(0, SIGNATURE_MAX) + '…';
    methods.push(sig);
  }
  return methods;
}

function indexJavaSources(srcRoot, moduleName) {
  const classes = [];
  if (!fs.existsSync(srcRoot)) return classes;
  const stack = [srcRoot];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.java')) {
        const text = fs.readFileSync(full, 'utf8');
        const pkg = text.match(/^\s*package\s+([\w.]+)\s*;/m);
        const type = text.match(/\bpublic\s+(?:final\s+|abstract\s+)?(class|interface|enum|record|@interface)\s+(\w+)/);
        if (!pkg || !type) continue;
        const kind = type[1] === '@interface' ? 'annotation' : type[1];
        const typePos = text.indexOf(type[0]);
        classes.push({
          module: moduleName,
          name: type[2],
          kind,
          package: pkg[1],
          summary: javadocSummary(text, typePos),
          methods: publicMethods(text),
        });
      }
    }
  }
  return classes;
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------

const parentDir = path.join(proRoot, 'guava-parent-starter');
const catalog = parseVersionCatalog(path.join(parentDir, 'gradle', 'libs.versions.toml'));
const declared = parseGradleDependencies(path.join(parentDir, 'build.gradle.kts'));

const bom = declared
  .map((d) => {
    const lib = catalog.libraries[d.catalogKey];
    if (!lib) return null;
    return {
      name: d.catalogKey,
      group: lib.group,
      artifact: lib.artifact,
      version: lib.version,
      versionRef: lib.versionRef || null,
      category: d.category,
    };
  })
  .filter(Boolean);

const dependenciesJson = {
  generatedAt: new Date().toISOString(),
  source: {
    repo: 'guava-pro',
    module: 'guava-parent-starter',
    catalog: 'gradle/libs.versions.toml',
    build: 'build.gradle.kts',
    parentVersion: fs.readFileSync(path.join(parentDir, 'build.gradle.kts'), 'utf8').match(/version\s*=\s*"([^"]+)"/)?.[1] || null,
  },
  categories: [...new Set(bom.map((d) => d.category))],
  count: bom.length,
  dependencies: bom,
};
fs.writeFileSync(path.join(dataDir, 'dependencies.json'), JSON.stringify(dependenciesJson, null, 2));

// ---- stack layering -------------------------------------------------------

const MODULE_ROLES = {
  'guava-parent-starter': 'BOM：全量依赖与版本管理（java-platform），下游所有 starter 的依赖基准',
  'guava-platform-starter': '底层框架：com.guava.platform.*（注解 / 异常 / 工具 / 上下文 / 翻译 / Excel / Redis 客户端），依赖 entity-starter + component-starter，BOM 引 parent-starter',
  'guava-entity-starter': '实体层：com.guava.entity.po / dto / vo，依赖 component-starter，BOM 引 parent-starter',
  'guava-component-starter': '基础组件层：com.guava.component.*（BasePO / Map2ObjUtil / 常量 / 工具），BOM 引 parent-starter',
  'guava-admin-starter': '业务工程示例：controller / service / repository（生成的目标形态参考）',
};

function moduleInfo(name) {
  const dir = path.join(proRoot, name);
  const kts = path.join(dir, 'build.gradle.kts');
  if (!fs.existsSync(kts)) return null;
  const text = fs.readFileSync(kts, 'utf8');
  const guavaDeps = [...text.matchAll(/libs\.(guava\.[A-Za-z0-9_.]+)/g)].map((m) => m[1].replace(/\./g, '-'));
  return {
    name,
    group: text.match(/group\s*=\s*"([^"]+)"/)?.[1] || 'com.guava',
    version: text.match(/version\s*=\s*"([^"]+)"/)?.[1] || null,
    role: MODULE_ROLES[name] || '',
    guavaDependencies: [...new Set(guavaDeps)],
  };
}

const LAYERS = [
  { layer: 1, title: 'BOM（依赖 + 版本）', modules: ['guava-parent-starter'] },
  { layer: 2, title: '基础组件层', modules: ['guava-component-starter'] },
  { layer: 3, title: '实体层', modules: ['guava-entity-starter'] },
  { layer: 4, title: '底层框架层', modules: ['guava-platform-starter'] },
  { layer: 5, title: '业务工程', modules: ['guava-admin-starter'] },
];

const stackJson = {
  generatedAt: new Date().toISOString(),
  source: { repo: 'guava-pro', proRoot },
  layers: LAYERS.map((l) => ({
    ...l,
    modules: l.modules.map(moduleInfo).filter(Boolean),
  })),
};
fs.writeFileSync(path.join(dataDir, 'stack.json'), JSON.stringify(stackJson, null, 2));

// ---- platform / component / entity class index ----------------------------

const classModules = ['guava-platform-starter', 'guava-component-starter', 'guava-entity-starter'];
let classCount = 0;
const classesJson = {
  generatedAt: new Date().toISOString(),
  source: { repo: 'guava-pro', modules: classModules },
  count: 0,
  classes: [],
};
for (const mod of classModules) {
  const list = indexJavaSources(path.join(proRoot, mod, 'src', 'main', 'java'), mod);
  classCount += list.length;
  classesJson.classes.push(...list);
}
classesJson.count = classCount;
fs.writeFileSync(path.join(dataDir, 'platform-classes.json'), JSON.stringify(classesJson, null, 2));

console.log(`[generate-backend] dependencies: ${bom.length} (categories: ${dependenciesJson.categories.join(', ')})`);
console.log(`[generate-backend] stack layers:  ${stackJson.layers.map((l) => `${l.modules.length}@${l.title}`).join(' | ')}`);
console.log(`[generate-backend] classes:       ${classCount}`);
console.log('[generate-backend] done.');
