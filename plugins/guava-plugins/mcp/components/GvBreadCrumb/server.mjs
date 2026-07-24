#!/usr/bin/env node
/**
 * GvBreadCrumb MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvBreadCrumb)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvBreadCrumb',
  componentDir: componentDirFrom(import.meta.url),
});
