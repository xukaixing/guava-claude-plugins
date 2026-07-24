#!/usr/bin/env node
/**
 * GvHamburger MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvHamburger)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvHamburger',
  componentDir: componentDirFrom(import.meta.url),
});
