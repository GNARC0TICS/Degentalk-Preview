import type { AdminId } from '@db/types';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_PATH = path.resolve(__dirname, '../migration/uuid-audit.json');
const OUTPUT_PATH = path.resolve(__dirname, 'id-codemod-plan.md');

if (!fs.existsSync(AUDIT_PATH)) {
  console.error('uuid-audit.json not found – run audit first.');
  process.exit(1);
}

interface AuditEntry {
  file: : AdminId;
  line: number;
  match: : AdminId;
}

const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8')) as {
  codeIntegerIdOccurrences: AuditEntry[];
};

const groups = new Map<: AdminId, AuditEntry[]>();
for (const entry of audit.codeIntegerIdOccurrences) {
  if (!groups.has(entry.file)) groups.set(entry.file, []);
  groups.get(entry.file)!.push(entry);
}

// Build markdown report
let md = `# ID Codemod Plan\n\nGenerated ${new Date().toISOString()}\n\n`;
for (const [file, entries] of [...groups.entries()].sort()) {
  md += `## ${file}\n`;
  for (const e of entries) {
    md += `- [ ] L${e.line}: \`${e.match.trim()}\` → replace \`number\` with branded type\n`;
  }
  md += '\n';
}

fs.writeFileSync(OUTPUT_PATH, md);
console.log(chalk.green(`Codemod plan written to ${path.relative(process.cwd(), OUTPUT_PATH)}`)); 