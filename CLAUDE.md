# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on code in this repository.

## What this repo is

A **Claude Code plugin marketplace** (name: `guava-tools`) that ships a single plugin, `guava-plugins`, consumed by projects like `ses-web`. The plugin bundles **skills** (code-gen workflows), **MCP servers** (Guava UI `Gv*` component docs + props), and a **lint-fix hook**. Consumers install it via `/plugin marketplace add` + `/plugin install guava-plugins@guava-tools`; they do **not** check out this repo or configure project-level `.mcp.json`.

Runtime contract: paths resolve against `${CLAUDE_PLUGIN_ROOT}` (the installed plugin dir) and `${CLAUDE_PROJECT_DIR}` (the consumer project, e.g. `ses-web`). Consumer projects only need `pnpm install` (which brings in `guava-ui`); they never need guava-press or guava-ui source.

## Layout

```
.claude-plugin/marketplace.json      # marketplace + plugin manifest (version, owner)
plugins/guava-plugins/
  .claude-plugin/plugin.json
  .mcp.json                          # MCP registry; paths use ${CLAUDE_PLUGIN_ROOT}
  README.md                          # plugin-facing usage (consumers read this)
  context/{front,backend}.md         # consumer-project conventions (Vue/Spring)
  hooks/
    hooks.json                       # PostToolUse/PostToolBatch/Stop → lint-fix.sh
    lint-fix.sh                      # eslint --fix (front) + Java format (back)
    cursor-hooks.json.example        # non-Claude-Code Agent equivalent
  mcp/
    generate-components.mjs          # author-only: refresh usage.json from guava-press
    generate-backend.mjs             # author-only: refresh guava-backend data/*.json from a guava-pro checkout
    _shared/                         # MCP infra (paths, stdio, disk-cache, npm-types, npm-source, press extraction)
    guava-ui/                        # catalog MCP: list/resolve/search Gv*, page recipes
    guava-backend/                   # backend knowledge MCP: stack layers, BOM deps+versions, platform class index
    components/Gv{Anchor,Form,…}/    # one dir per component: usage.json + server.mjs
  skills/
    code-frontend/ (+ templates/)    # Vue 3 + Guava UI page gen from src/pages/*.md
    code-backend/  (+ templates/)    # Spring Boot Controller/Service/ServiceImpl
    code-all/                        # front → back pipeline + config-bridge
    code-from-db/                    # MySQL 表结构 → md → 全栈（或 PO-only）
    code-optimize/                   # front + back performance analysis + prioritized fixes
    guava-codegen/                   # entry skill: delegates to the guava-codegen agent
  agents/
    guava-codegen.md                 # 调度 agent：按 md 路径/表名自动选择并执行 code-* skill
```

## Commands

**Developing the plugin locally** (plugin authors):

```bash
# Load plugin from local path into a Claude Code session
claude --plugin-dir /path/to/guava-claude-plugins/plugins/guava-plugins

# Refresh vendored component usage from guava-press (author machine only;
# requires guava-press checkout; regenerates usage.json + .mcp.json)
cd plugins/guava-plugins
CLAUDE_PROJECT_DIR=/path/to/ses-web node mcp/generate-components.mjs

# Refresh the guava-backend knowledge snapshot (author machine only;
# requires a guava-pro checkout; regenerates mcp/guava-backend/data/*.json)
cd plugins/guava-plugins
node mcp/generate-backend.mjs /path/to/guava-pro   # or GUAVA_PRO_ROOT

# Self-test one component MCP against a consumer project
cd /path/to/ses-web
CLAUDE_PROJECT_DIR=$PWD CLAUDE_PLUGIN_ROOT=/path/to/.../guava-plugins \
  node "$CLAUDE_PLUGIN_ROOT/mcp/components/GvForm/server.mjs"
```

After editing plugin files, run `/reload-plugins` inside Claude Code.

**Consumer project** (e.g. `ses-web`) — relevant when the consumer invokes a skill:

```bash
pnpm install | dev | build | preview
pnpm lint:lint-stitched
mvn -pl guava-admin-starter -am compile -q   # backend, needs JDK >= 25
mvn spotless:apply                           # if configured
```

Env consumed: `GUAVA_BACKEND_ROOT` (defaults to `${CLAUDE_PROJECT_DIR}/../guava-admin`), `GUAVA_JAVA_FORMAT` (`auto` | `idea` | `google-java-format` | `spotless` | `none`), `GUAVA_IDEA_FORMAT` / `GUAVA_IDEA_HOME` / `GUAVA_IDEA_SCHEME` (IDEA headless format 定位与代码风格覆盖).

## Architecture

**Three layers that must be understood together:**

1. **Skills** (`skills/*/SKILL.md` + `templates/`) define the code-generation workflow. `code-frontend` reads a consumer's `src/pages/<feature>.md` config (YAML + tables) and writes Vue/API/helper/types/i18n into `src/views/<view>/`. `code-backend` writes Java under `GUAVA_BACKEND_ROOT` (templates aligned to the `SysUser*` reference files: 4-space, Allman braces, `<p>` Javadoc). `code-all` is a pure orchestration doc (Phase A front subagent → Phase B back subagent, bridged by `config-bridge.md`). `code-optimize` analyzes front/back code for performance bottlenecks, memory leaks, and optimization opportunities, delivering prioritized fixes. Each skill owns an **overlay policy** (`_shared.md`): e.g. `types/helper/data/vue` are whole-file overwritten; `src/api/*` is append-only for missing functions; `zh-CN.ts`/`en.ts` replace per-key groups.

2. **MCP servers** (`mcp/`) supply component knowledge. `guava-ui` is the **catalog** (list/resolve/search Gv*, page recipes like `crud-list` / `form-edit` / `tabs`). Each `gv-*` server exposes `get_usage` / `get_api` / `get_examples` (vendored from press at generate time; may lag npm), `get_props` (live from the consumer's `node_modules/guava-ui/lib/types/index.d.ts`), and `get_source` (original SFC shipped inside the installed package's source map — the npm-freshness ground truth). Responses to the doc tools carry an `npm` block (`packageVersion` / `sfcLastEditTime` / `pressGeneratedAt`) so callers can judge press staleness; props / emits / 源码 are always npm-authoritative. The skill mandates: **never write `<template>` without first calling the relevant MCP**; prefer `Gv*`, fall back to `el-*` only when no wrapper exists. The backend counterpart is `guava-backend` (`mcp/guava-backend/`): `get_stack` (module layering parent-BOM → component → entity → platform), `list/search/get_dependency` (BOM deps + versions from `guava-parent-starter`), and `list/search/get_platform_class` (class index of platform/component/entity starters, e.g. `MyUtil` / `AssertMyUtil` / `BasePO` / `MarkLog`). `code-backend` mandates `get_stack` before writing any Java; versions are BOM-authoritative (`version=null` = managed by an imported BOM, never hardcode).

3. **Hook** (`hooks/lint-fix.sh`) fires on `PostToolUse`/`PostToolBatch`/`Stop`. For front files (`*.ts/*.tsx/*.vue/*.js/*.mjs/...`) and style files (`*.css/*.scss/*.less/*.sass/*.styl`) it runs `prettier --write` → `eslint --fix` / `stylelint --fix` → `prettier --write`. For `*.java` it runs **IDEA headless format** (`Contents/MacOS/idea format`, invoked directly — `bin/format.sh` double-injects the command token and breaks; isolated `idea.config.path`/`idea.system.path` under the session cache avoid the single-instance lock), batched at `PostToolBatch`/`Stop` (never per-file at `PostToolUse`); scheme resolution: project `.idea/codeStyles/Project.xml` → `GUAVA_IDEA_SCHEME` → JetBrains `codestyles/Default Custom.xml` → `-allowDefaults`. Fallback chain (google-java-format → spotless) only when IDEA is unavailable. On `Stop`, accumulated files are re-checked (eslint + stylelint + `prettier --check` + java); failure **blocks** the stop.

**Front/back isolation:** `agents/guava-codegen.md` never loads skill docs itself — it routes and then delegates to dedicated subagents (front subagent reads only `code-frontend` + `context/front.md`; back subagent only `code-backend` + `context/backend.md`), so the two ends' contexts never mix (token savings). Full-stack = two subagents run sequentially, with the back prompt carrying the front-produced alignment params (`apiBase` / `paths` / query `field`s).

**Generation-time vs. runtime split:** `mcp/_shared/press-extract.mjs` runs **only on the author machine** (reads guava-press markdown, writes vendored `usage.json` per component). On the consumer machine, `mcp/_shared/npm-types.mjs` reads installed `guava-ui` types and `mcp/_shared/npm-source.mjs` extracts original SFCs from the shipped source map. The `generate-components.mjs` script bridges the two — it must NOT be shipped as a runtime dependency. Likewise `generate-backend.mjs` (guava-pro checkout → `mcp/guava-backend/data/*.json`) is author-only. All tool results pass through `mcp/_shared/disk-cache.mjs` (cross-session cache at `${CLAUDE_PROJECT_DIR}/.claude/cache/guava-mcp/`, keyed on source-file mtime+size), so press regeneration, a `pnpm install` upgrade, or a backend snapshot refresh invalidates automatically.

## Conventions worth knowing before editing

- Skill files are Markdown consumed as system prompts; `disable-model-invocation: true` means they're only reachable via `/guava-plugins:<name>`.
- Component MCP servers are generated (templated `server.mjs` written by `generate-components.mjs`); don't hand-edit them — regenerate.
- `paths.mjs` `resolveProjectRoot()` resolves the consumer project in order: `CLAUDE_PROJECT_DIR` / `GUAVA_PROJECT_DIR` env → cwd if it has `node_modules/guava-ui` → walk up from cwd; missing env vars or unusual layouts break prop/source resolution.
- Front code style is strict: `const fn = () => {}` only (no `function`, no `reactive`, no bare `any` → `Recordable<any>`), `@section` markers, multi-line JSDoc per method. Enforced by `code-review.md` checklists and the lint hook.
- Backend targets JDK >= 25; generated Java must compile at that level.
- Consumer settings live in the consumer's `.claude/settings.json` (env + permissions), **not** here. This repo's `.claude/settings.json` is for developing the plugin itself.
