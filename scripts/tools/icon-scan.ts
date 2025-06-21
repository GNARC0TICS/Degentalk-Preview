#!/usr/bin/env ts-node
/*
 * Icon Usage Scanner
 * ------------------
 * Recursively searches `client/src/` for `lucide-react` imports and writes the list
 * of discovered icon names to `client/src/components/icons/icon-usage-snapshot.txt`.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive directory name in ESM context
const thisDir = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(thisDir, '../../');
const SRC_DIR = path.join(PROJECT_ROOT, 'client', 'src');
const OUTPUT_FILE = path.join(
  PROJECT_ROOT,
  'client',
  'src',
  'components',
  'icons',
  'icon-usage-snapshot.txt'
);

const LUCIDE_IMPORT_REGEX = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/g;

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules or dist just in case
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && /\.[jt]sx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function collectIcons() {
  const allFiles = await walk(SRC_DIR);
  const icons = new Set<string>();

  for (const file of allFiles) {
    const content = await fs.readFile(file, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = LUCIDE_IMPORT_REGEX.exec(content))) {
      const imported = match[1]
        .split(',')
        .map((s) => s.trim().split(' as ')[0].trim()) // strip aliasing
        .filter(Boolean);
      imported.forEach((name) => icons.add(name));
    }
  }

  const sorted = Array.from(icons).sort();
  const header = `// Auto-generated on ${new Date().toISOString()}. Do not edit manually.\n\n`;
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, header + sorted.join('\n'), 'utf8');
  console.log(`✔ Found ${sorted.length} unique Lucide icons. Snapshot written to icon-usage-snapshot.txt`);
}

collectIcons().catch((err) => {
  console.error('Icon scan failed:', err);
  process.exit(1);
}); 