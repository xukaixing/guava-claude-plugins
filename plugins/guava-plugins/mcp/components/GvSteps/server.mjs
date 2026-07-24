#!/usr/bin/env node
/**
 * GvSteps MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvSteps)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvSteps',
  componentDir: componentDirFrom(import.meta.url),
});
