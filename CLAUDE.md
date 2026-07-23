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
    _shared/                         # MCP infra (paths, stdio, press extraction, npm-types)
    guava-ui/                        # catalog MCP: list/resolve/search Gv*, page recipes
    components/Gv{Anchor,Form,…}/    # one dir per component: usage.json + server.mjs
  skills/
    guava-front/   (+ templates/)    # Vue 3 + Guava UI page gen from src/pages/*.md
    guava-backend/ (+ templates/)    # Spring Boot Controller/Service/ServiceImpl
    guava-all/                       # front → back pipeline + config-bridge
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

Env consumed: `GUAVA_BACKEND_ROOT` (defaults to `${CLAUDE_PROJECT_DIR}/../guava-admin`), `GUAVA_JAVA_FORMAT` (`auto` | `google-java-format` | `spotless` | `none`).

## Architecture

**Three layers that must be understood together:**

1. **Skills** (`skills/*/SKILL.md` + `templates/`) define the code-generation workflow. `guava-front` reads a consumer's `src/pages/<feature>.md` config (YAML + tables) and writes Vue/API/helper/types/i18n into `src/views/<view>/`. `guava-backend` writes Java under `GUAVA_BACKEND_ROOT`. `guava-all` runs front then back, bridged by `config-bridge.md`. Each skill owns an **overlay policy** (`_shared.md`): e.g. `types/helper/data/vue` are whole-file overwritten; `src/api/*` is append-only for missing functions; `zh-CN.ts`/`en.ts` replace per-key groups.

2. **MCP servers** (`mcp/`) supply component knowledge. `guava-ui` is the **catalog** (list/resolve/search Gv*, page recipes like `crud-list` / `form-edit` / `tabs`). Each `gv-*` server exposes `get_usage` / `get_api` / `get_examples` (vendored from press at generate time) and `get_props` (live from the consumer's `node_modules/guava-ui/lib/types/index.d.ts`). The skill mandates: **never write `<template>` without first calling the relevant MCP**; prefer `Gv*`, fall back to `el-*` only when no wrapper exists.

3. **Hook** (`hooks/lint-fix.sh`) fires on `PostToolUse`/`PostToolBatch`/`Stop`. For `*.ts/*.tsx/*.vue/*.js/*.mjs` it runs `eslint --fix` (local bin → pnpm exec → npx). For `*.java` it formats via `google-java-format -i`, `mvn spotless:apply`, or `GUAVA_JAVA_FORMAT_CMD`. On `Stop`, accumulated files are re-checked; failure **blocks** the stop.

**Generation-time vs. runtime split:** `mcp/_shared/press-extract.mjs` runs **only on the author machine** (reads guava-press markdown, writes vendored `usage.json` per component). `mcp/_shared/npm-types.mjs` runs **on the consumer machine** (reads installed `guava-ui` types). The `generate-components.mjs` script bridges the two — it must NOT be shipped as a runtime dependency.

## Conventions worth knowing before editing

- Skill files are Markdown consumed as system prompts; `disable-model-invocation: true` means they're only reachable via `/guava-plugins:<name>`.
- Component MCP servers are generated (templated `server.mjs` written by `generate-components.mjs`); don't hand-edit them — regenerate.
- `paths.mjs` `resolveProjectRoot()` walks up from `MCP_ROOT` looking for `node_modules/guava-ui`; layout changes between plugin and consumer can break prop resolution.
- Front code style is strict: `const fn = () => {}` only (no `function`, no `reactive`, no bare `any` → `Recordable<any>`), `@section` markers, multi-line JSDoc per method. Enforced by `code-review.md` checklists and the lint hook.
- Backend targets JDK >= 25; generated Java must compile at that level.
- Consumer settings live in the consumer's `.claude/settings.json` (env + permissions), **not** here. This repo's `.claude/settings.json` is for developing the plugin itself.
