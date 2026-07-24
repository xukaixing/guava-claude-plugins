#!/usr/bin/env node
/**
 * GvTag MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvTag)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvTag',
  componentDir: componentDirFrom(import.meta.url),
});
