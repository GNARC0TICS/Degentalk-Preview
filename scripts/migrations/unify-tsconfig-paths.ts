#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import * as path from 'path';
import { parse as parseJsonc } from 'jsonc-parser';

console.log('🔧 Unifying TypeScript path configurations...\n');

// Load the root paths configuration (handles comments)
const rootPathsContent = readFileSync(path.join(process.cwd(), 'tsconfig.paths.json'), 'utf8');
const rootPathsConfig = parseJsonc(rootPathsContent);
const rootPaths = rootPathsConfig.compilerOptions?.paths || {};

// Find all workspace tsconfig files
const workspaceConfigs = glob.sync('*/tsconfig.json', { 
  ignore: ['node_modules/**', 'tsconfig.json'] 
});

console.log(`Found ${workspaceConfigs.length} workspace configs to process:\n`);

let changesCount = 0;

workspaceConfigs.forEach(configPath => {
  console.log(`Processing ${configPath}...`);
  
  try {
    const content = readFileSync(configPath, 'utf8');
    const config = parseJsonc(content);
    
    if (config.compilerOptions?.paths) {
      const originalPaths = { ...config.compilerOptions.paths };
      const uniquePaths: Record<string, string[]> = {};
      
      // Keep only workspace-specific paths not in root
      Object.entries(originalPaths).forEach(([key, value]) => {
        if (!rootPaths[key]) {
          uniquePaths[key] = value as string[];
        } else {
          console.log(`  ⚠️  Removing duplicate path: ${key}`);
          changesCount++;
        }
      });
      
      // Update or remove paths
      if (Object.keys(uniquePaths).length > 0) {
        config.compilerOptions.paths = uniquePaths;
        console.log(`  ✅ Kept unique paths: ${Object.keys(uniquePaths).join(', ')}`);
      } else {
        delete config.compilerOptions.paths;
        console.log(`  ✅ Removed all duplicate paths (all defined in root)`);
      }
      
      // Write back the cleaned config
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    } else {
      console.log(`  ℹ️  No paths defined`);
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${configPath}:`, error);
  }
  
  console.log('');
});

console.log(`✨ Path unification complete! Removed ${changesCount} duplicate definitions.\n`);
console.log('📝 Next steps:');
console.log('  1. Review the changes with: git diff */tsconfig.json');
console.log('  2. Run type checking: pnpm typecheck');
console.log('  3. Commit if everything looks good!');