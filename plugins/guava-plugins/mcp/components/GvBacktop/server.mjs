#!/usr/bin/env node
/**
 * GvBacktop MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvBacktop)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvBacktop',
  componentDir: componentDirFrom(import.meta.url),
});
