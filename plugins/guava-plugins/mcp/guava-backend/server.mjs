#!/usr/bin/env node
/**
 * Guava backend MCP server (stdio JSON-RPC).
 * Backend counterpart of the guava-ui catalog: stack layering / BOM
 * dependencies+versions / platform class index, vendored from a guava-pro
 * checkout by mcp/generate-backend.mjs.
 *
 * Freshness: when $GUAVA_BACKEND_ROOT/guava-parent-starter/gradle/libs.versions.toml
 * exists, its versions override the vendored snapshot at runtime.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStdioServer } from '../_shared/stdio.mjs';
import { withDiskCache } from '../_shared/disk-cache.mjs';

const SERVER_INFO = { name: 'guava-backend', version: '1.0.0' };
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
// 搜索结果上限：避免宽泛关键字（如 "Util"）把上百条命中整个灌进模型上下文
const SEARCH_MAX = 10;

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Live versions from the consumer's backend checkout, when it vendors the
 * parent catalog. Simple regex parse of the flat [versions] TOML section.
 */
function liveVersions() {
  const root = process.env.GUAVA_BACKEND_ROOT;
  if (!root) return null;
  const toml = path.join(root, 'guava-parent-starter', 'gradle', 'libs.versions.toml');
  try {
    if (!fs.existsSync(toml)) return null;
    const versions = {};
    let inSection = false;
    for (const raw of fs.readFileSync(toml, 'utf8').split('\n')) {
      const line = raw.trim();
      if (/^\[versions\]$/.test(line)) { inSection = true; continue; }
      if (/^\[/.test(line)) inSection = false;
      if (!inSection) continue;
      const m = line.match(/^([A-Za-z0-9_-]+)\s*=\s*"(.+)"\s*$/);
      if (m) versions[m[1]] = m[2];
    }
    return Object.keys(versions).length ? versions : null;
  } catch {
    return null;
  }
}

function freshness() {
  const dep = loadJson('dependencies.json');
  return {
    generatedAt: dep?.generatedAt || null,
    parentVersion: dep?.source?.parentVersion || null,
    liveOverride: liveVersions() ? `live: ${process.env.GUAVA_BACKEND_ROOT}/guava-parent-starter/gradle/libs.versions.toml` : null,
  };
}

/** Merge live catalog versions over the vendored snapshot (by version.ref key). */
function withLiveVersions(deps) {
  const live = liveVersions();
  if (!live) return deps;
  return deps.map((d) => {
    const ref = d.versionRef;
    const v = ref && live[ref] ? live[ref] : d.version;
    return { ...d, version: v ?? d.version };
  });
}

const TOOLS = [
  {
    name: 'get_stack',
    description: 'Guava backend module layering with versions and roles: parent-starter (BOM) → component-starter → entity-starter → platform-starter → business app. Call before generating any backend code.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_dependencies',
    description: 'List all dependencies managed by guava-parent-starter (BOM), with versions and category. version=null means managed by an imported BOM (spring-boot-dependencies / spring-cloud-dependencies).',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional filter, e.g. Database / Spring Boot / Hutool' },
      },
    },
  },
  {
    name: 'search_dependencies',
    description: 'Search BOM dependencies by keyword (name / group / artifact). Use before introducing a third-party library to get the managed version.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search keyword' } },
      required: ['query'],
    },
  },
  {
    name: 'get_dependency',
    description: 'Get one BOM dependency detail (group:artifact, version, category).',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Catalog key, e.g. mybatis-plus-spring-boot3-starter' } },
      required: ['name'],
    },
  },
  {
    name: 'list_platform_classes',
    description: 'List platform / component / entity classes (MyUtil, AssertMyUtil, BizCode, BasePO, Map2ObjUtil, TransResultService…). Call before using a utility/annotation/service in generated code.',
    inputSchema: {
      type: 'object',
      properties: {
        module: { type: 'string', description: 'Optional filter: guava-platform-starter | guava-component-starter | guava-entity-starter' },
        kind: { type: 'string', description: 'Optional filter: class | interface | enum | annotation | record' },
      },
    },
  },
  {
    name: 'search_platform_classes',
    description: 'Search platform classes by keyword (name / package / summary).',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search keyword' } },
      required: ['query'],
    },
  },
  {
    name: 'get_platform_class',
    description: 'Get one class detail: package, summary, public method signatures.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Simple class name, e.g. AssertMyUtil' } },
      required: ['name'],
    },
  },
];

function callTool(name, args = {}) {
  switch (name) {
    case 'get_stack': {
      const stack = loadJson('stack.json');
      if (!stack) return { error: 'stack.json missing — run mcp/generate-backend.mjs on the author machine' };
      return { ...freshness(), layers: stack.layers };
    }
    case 'list_dependencies': {
      const dep = loadJson('dependencies.json');
      if (!dep) return { error: 'dependencies.json missing — run mcp/generate-backend.mjs on the author machine' };
      let list = withLiveVersions(dep.dependencies);
      if (args.category) {
        const cat = String(args.category).toLowerCase();
        list = list.filter((d) => d.category.toLowerCase().includes(cat));
      }
      return {
        ...freshness(),
        rule: 'version=null → version managed by an imported BOM (spring-boot-dependencies / spring-cloud-dependencies). Do not hardcode versions in generated build files.',
        count: list.length,
        dependencies: list,
      };
    }
    case 'search_dependencies': {
      const dep = loadJson('dependencies.json');
      if (!dep) return { error: 'dependencies.json missing' };
      const q = String(args.query || '').toLowerCase();
      const hits = withLiveVersions(dep.dependencies).filter(
        (d) => d.name.toLowerCase().includes(q) || d.group.toLowerCase().includes(q) || d.artifact.toLowerCase().includes(q)
      );
      return {
        ...freshness(),
        count: hits.length,
        truncated: hits.length > SEARCH_MAX,
        dependencies: hits.slice(0, SEARCH_MAX).map((d) => ({ name: d.name, artifact: `${d.group}:${d.artifact}`, version: d.version, category: d.category })),
        hint: hits.length > SEARCH_MAX ? `命中 ${hits.length} 条，仅返回前 ${SEARCH_MAX} 条，请用更精确的关键字重查` : undefined,
      };
    }
    case 'get_dependency': {
      const dep = loadJson('dependencies.json');
      const hit = dep && withLiveVersions(dep.dependencies).find((d) => d.name === args.name);
      if (!hit) return { error: `Dependency not found: ${args.name}`, hint: 'Try search_dependencies' };
      return { ...freshness(), dependency: { ...hit, artifact: `${hit.group}:${hit.artifact}` } };
    }
    case 'list_platform_classes': {
      const cls = loadJson('platform-classes.json');
      if (!cls) return { error: 'platform-classes.json missing — run mcp/generate-backend.mjs on the author machine' };
      let list = cls.classes;
      if (args.module) list = list.filter((c) => c.module === args.module);
      if (args.kind) list = list.filter((c) => c.kind === args.kind);
      return {
        ...freshness(),
        count: list.length,
        classes: list.map((c) => ({ name: c.name, kind: c.kind, package: c.package, module: c.module, summary: c.summary, methodCount: c.methods.length })),
      };
    }
    case 'search_platform_classes': {
      const cls = loadJson('platform-classes.json');
      if (!cls) return { error: 'platform-classes.json missing' };
      const q = String(args.query || '').toLowerCase();
      const hits = cls.classes.filter(
        (c) => c.name.toLowerCase().includes(q) || c.package.toLowerCase().includes(q) || (c.summary || '').toLowerCase().includes(q)
      );
      return {
        ...freshness(),
        count: hits.length,
        truncated: hits.length > SEARCH_MAX,
        classes: hits.slice(0, SEARCH_MAX).map((c) => ({ name: c.name, kind: c.kind, package: c.package, module: c.module, summary: c.summary })),
        hint: hits.length > SEARCH_MAX ? `命中 ${hits.length} 条，仅返回前 ${SEARCH_MAX} 条，请用更精确的类名/包名重查` : undefined,
      };
    }
    case 'get_platform_class': {
      const cls = loadJson('platform-classes.json');
      const hits = cls ? cls.classes.filter((c) => c.name === args.name) : [];
      if (!hits.length) return { error: `Class not found: ${args.name}`, hint: 'Try search_platform_classes' };
      return { ...freshness(), matches: hits.length, class: hits[0], sameNameInOtherModules: hits.slice(1).map((c) => `${c.package}.${c.name} (${c.module})`) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Disk cache keyed on the snapshot files (regenerating invalidates automatically)
const cachedCallTool = withDiskCache(SERVER_INFO.name, callTool, () =>
  ['stack.json', 'dependencies.json', 'platform-classes.json'].map((f) => path.join(DATA_DIR, f))
);

createStdioServer({ ...SERVER_INFO, tools: TOOLS, callTool: cachedCallTool });
