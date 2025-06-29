import globby from 'globby';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * identify-legacy-user-fetch.ts
 * --------------------------------
 * Scans the backend (server/src) for any remaining "legacy" user-fetching patterns that
 * should be migrated to the new UserService (userService.getUserFromRequest()).
 *
 * Patterns searched:
 *   1. Direct access to `req.user` (optionally with the optional-chaining operator)
 *   2. Calls to helper functions that are now obsolete (getUser, getUserFromRequest, getAuthenticatedUser, getUserId)
 *
 * Usage (from repo root):
 *   npx ts-node --transpile-only scripts/codemods/identify-legacy-user-fetch.ts [--write report.json]
 *
 *   • Without --write  – prints a prettified table to stdout
 *   • With    --write  – writes a JSON array of objects { file, line, snippet } to the given path
 */

/** Regex patterns for legacy look-ups */
const LEGACY_PATTERNS: RegExp[] = [
  /\breq\.user\b/,
  /\bgetUserFromRequest\s*\(/,
  /\bgetAuthenticatedUser\s*\(/,
  /\bgetUserId\s*\(/,
  /\bgetUser\s*\(/,
];

interface Hit {
  file: string;
  line: number;
  snippet: string;
}

async function scan(): Promise<Hit[]> {
  const files = await globby(['server/src/**/*.ts', 'server/src/**/*.tsx'], {
    gitignore: true,
  });

  const hits: Hit[] = [];

  await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, 'utf8');
      const lines = content.split(/\r?\n/);

      lines.forEach((lineText, idx) => {
        for (const pattern of LEGACY_PATTERNS) {
          if (pattern.test(lineText)) {
            hits.push({
              file: path.relative(process.cwd(), file),
              line: idx + 1,
              snippet: lineText.trim(),
            });
            break; // no need to test other patterns for the same line
          }
        }
      });
    })
  );

  return hits;
}

async function main() {
  const writeIdx = process.argv.findIndex((arg) => arg === '--write');
  const writePath = writeIdx !== -1 ? process.argv[writeIdx + 1] : undefined;

  const hits = await scan();

  if (writePath) {
    await import('node:fs/promises').then(({ writeFile }) =>
      writeFile(writePath, JSON.stringify(hits, null, 2), 'utf8')
    );
    console.log(`\n🚀  Legacy user-fetch report written to ${writePath} (total ${hits.length} hits)\n`);
  } else {
    if (!hits.length) {
      console.log('\n🎉  No legacy user-fetch patterns found.');
      return;
    }

    console.log(`\nFound ${hits.length} potential legacy user-fetch occurrences:\n`);
    const pad = (n: string | number, w: number) => String(n).padStart(w);
    hits.forEach(({ file, line, snippet }) => {
      console.log(`  ${file}:${pad(line, 4)}  |  ${snippet}`);
    });
    console.log();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 