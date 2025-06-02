import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = ['.ts', '.tsx'];
let changed = 0;

function walk(dir: string): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  return files.flatMap(entry => {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(res);
    if (exts.includes(path.extname(res))) return [res];
    return [];
  });
}

const allFiles = walk(root);

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const pattern = /from\s+['"]@db\/schema['"]/g;
  if (pattern.test(content)) {
    const updated = content.replace(pattern, `from '@schema'`);
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    changed++;
  }
}

console.log(`\n🎉 Clean sweep complete. ${changed} file(s) updated.`); 