#!/usr/bin/env node
/**
 * GvStep MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvStep)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvStep',
  componentDir: componentDirFrom(import.meta.url),
});
