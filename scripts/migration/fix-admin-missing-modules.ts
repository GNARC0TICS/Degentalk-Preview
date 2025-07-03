#!/usr/bin/env tsx
/**
 * Admin Missing Modules Fixer
 * 
 * Fixes missing module imports in admin panel
 */

import { readFile, writeFile } from 'fs/promises';
import chalk from 'chalk';

interface ModuleFix {
  file: string;
  fixes: Array<{
    oldImport: string;
    newImport: string;
    description: string;
  }>;
}

const MODULE_FIXES: ModuleFix[] = [
  {
    file: 'client/src/pages/admin/activity/index.tsx',
    fixes: [
      {
        oldImport: "import { useAuth } from '@/hooks/useAuth';",
        newImport: "// TODO: Replace with actual auth hook when available\n// import { useAuth } from '@/hooks/use-auth';",
        description: 'Comment out missing useAuth import'
      }
    ]
  },
  {
    file: 'client/src/pages/admin/activity/user/[userId].tsx',
    fixes: [
      {
        oldImport: "import { EventLogFilters } from '@/types/admin';",
        newImport: "import type { EventLogFilters } from '@/types/admin';",
        description: 'Make EventLogFilters a type-only import'
      },
      {
        oldImport: "import { useAuth } from '@/hooks/useAuth';",
        newImport: "// TODO: Replace with actual auth hook when available\n// import { useAuth } from '@/hooks/use-auth';",
        description: 'Comment out missing useAuth import'
      }
    ]
  },
  {
    file: 'client/src/pages/admin/features/index.tsx',
    fixes: [
      {
        oldImport: "import { useQuery, useMutation } from 'react-query';",
        newImport: "import { useQuery, useMutation } from '@tanstack/react-query';",
        description: 'Update react-query import to tanstack'
      }
    ]
  },
  {
    file: 'client/src/pages/admin/missions/index.tsx',
    fixes: [
      {
        oldImport: "import { useQuery, useMutation } from 'react-query';",
        newImport: "import { useQuery, useMutation } from '@tanstack/react-query';",
        description: 'Update react-query import to tanstack'
      }
    ]
  },
  {
    file: 'client/src/pages/admin/shoutbox.tsx',
    fixes: [
      {
        oldImport: "import toast from 'react-hot-toast';",
        newImport: "import { useToast } from '@/hooks/use-toast';",
        description: 'Replace react-hot-toast with custom toast hook'
      }
    ]
  }
];

async function fixMissingModules() {
  console.log(chalk.cyan('🔧 ADMIN MISSING MODULES FIXER\n'));
  
  let totalFiles = 0;
  let totalFixes = 0;
  
  for (const moduleFix of MODULE_FIXES) {
    try {
      const filePath = `/Users/gnarcotic/Degentalk/${moduleFix.file}`;
      const content = await readFile(filePath, 'utf-8');
      let updatedContent = content;
      let fileFixed = false;
      
      for (const fix of moduleFix.fixes) {
        if (updatedContent.includes(fix.oldImport)) {
          updatedContent = updatedContent.replace(fix.oldImport, fix.newImport);
          console.log(chalk.green(`✓ ${fix.description} in ${moduleFix.file}`));
          totalFixes++;
          fileFixed = true;
        }
      }
      
      if (fileFixed) {
        await writeFile(filePath, updatedContent);
        totalFiles++;
      }
      
    } catch (error) {
      console.log(chalk.yellow(`⚠ Could not process ${moduleFix.file}: ${error.message}`));
    }
  }
  
  if (totalFiles === 0) {
    console.log(chalk.green('✅ No missing module issues found!'));
  } else {
    console.log(chalk.green(`\n🎉 Summary: Applied ${totalFixes} fixes across ${totalFiles} files`));
    
    console.log(chalk.blue('\n📋 Next steps:'));
    console.log('   1. Review commented imports and implement proper replacements');
    console.log('   2. Run TypeScript compiler to verify fixes');
    console.log('   3. Test affected admin functionality');
  }
}

fixMissingModules().catch(console.error);