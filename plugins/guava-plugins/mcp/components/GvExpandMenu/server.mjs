#!/usr/bin/env node
/**
 * GvExpandMenu MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvExpandMenu)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvExpandMenu',
  componentDir: componentDirFrom(import.meta.url),
});
