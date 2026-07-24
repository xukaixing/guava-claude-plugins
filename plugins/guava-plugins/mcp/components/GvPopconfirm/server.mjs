#!/usr/bin/env node
/**
 * GvPopconfirm MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvPopconfirm)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvPopconfirm',
  componentDir: componentDirFrom(import.meta.url),
});
