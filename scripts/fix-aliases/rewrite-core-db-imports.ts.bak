import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = ['.ts', '.tsx'];
let changed = 0;

const dbPatterns = [
  // core/db patterns
  /from\s+['"][.\/]*src\/core\/db['"]/g,
  /from\s+['"][.\/]*core\/db['"]/g,
  /from\s+['"]@server\/src\/core\/db['"]/g,
  /vi\.mock\(['"][.\/]*core\/db['"]\)/g,
  /vi\.mock\(['"]@server\/src\/core\/db['"]\)/g,
  
  // db/schema patterns
  /from\s+['"][.\/]*db\/schema['"]/g,
  /from\s+['"]@\/db\/schema['"]/g,
  /from\s+['"]@\/\.\.\/db\/schema['"]/g,
  /from\s+['"][.\/]*db\/schema\/[^'"]+['"]/g,
  /vi\.mock\(['"][.\/]*db\/schema['"]\)/g,
  /vi\.mock\(['"]@\/db\/schema['"]\)/g
];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const res = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(res)
      : exts.includes(path.extname(res)) ? [res] : [];
  });
}

const files = walk(root);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let updated = content;
  let wasChanged = false;

  // Replace core/db patterns
  for (const regex of dbPatterns.slice(0, 5)) {
    if (regex.test(updated)) {
      updated = updated.replace(regex, match => {
        if (match.includes('vi.mock')) {
          return `vi.mock('@db')`;
        }
        return `from '@db'`;
      });
      wasChanged = true;
    }
  }
  
  // Replace db/schema patterns
  for (const regex of dbPatterns.slice(5)) {
    if (regex.test(updated)) {
      updated = updated.replace(regex, match => {
        if (match.includes('vi.mock')) {
          return `vi.mock('@schema')`;
        }
        // Check if it's a subpath import like db/schema/user/users
        if (match.includes('db/schema/')) {
          // Extract the subpath after db/schema/
          const subpathMatch = match.match(/db\/schema\/([^'"]+)/);
          if (subpathMatch) {
            return `from '@schema/${subpathMatch[1]}'`;
          }
        }
        return `from '@schema'`;
      });
      wasChanged = true;
    }
  }

  if (wasChanged) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ Rewritten: ${file}`);
    changed++;
  }
}

console.log(`\n🎉 Done. ${changed} file(s) updated.`); 