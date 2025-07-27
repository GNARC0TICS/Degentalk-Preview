#!/usr/bin/env tsx
/**
 * Validation script for theme system migration
 * Checks current state and provides recommendations
 */

import { promises as fs } from 'fs';
import { resolve } from 'path';

async function checkFile(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function validateThemeMigration() {
  console.log('🔍 Theme System Migration Validation\n');
  
  const checks = {
    newFiles: {
      'Theme types': await checkFile('./shared/types/theme.types.ts'),
      'Theme service': await checkFile('./server/src/domains/themes/services/theme.service.ts'),
      'Theme routes': await checkFile('./server/src/routes/api/themes.routes.ts'),
      'Theme hook': await checkFile('./client/src/hooks/useTheme.ts'),
      'Migration script': await checkFile('./server/src/domains/themes/migrations/consolidate-themes.ts'),
    },
    oldFiles: {
      'ForumThemes config': await checkFile('./shared/config/forumThemes.config.ts'),
    }
  };
  
  console.log('✅ New Theme System Files:');
  Object.entries(checks.newFiles).forEach(([name, exists]) => {
    console.log(`  ${exists ? '✓' : '✗'} ${name}`);
  });
  
  console.log('\n⚠️  Old Theme System Files:');
  Object.entries(checks.oldFiles).forEach(([name, exists]) => {
    console.log(`  ${exists ? '⚠️  Still exists' : '✓ Removed'} - ${name}`);
  });
  
  // Check for remaining imports
  console.log('\n📊 Import Analysis:');
  try {
    const { execSync } = await import('child_process');
    const imports = execSync('grep -r "forumThemes.config" --include="*.ts" --include="*.tsx" . | grep -v node_modules | wc -l', { encoding: 'utf8' });
    console.log(`  Files still importing old config: ${imports.trim()}`);
  } catch (e) {
    console.log('  Could not check imports');
  }
  
  console.log('\n📋 Recommendations:');
  if (checks.oldFiles['ForumThemes config']) {
    console.log('  1. Run migration script to populate database with themes');
    console.log('  2. Update remaining imports to use new theme system');
    console.log('  3. Remove old forumThemes.config.ts file');
  } else {
    console.log('  ✓ Migration appears complete!');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('  1. Test theme loading: curl http://localhost:5001/api/themes/context');
  console.log('  2. Verify CSS variables are applied in browser');
  console.log('  3. Check admin panel can manage themes');
}

validateThemeMigration().catch(console.error);