const glob = require('glob');
const fs = require('fs');

const files = glob.sync(['**/*.ts', '**/*.tsx', '!node_modules/**', '!dist/**', '!build/**']);
let fixCount = 0;
let fileCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;

  // Fix @db/types/forum.types imports
  content = content.replace(
    /from\s+['"]@db\/types\/forum\.types['"]/g,
    (match) => {
      modified = true;
      return `from '@shared/types/core/forum.types'`;
    }
  );

  // Fix other @db/types imports (for IDs and general types)
  content = content.replace(
    /from\s+['"]@db\/types(?:\/ids)?['"]/g,
    (match) => {
      modified = true;
      return `from '@shared/types/ids'`;
    }
  );

  // Fix any remaining @db/* imports that aren't @db/schema or @db (db instance)
  content = content.replace(
    /from\s+['"]@db\/(?!schema)(?!['"])[^'"]*['"]/g,
    (match, path) => {
      // Log but don't change these for now
      console.warn(`⚠️  Unhandled @db import in ${file}: ${match}`);
      return match;
    }
  );

  if (modified) {
    fs.writeFileSync(file, content);
    fileCount++;
    fixCount++;
    console.log(`✅ Fixed violations in: ${file}`);
  }
});

console.log(`\n✅ Fixed ${fileCount} files with @db architecture violations`);