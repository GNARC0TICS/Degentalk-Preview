#!/usr/bin/env tsx
/**
 * Update auth domain middleware imports to use new Lucia auth middleware
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

const IMPORT_MAPPINGS = {
  'isAuthenticated': 'luciaAuth.require',
  'isAdmin': 'luciaAuth.requireAdmin',
  'isModerator': 'luciaAuth.requireModerator',
  'isAdminOrModerator': 'luciaAuth.requireAdminOrModerator',
  'isAuthenticatedOptional': 'luciaAuth.optional',
  'requireAuth': 'luciaAuth.require',
  'requireAdmin': 'luciaAuth.requireAdmin',
  'requireModerator': 'luciaAuth.requireModerator',
};

async function updateFile(filePath: string): Promise<boolean> {
  try {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;

    // Check if file imports from auth domain middleware
    if (!content.includes('@domains/auth/middleware/auth.middleware')) {
      return false;
    }

    console.log(`Updating ${filePath}...`);

    // Match the import statement
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@domains\/auth\/middleware\/auth\.middleware['"]/g;
    
    const importMatches = [...content.matchAll(importRegex)];
    
    if (importMatches.length === 0) {
      return false;
    }

    // Extract imported items
    const importedItems: string[] = [];
    importMatches.forEach(match => {
      const imports = match[1]
        .split(',')
        .map(item => {
          // Handle "as" aliases
          const parts = item.trim().split(/\s+as\s+/);
          return parts[parts.length - 1].trim();
        })
        .filter(Boolean);
      importedItems.push(...imports);
    });

    // Replace the import statement
    content = content.replace(importRegex, "import { luciaAuth } from '@middleware/lucia-auth.middleware'");
    
    // Add const declarations after the import
    const constDeclarations = importedItems
      .map(item => {
        const mapping = IMPORT_MAPPINGS[item as keyof typeof IMPORT_MAPPINGS];
        if (mapping) {
          return `const ${item} = ${mapping};`;
        }
        console.warn(`  ⚠️  No mapping found for: ${item}`);
        return `// TODO: Map ${item} to appropriate Lucia method`;
      })
      .join('\n');

    // Find where to insert the const declarations (after the lucia import)
    const luciaImportIndex = content.indexOf("import { luciaAuth } from '@middleware/lucia-auth.middleware'");
    if (luciaImportIndex !== -1) {
      const lineEnd = content.indexOf('\n', luciaImportIndex);
      content = content.slice(0, lineEnd + 1) + constDeclarations + '\n' + content.slice(lineEnd + 1);
      modified = true;
    }

    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ Updated ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Finding files with auth domain imports...\n');

  // Find all TypeScript files in server
  const files = await glob('server/src/**/*.ts', {
    cwd: '/home/developer/Degentalk-BETA',
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.test.ts',
      '**/*.spec.ts'
    ]
  });

  console.log(`Found ${files.length} TypeScript files to check\n`);

  let updatedCount = 0;
  for (const file of files) {
    const updated = await updateFile(file);
    if (updated) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Updated ${updatedCount} files`);

  if (updatedCount > 0) {
    console.log('\n⚠️  Next steps:');
    console.log('1. Run pnpm typecheck to verify the changes');
    console.log('2. Start the server with pnpm dev:server');
    console.log('3. Test auth endpoints to ensure everything works');
  }
}

main().catch(console.error);