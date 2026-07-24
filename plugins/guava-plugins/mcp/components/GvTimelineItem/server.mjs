#!/usr/bin/env node
/**
 * GvTimelineItem MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/GvTimelineItem)
 * - Props: ${CLAUDE_PROJECT_DIR}/node_modules/guava-ui types
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvTimelineItem',
  componentDir: componentDirFrom(import.meta.url),
});
