#!/usr/bin/env node
/**
 * GvSidebar MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvSidebar)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvSidebar',
  componentDir: componentDirFrom(import.meta.url),
});
