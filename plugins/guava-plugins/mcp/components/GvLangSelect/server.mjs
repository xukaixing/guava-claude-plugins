#!/usr/bin/env node
/**
 * GvLangSelect MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvLangSelect)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvLangSelect',
  componentDir: componentDirFrom(import.meta.url),
});
