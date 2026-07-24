#!/usr/bin/env node
/**
 * GvTagsView MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvTagsView)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvTagsView',
  componentDir: componentDirFrom(import.meta.url),
});
