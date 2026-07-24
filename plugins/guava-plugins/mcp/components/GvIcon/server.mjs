#!/usr/bin/env node
/**
 * GvIcon MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvIcon)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvIcon',
  componentDir: componentDirFrom(import.meta.url),
});
