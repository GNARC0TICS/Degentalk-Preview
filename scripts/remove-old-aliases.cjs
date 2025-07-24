const fs = require('fs');
const path = require('path');

console.log('=== Removing Old Import Aliases ===\n');

// 1. Update tsconfig.base.json
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.base.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

// Remove old paths
const oldPaths = ['@/*', '@server/*', '@server-core/*'];
oldPaths.forEach(oldPath => {
  if (tsconfig.compilerOptions.paths[oldPath]) {
    delete tsconfig.compilerOptions.paths[oldPath];
    console.log(`✅ Removed ${oldPath} from tsconfig.base.json`);
  }
});

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');

// 2. Update client/vite.config.ts
const viteConfigPath = path.join(__dirname, '..', 'client', 'vite.config.ts');
let viteContent = fs.readFileSync(viteConfigPath, 'utf-8');

// Remove old alias entries
const oldAliasPatterns = [
  /{\s*find:\s*'@',\s*replacement:[^}]+},?\s*/g,
  /{\s*find:\s*'@server',\s*replacement:[^}]+},?\s*/g,
  /{\s*find:\s*'@server-core',\s*replacement:[^}]+},?\s*/g,
  // Also remove any trailing commas after the last alias
];

oldAliasPatterns.forEach(pattern => {
  const matches = viteContent.match(pattern);
  if (matches) {
    viteContent = viteContent.replace(pattern, '');
    console.log(`✅ Removed old alias from vite.config.ts`);
  }
});

// Clean up any double commas or trailing commas
viteContent = viteContent.replace(/,\s*,/g, ',');
viteContent = viteContent.replace(/,\s*]/g, ']');

fs.writeFileSync(viteConfigPath, viteContent);

// 3. Update .eslintrc.json 
const eslintrcPath = path.join(__dirname, '..', '.eslintrc.json');
const eslintrc = JSON.parse(fs.readFileSync(eslintrcPath, 'utf-8'));

// Update import/resolver paths
if (eslintrc.settings?.['import/resolver']?.typescript?.project) {
  console.log('✅ ESLint config already uses wildcard paths, no changes needed');
}

fs.writeFileSync(eslintrcPath, JSON.stringify(eslintrc, null, 2) + '\n');

console.log('\n✅ Successfully removed all old import aliases!');
console.log('\nNext steps:');
console.log('1. Run "pnpm install" to ensure dependencies are in sync');
console.log('2. Run "pnpm build" to verify everything compiles');
console.log('3. Run tests to ensure nothing is broken');