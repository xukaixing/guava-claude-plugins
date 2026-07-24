#!/usr/bin/env node
/**
 * GvSwitch MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvSwitch)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvSwitch',
  componentDir: componentDirFrom(import.meta.url),
});
