#!/usr/bin/env node
/**
 * GvDescriptions MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui npm types)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvDescriptions',
  componentDir: componentDirFrom(import.meta.url),
});
