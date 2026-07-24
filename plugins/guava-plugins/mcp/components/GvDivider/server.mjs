#!/usr/bin/env node
/**
 * GvDivider MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvDivider)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvDivider',
  componentDir: componentDirFrom(import.meta.url),
});
