import type { AdminId } from '@shared/types/ids';
import fs from 'fs';
import path from 'path';

const GENERATED_DIR = path.resolve('db/types/generated');
const SDK_DIR = path.resolve('forum-sdk');

if (!fs.existsSync(SDK_DIR)) {
  fs.mkdirSync(SDK_DIR, { recursive: true });
}

// Create index.ts that re-exports everything from generated types directory
const exportLines: string[] = [];
const files = fs.readdirSync(GENERATED_DIR).filter((f) => f.endsWith('.ts'));
for (const file of files) {
  const base = path.basename(file, '.ts');
  exportLines.push(`export * from '../db/types/generated/${base}.js';`);
}

fs.writeFileSync(path.join(SDK_DIR, 'index.ts'), exportLines.join('\n'));
console.log('forum-sdk built with', files.length, 'type modules'); 