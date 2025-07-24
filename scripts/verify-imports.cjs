const glob = require('glob');
const fs = require('fs');

// Map of old to new patterns
const oldPatterns = [
  '@/',
  '@server/',
  '@server-core/',
  '@server-utils/',
  '@server-middleware/',
  '@middleware/',
  '@domains/',
  '@lib/',
  '@server-lib/'
];

// Find all TypeScript/JavaScript files
const files = glob.sync([
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '!node_modules/**',
  '!**/node_modules/**',
  '!dist/**',
  '!build/**',
  '!.next/**',
  '!out/**'
]);

let totalOldImports = 0;
const filesByPattern = {};

files.forEach(file => {
  try {
    const stats = fs.statSync(file);
    if (stats.isDirectory()) return;
    
    const content = fs.readFileSync(file, 'utf-8');
  
  oldPatterns.forEach(pattern => {
    const regex = new RegExp(`from\\s+['"]${pattern.replace('/', '\\/')}`, 'g');
    const matches = content.match(regex);
    
    if (matches && matches.length > 0) {
      totalOldImports += matches.length;
      if (!filesByPattern[pattern]) {
        filesByPattern[pattern] = [];
      }
      filesByPattern[pattern].push({
        file,
        count: matches.length
      });
    }
  });
  } catch (error) {
    // Skip files we can't read
  }
});

console.log('\n=== Import Path Verification Report ===\n');

if (totalOldImports === 0) {
  console.log('✅ SUCCESS: No old import patterns found!');
  console.log('All imports have been successfully converted to the new patterns.');
} else {
  console.log(`⚠️  WARNING: Found ${totalOldImports} old import patterns still in use:\n`);
  
  Object.entries(filesByPattern).forEach(([pattern, files]) => {
    console.log(`\n${pattern} - ${files.reduce((sum, f) => sum + f.count, 0)} occurrences:`);
    files.forEach(({ file, count }) => {
      console.log(`  ${file} (${count})`);
    });
  });
  
  console.log('\nThese files need to be updated before removing old aliases from configs.');
}

console.log('\n=== Summary ===');
console.log(`Total files scanned: ${files.length}`);
console.log(`Total old imports found: ${totalOldImports}`);
console.log(`Files with old imports: ${Object.values(filesByPattern).flat().length}`);