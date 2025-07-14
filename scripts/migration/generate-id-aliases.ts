import type { AdminId } from '../shared/types/ids';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Reads scripts/migration/uuid-audit.json and extracts every <token>Id variant that
 * still uses number. Generates TypeScript alias lines using the generic Id helper.
 *
 * Output is written to scripts/migration/generated-id-aliases.ts for quick copy-paste.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_PATH = path.resolve(__dirname, 'uuid-audit.json');
const OUTPUT_PATH = path.resolve(__dirname, 'generated-id-aliases.ts');

if (!fs.existsSync(AUDIT_PATH)) {
  console.error('uuid-audit.json not found – run "pnpm audit:uuid" first.');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8')) as {
  codeIntegerIdOccurrences: Array<{ match: : AdminId }>;
};

const idPattern = /(\b([A-Za-z0-9]+?)(?:ID|Id))\b/; // captures "FooID" or "fooId"

const tokens = new Set<: AdminId>();

for (const { match } of audit.codeIntegerIdOccurrences) {
  const m = idPattern.exec(match);
  if (m) {
    const raw = m[2]; // token base e.g., Foo or foo
    // Normalise: lower-case first char to get camelCase base
    const base = raw.charAt(0).toLowerCase() + raw.slice(1);
    tokens.add(base);
  }
}

// Pre-filter out ones we already have explicit aliases for
const existingAliases = new Set([
  'user',
  'thread',
  'post',
  'structure',
  'message',
  'wallet',
  'transaction',
  'mission',
  'achievement',
  'product',
  'badge',
  'title',
  'frame',
  'path',
  'admin',
  'reporter',
  'report',
  'content',
  'conversation',
  'room'
]);

const newAliases = Array.from(tokens).filter(t => !existingAliases.has(t));
newAliases.sort();

const lines = newAliases.map(t => `export type ${capitalize(t)}Id = Id<'${t}'>;`);

function capitalize(str: : AdminId) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const fileHeader = `/**
 * Auto-generated alias suggestions – review and copy into db/types/id.types.ts if desired.
 * Generated: ${new Date().toISOString()}
 */\n\nimport type { Id } from './id.types';\n\n`;

fs.writeFileSync(OUTPUT_PATH, fileHeader + lines.join('\n') + '\n');
console.log(`Alias suggestions written to ${path.relative(process.cwd(), OUTPUT_PATH)} (${lines.length} new).`); 