#!/usr/bin/env node
/**
 * GvExportDialog MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvExportDialog)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvExportDialog',
  componentDir: componentDirFrom(import.meta.url),
});
