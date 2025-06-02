import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = ['.ts', '.tsx'];
const pattern = `from '@schema'`;
const replacement = `from '@schema'`;
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

const allFiles = walk(path.join(root, 'scripts'))
  .concat(walk(path.join(root, 'server')))
  .concat(walk(path.join(root, 'client')))
  .concat(walk(root));

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(pattern)) {
    const updated = content.replaceAll(pattern, replacement);
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ Updated: ${file}`);
    changed++;
  }
}

console.log(`\n🎉 Alias refactor complete. ${changed} file(s) updated.`); 