#!/usr/bin/env node

/**
 * Universal Import Fixer
 * Converts all @alias imports to relative paths across the entire codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define import mappings
const IMPORT_MAPPINGS = {
  // Scripts workspace mappings
  'scripts/**/*.ts': {
    '@db': (from) => {
      const depth = from.split('/').length - 2; // scripts/... 
      return '../'.repeat(depth) + 'db';
    },
    '@schema': (from) => {
      const depth = from.split('/').length - 2;
      return '../'.repeat(depth) + 'db/schema';
    },
    '@core/logger': (from) => {
      const depth = from.split('/').length - 2;
      return '../'.repeat(depth) + 'server/src/core/logger';
    },
    '@core/services': (from) => {
      const depth = from.split('/').length - 2;
      return '../'.repeat(depth) + 'server/src/core/services';
    },
    '@domains': (from) => {
      const depth = from.split('/').length - 2;
      return '../'.repeat(depth) + 'server/src/domains';
    },
    '@shared': (from) => {
      const depth = from.split('/').length - 2;
      return '../'.repeat(depth) + 'shared';
    }
  },
  
  // Server workspace mappings
  'server/src/**/*.ts': {
    '@domains': (from) => {
      // Calculate relative path from current file to domains
      const fromDir = path.dirname(from);
      const toDir = 'server/src/domains';
      return calculateRelativePath(fromDir, toDir);
    },
    '@config': (from) => {
      const fromDir = path.dirname(from);
      const toDir = 'config';
      return calculateRelativePath(fromDir, toDir);
    }
  }
};

function calculateRelativePath(from, to) {
  const fromParts = from.split('/');
  const toParts = to.split('/');
  
  // Find common prefix
  let commonLength = 0;
  for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
    if (fromParts[i] === toParts[i]) {
      commonLength++;
    } else {
      break;
    }
  }
  
  // Build relative path
  const upCount = fromParts.length - commonLength;
  const downPath = toParts.slice(commonLength).join('/');
  
  if (upCount === 0 && downPath === '') {
    return '.';
  }
  
  const relativePath = '../'.repeat(upCount) + downPath;
  return relativePath.startsWith('../') ? relativePath : './' + relativePath;
}

function fixImportsInFile(filePath, mappings) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match all import statements
  const importRegex = /^import\s+(?:type\s+)?(?:\{[^}]+\}|[^;]+)\s+from\s+['"]([^'"]+)['"]/gm;
  
  content = content.replace(importRegex, (match, importPath) => {
    for (const [alias, replacer] of Object.entries(mappings)) {
      if (importPath.startsWith(alias)) {
        const newPath = typeof replacer === 'function' 
          ? replacer(filePath) + importPath.slice(alias.length)
          : replacer + importPath.slice(alias.length);
        
        console.log(`  ${importPath} → ${newPath}`);
        modified = true;
        return match.replace(importPath, newPath);
      }
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in ${filePath}\n`);
  }
  
  return modified;
}

function main() {
  console.log('🔧 Starting universal import fix...\n');
  
  let totalFixed = 0;
  
  for (const [pattern, mappings] of Object.entries(IMPORT_MAPPINGS)) {
    const files = glob.sync(pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
    });
    
    console.log(`\n📁 Processing ${files.length} files matching ${pattern}`);
    
    for (const file of files) {
      if (fixImportsInFile(file, mappings)) {
        totalFixed++;
      }
    }
  }
  
  console.log(`\n✨ Fixed imports in ${totalFixed} files!`);
  
  // Also fix specific known problematic files
  const problemFiles = [
    'scripts/db/seed-users.ts',
    'scripts/db/reset-and-seed.ts',
    'scripts/db/seed-achievements.ts',
    'scripts/db/seed-badges.ts',
    'scripts/db/seed-treasury.ts',
    'scripts/db/seed-vaults.ts',
    'scripts/db/seed-default-levels.ts',
    'scripts/db/seed-economy-settings.ts',
    'scripts/db/seed-shop.ts',
    'scripts/db/seed-chat.ts',
    'scripts/db/seed-ui-config-quotes.ts',
    'scripts/db/seed-promotion-pricing.ts'
  ];
  
  console.log('\n🎯 Checking specific problem files...');
  for (const file of problemFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('@db') || content.includes('@schema')) {
        console.log(`⚠️  ${file} still has @db or @schema imports!`);
      }
    }
  }
}

main();