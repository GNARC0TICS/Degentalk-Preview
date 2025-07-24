const glob = require('glob');
const fs = require('fs');

const files = glob.sync(['client/**/*.ts', 'client/**/*.tsx', '!client/node_modules/**', '!client/dist/**', '!client/build/**']);
let totalChanges = 0;
let fileCount = 0;

// Only convert @/ to @app/
// Keep other patterns as they are for now
const mappings = {
  '@/': '@app/',
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;
  let changes = 0;

  // Apply the mapping
  Object.entries(mappings).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(`from\\s+['"]${oldPath.replace('/', '\\/')}`, 'g');
    const newContent = content.replace(regex, `from '${newPath}`);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      changes++;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content);
    fileCount++;
    totalChanges += changes;
    console.log(`✅ Updated ${changes} imports in: ${file}`);
  }
});

console.log(`\n✅ Updated ${totalChanges} imports across ${fileCount} files in client workspace`);