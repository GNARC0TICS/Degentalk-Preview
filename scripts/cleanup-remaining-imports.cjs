const glob = require('glob');
const fs = require('fs');

// Files to update based on the verification report (excluding dist/)
const filesToUpdate = [
  'test/ccpayment-webhook/webhook.test.ts',
  'server/src/domains/admin/shared/index.ts',
  'scripts/migration/fix-admin-missing-modules.ts',
  'scripts/dev/test-deposit-flow.ts',
  'scripts/db/seed-default-levels.ts',
  'scripts/codemods/logger-migration.ts',
  'scripts/codemods/id-to-entityid.ts',
  'scripts/codemods/consolidate-auth-guards.ts',
  'lib/forum/getForumRules.ts',
  'db/types/brand.types.ts',
  'scripts/apply-performance-indexes.ts',
  'scripts/testing/test-repository-implementation.ts',
  'scripts/seed/sync/config-enforcer.ts',
  'scripts/seed/engines/temporal-simulator.ts',
  'scripts/seed/engines/gamification-simulator.ts',
  'scripts/seed/engines/cosmetics-effects.ts',
  'scripts/seed/engines/admin-flow-simulator.ts',
  'scripts/seed/engines/abuse-simulator.ts'
];

const mappings = {
  // Client mappings
  '@/': '@app/',
  
  // Server mappings
  '@server/': '@api/',
  '@server-core/': '@core/',
  '@server-utils/': '@api/utils/',
  '@server-middleware/': '@api/middleware/',
  '@middleware/': '@api/middleware/',
  '@domains/': '@api/domains/',
  '@lib/': '@shared/lib/',
  '@server-lib/': '@shared/lib/'
};

let totalFixed = 0;

filesToUpdate.forEach(file => {
  try {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;
    
    Object.entries(mappings).forEach(([oldPath, newPath]) => {
      const regex = new RegExp(`from\\s+['"]${oldPath.replace('/', '\\/')}`, 'g');
      const newContent = content.replace(regex, `from '${newPath}`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(file, content);
      totalFixed++;
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Fixed imports in ${totalFixed} files`);