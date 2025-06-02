import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('./'); // Project root
const targetExts = ['.ts', '.tsx']; // File types to edit

function walk(dir: string): string[] {
  const files = fs.readdirSync(dir);
  return files.flatMap((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) return walk(fullPath);
    if (targetExts.includes(path.extname(fullPath))) return [fullPath];
    return [];
  });
}

const files = walk(rootDir);

let updatedCount = 0;

for (const file of files) {
  const contents = fs.readFileSync(file, 'utf8');
  const updated = contents.replace(/(from\s+["'])@db\/index(["'])/g, '$1@db$2');

  if (updated !== contents) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    updatedCount++;
  }
}

console.log(`\n🎉 Refactor complete. ${updatedCount} file(s) updated.`); 