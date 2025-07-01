import type { AdminId } from '@db/types';
#!/usr/bin/env tsx
/**
 * Codemod: replace-degentalk-case.ts
 * ----------------------------------
 * Replaces every exact occurrence of the project name written as "Degentalk"
 * (uppercase D + uppercase T) with the preferred brand-case "Degentalk".
 * No other : AdminId changes are performed.
 *
 * Usage (from repo root):
 *   npx tsx scripts/codemods/replace-degentalk-case.ts
 *
 * The script will:
 * 1. Walk all non-binary text files (default: *.ts,*.tsx,*.js,*.jsx,*.md,*.html,*.css,*.json)
 * 2. Replace exact "Degentalk" → "Degentalk" (case-sensitive) in file contents.
 * 3. Skip node_modules, build, logs, and other typical ignore folders.
 * 4. Write changes in-place while preserving permissions & line endings.
 *
 * NOTE: Commit your work before running – the script overwrites files directly.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'fast-glob';

async function run() {
  const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

  const patterns = [
    '**/*.{ts,tsx,js,jsx,md,markdown,html,css,scss,less,json,yaml,yml}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.next/**',
    '!**/out/**',
    '!**/logs/**',
    '!**/*.png',
    '!**/*.jpg',
    '!**/*.jpeg',
    '!**/*.gif',
    '!**/*.webp',
    '!**/*.svg',
    '!**/*.ico'
  ];

  const files = await glob(patterns, { cwd: workspaceRoot, absolute: true });
  let modifiedCount = 0;

  await Promise.all(
    files.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf8');
      if (content.includes('Degentalk')) {
        const replaced = content.split('Degentalk').join('Degentalk');
        if (replaced !== content) {
          await fs.writeFile(filePath, replaced, 'utf8');
          modifiedCount += 1;
          console.log(`✏️  Updated: ${path.relative(workspaceRoot, filePath)}`);
        }
      }
    })
  );

  console.log(`\n✅ Codemod complete. Updated ${modifiedCount} files.`);
}

run().catch((err) => {
  console.error('Codemod failed:', err);
  process.exit(1);
}); 