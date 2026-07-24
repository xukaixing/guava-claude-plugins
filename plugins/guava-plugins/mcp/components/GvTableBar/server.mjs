#!/usr/bin/env node
/**
 * GvTableBar MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvTableBar)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvTableBar',
  componentDir: componentDirFrom(import.meta.url),
});
