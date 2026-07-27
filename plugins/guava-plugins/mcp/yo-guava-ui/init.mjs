#!/usr/bin/env node
/**
 * Build base data: scan component usage markdown files, write to docs-db.
 * Run: node init.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { YoDocsDB } from '@voyo/docs-db';
import { tips } from './tips.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = join(__dirname, '..', 'components');
const DB_PATH = join(__dirname, '.yo_ddb', 'data', 'docs.db');
const DOCS_DIR = join(__dirname, '.yo_ddb', 'docs');

const questionMap = new Map(tips.map((t) => [t.name, t.question]));

async function main() {
  const db = new YoDocsDB({ dbPath: DB_PATH, docsDir: DOCS_DIR });

  // Clear existing data before rebuild
  const existing = db.list({ type: 'frontend', lang: 'vue' });
  for (const doc of existing.documents) {
    db.delete({ id: doc.id });
  }
  if (existing.documents.length > 0) {
    console.log(`Cleared ${existing.documents.length} old entries.`);
  }

  const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('Gv')) continue;
    const usagePath = join(COMPONENTS_DIR, entry.name, 'usage.md');
    let content;
    try {
      content = await readFile(usagePath, 'utf-8');
    } catch {
      console.warn(`Skip ${entry.name}: no usage.md`);
      continue;
    }
    const question = questionMap.get(entry.name) || `${entry.name} 组件`;
    const result = await db.write({
      type: 'frontend',
      lang: 'vue',
      question,
      doc_name: entry.name,
      content,
    });
    count++;
    console.log(`  ${entry.name} → ${result.id} (${result.keywords.length} keywords)`);
  }

  console.log(`\nDone: ${count} components indexed.`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
