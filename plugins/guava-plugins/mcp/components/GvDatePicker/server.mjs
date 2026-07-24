#!/usr/bin/env node
/**
 * GvDatePicker MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvDatePicker)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvDatePicker',
  componentDir: componentDirFrom(import.meta.url),
});
