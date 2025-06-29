import globby from 'globby';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs/promises';

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
  // Only flag legacy helper functions, not the centralized userService.getUserFromRequest()
  /(?<!userService\.)getUserFromRequest\s*\(/,
  /\bgetAuthenticatedUser\s*\(/,
  /(?<!userService\.)getUserId\s*\(/,
  /(?<!userService\.)getUser\s*\(/,
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
        // Skip comments
        if (isComment(lineText)) return;
        
        // Skip core auth infrastructure files
        const relativePath = path.relative(process.cwd(), file);
        if (relativePath.includes('authenticate.ts') || 
            relativePath.includes('user.service.ts') ||
            relativePath.includes('base-controller.ts') ||
            relativePath.includes('admin.middleware.ts')) {
          // Only flag req.user in these files if it's not the expected core patterns
          if (/\breq\.user\b/.test(lineText)) {
            // Allow req.user = { in authenticate.ts (setting the user)
            if (relativePath.includes('authenticate.ts') && lineText.includes('req.user = {')) return;
            // Allow const user = req.user; in user.service.ts (reading the user)
            if (relativePath.includes('user.service.ts') && lineText.includes('const user = req.user')) return;
          }
          
          // Allow centralized getUserId/getUserFromRequest methods in core infrastructure
          if (relativePath.includes('user.service.ts') || 
              relativePath.includes('base-controller.ts') ||
              relativePath.includes('admin.middleware.ts')) {
            if (lineText.includes('getUserFromRequest') || lineText.includes('getUserId')) return;
          }
        }
        
        // Skip unrelated getUser calls (like storage.getUser)
        if (/\bgetUser\s*\(/.test(lineText) && !lineText.includes('userService')) {
          if (lineText.includes('storage.getUser') || lineText.includes('await getUser')) return;
        }

        for (const pattern of LEGACY_PATTERNS) {
          if (pattern.test(lineText)) {
            hits.push({
              file: relativePath,
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

// Category helper
function categorize(filePath: string): string {
  const p = filePath.toLowerCase();
  if (p.includes('/test') || p.includes('.test.')) return 'test';
  if (p.includes('middleware')) return 'middleware';
  if (p.includes('controller')) return 'controller';
  if (p.includes('service')) return 'service';
  if (p.includes('routes')) return 'routes';
  return 'other';
}

function isComment(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

async function generateMarkdown(matches: Hit[], outfile: string) {
  let md = `| File | Line | Category | Code |\n|------|------|----------|------|\n`;
  for (const m of matches) {
    const cat = categorize(m.file);
    const safeCode = m.snippet.replace(/\|/g, '\\|').slice(0, 120);
    md += `| ${m.file}:${m.line} | ${m.line} | ${cat} | ${safeCode} |\n`;
  }
  await fs.writeFile(outfile, md, 'utf8');
  console.log(`Markdown audit written to ${outfile}`);
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

  if (process.argv.includes('--markdown')) {
    const mdPath = process.argv[process.argv.indexOf('--markdown') + 1] as string;
    if (mdPath) await generateMarkdown(hits, mdPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 