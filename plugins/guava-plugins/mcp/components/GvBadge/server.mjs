#!/usr/bin/env node
/**
 * GvBadge MCP (plugin-bundled)
 * - Usage: usage.json (vendored from press)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvBadge',
  componentDir: componentDirFrom(import.meta.url),
});
