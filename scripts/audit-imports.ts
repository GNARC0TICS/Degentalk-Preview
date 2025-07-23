import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';

const patterns = [
  '**/*.ts',
  '**/*.tsx',
  '!**/node_modules/**',
  '!**/dist/**',
  '!**/.next/**'
];

async function auditImports() {
  const files = await glob(patterns, { cwd: process.cwd() });
  const importMap = new Map<string, Set<string>>();
  
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const imports = content.match(/from ['"](@[^'"]+)['"]/g) || [];
    
    imports.forEach(imp => {
      const alias = imp.match(/from ['"](@[^/'"]+)/)?.[1];
      if (alias) {
        if (!importMap.has(alias)) {
          importMap.set(alias, new Set());
        }
        importMap.get(alias)!.add(file);
      }
    });
  }
  
  // Generate report
  console.log('Current Import Alias Usage:');
  importMap.forEach((files, alias) => {
    console.log(`\n${alias}: ${files.size} files`);
  });
}

auditImports();
