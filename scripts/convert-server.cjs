const glob = require('glob');
const fs = require('fs');

const files = glob.sync(['server/**/*.ts', '!server/node_modules/**', '!server/dist/**', '!server/build/**']);
let totalChanges = 0;
let fileCount = 0;

const mappings = {
  '@server/': '@api/',
  '@server-core/': '@core/',
  '@server-utils/': '@api/utils/',
  '@server-middleware/': '@api/middleware/',
  '@middleware/': '@api/middleware/',
  '@domains/': '@api/domains/',
  '@lib/': '@shared/lib/',
  '@server-lib/': '@shared/lib/',
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;
  let changes = 0;

  // Apply each mapping
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

console.log(`\n✅ Updated ${totalChanges} imports across ${fileCount} files in server workspace`);