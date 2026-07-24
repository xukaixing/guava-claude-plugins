#!/usr/bin/env node
/**
 * GvScrollPane MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvScrollPane)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvScrollPane',
  componentDir: componentDirFrom(import.meta.url),
});
