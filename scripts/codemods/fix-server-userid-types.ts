#!/usr/bin/env tsx

/**
 * fix-server-userid-types.ts
 * ---------------------------------
 * QUICK-WIN CODEMOD (HIGH CONFIDENCE)
 * Converts most remaining `userId: number` patterns and
 * `parseInt(req.params.userId)` usages inside `server/` to branded `UserId`.
 *
 * Usage
 *   pnpm tsx scripts/codemods/fix-server-userid-types.ts --dry   # preview
 *   pnpm tsx scripts/codemods/fix-server-userid-types.ts --apply # write changes
 *
 * Notes
 * • Only touches TypeScript/TSX inside server/src/**
 * • Creates a *.bak copy of each modified file for safety.
 * • Skips files already importing `UserId` from `@shared/types`.
 * • Logs a concise report at the end.
 */

import { glob } from 'glob';
import { readFileSync, writeFileSync, cpSync, existsSync } from 'fs';
import path from 'path';
import minimist from 'minimist';

interface FileChangeLog {
  file: string;
  replacements: number;
  addedImport: boolean;
}

const argv = minimist(process.argv.slice(2));
const DRY_RUN = argv.dry ?? !argv.apply;

const SERVER_PATTERN = 'server/src/**/*.{ts,tsx}';
const USERID_NUMBER_REGEX = /(userId\s*:\s*)number(\b)/g;
const PARSEINT_REGEX = /parseInt\(\s*req\.params\.userId\s*(?:,\s*10)?\s*\)/g;

async function run(): Promise<void> {
  const files = await glob(SERVER_PATTERN, {
    nodir: true,
    absolute: true,
    ignore: ['**/node_modules/**'],
  });

  const report: FileChangeLog[] = [];

  for (const file of files) {
    const original = readFileSync(file, 'utf-8');
    let content = original;
    let replacements = 0;
    let addedImport = false;

    // Replace `userId: number` ➜ `userId: UserId`
    content = content.replace(USERID_NUMBER_REGEX, (_, prefix, suffix) => {
      replacements += 1;
      return `${prefix}UserId${suffix}`;
    });

    // Replace parseInt patterns
    content = content.replace(PARSEINT_REGEX, () => {
      replacements += 1;
      return 'req.params.userId as UserId';
    });

    if (replacements === 0) continue;

    // Ensure import exists
    if (!/import\s+[^;]*UserId[^;]*from\s+["']@shared\/types\/ids["']/.test(content)) {
      const importStmt = "import type { UserId } from '@shared/types/ids';";
      // place after first import block or at top
      const firstImportMatch = content.match(/import[^;]+;/);
      if (firstImportMatch) {
        const idx = firstImportMatch.index! + firstImportMatch[0].length;
        content = content.slice(0, idx) + `\n${importStmt}` + content.slice(idx);
      } else {
        content = `${importStmt}\n${content}`;
      }
      addedImport = true;
    }

    if (!DRY_RUN) {
      // backup original
      const backupPath = `${file}.bak`;
      if (!existsSync(backupPath)) {
        cpSync(file, backupPath);
      }
      writeFileSync(file, content, 'utf-8');
    }

    report.push({ file: path.relative(process.cwd(), file), replacements, addedImport });
  }

  // Report
  console.log(`\n🛠️  fix-server-userid-types — ${DRY_RUN ? 'DRY RUN' : 'APPLY'} COMPLETE`);
  console.log('──────────────────────────────────────────────');
  if (report.length === 0) {
    console.log('No changes necessary – great job!');
    return;
  }
  report.forEach(({ file, replacements, addedImport }) => {
    console.log(`• ${file}  (+${replacements} changes${addedImport ? ', import added' : ''})`);
  });
  console.log(`\nFiles updated: ${report.length}`);
  console.log('To apply these changes, re-run with --apply');
}

run().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
}); 