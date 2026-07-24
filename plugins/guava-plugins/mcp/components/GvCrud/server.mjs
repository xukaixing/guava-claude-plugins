#!/usr/bin/env node
/**
 * GvCrud MCP (plugin-bundled)
 * - Usage: usage.json (vendored from guava-ui packages/utils/gv.crud.ts)
 * - Runtime: no npm types needed (pure utility, no Vue component)
 *
 * gv.crud.ts 是 guava-ui 的 CRUD 工具函数集合，通过 `import { crud } from 'guava-ui'` 使用。
 */
import { startComponentServer, componentDirFrom } from '../../_shared/component-factory.mjs';

startComponentServer({
  gvName: 'GvCrud',
  componentDir: componentDirFrom(import.meta.url),
});
