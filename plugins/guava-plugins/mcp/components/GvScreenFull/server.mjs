#!/usr/bin/env node
/**
 * GvScreenFull MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvScreenFull)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvScreenFull',
  componentDir: componentDirFrom(import.meta.url),
});
