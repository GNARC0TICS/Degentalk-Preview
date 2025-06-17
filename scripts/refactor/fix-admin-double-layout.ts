import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

async function fixAdminDoubleLayout() {
  console.log('🔧 Fixing double AdminLayout issue in admin pages...\n');

  // These pages are NOT wrapped in App.tsx, so they should keep AdminLayout
  const excludedPages = [
    'client/src/pages/admin/config/tags.tsx',
    'client/src/pages/admin/config/xp.tsx',
    'client/src/pages/admin/config/zones.tsx'
  ];

  // Find all admin pages
  const adminPages = await glob('client/src/pages/admin/**/*.tsx');
  
  let fixedCount = 0;
  
  for (const filePath of adminPages) {
    // Skip excluded pages
    if (excludedPages.some(excluded => filePath.endsWith(excluded.replace('client/src/pages/admin/', '')))) {
      console.log(`⏭️  Skipping ${filePath} (not wrapped in App.tsx)`);
      continue;
    }

    // Skip the admin-layout.tsx file itself
    if (filePath.endsWith('admin-layout.tsx')) {
      continue;
    }

    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if file imports AdminLayout
    if (!content.includes('import AdminLayout from') && !content.includes('import { AdminLayout }')) {
      continue;
    }

    console.log(`📝 Processing ${filePath}...`);

    // Remove AdminLayout import
    let newContent = content
      .replace(/import AdminLayout from ['"].*admin-layout.*['"];?\n?/g, '')
      .replace(/import { AdminLayout } from ['"].*admin-layout.*['"];?\n?/g, '');

    // Remove AdminLayout wrapper from JSX
    // Handle different patterns of AdminLayout usage
    
    // Pattern 1: <AdminLayout>...</AdminLayout>
    newContent = newContent.replace(
      /<AdminLayout[^>]*>\s*([\s\S]*?)<\/AdminLayout>/g,
      (match, innerContent) => {
        // Extract just the inner content
        return innerContent.trim();
      }
    );

    // Pattern 2: return ( <AdminLayout> ... </AdminLayout> )
    newContent = newContent.replace(
      /return\s*\(\s*<AdminLayout[^>]*>\s*([\s\S]*?)<\/AdminLayout>\s*\)/g,
      (match, innerContent) => {
        return `return (\n${innerContent.trim()}\n)`;
      }
    );

    // Pattern 3: export default function() { return <AdminLayout>...</AdminLayout> }
    newContent = newContent.replace(
      /return\s+<AdminLayout[^>]*>\s*([\s\S]*?)<\/AdminLayout>;?/g,
      (match, innerContent) => {
        return `return ${innerContent.trim()};`;
      }
    );

    // Clean up any double newlines
    newContent = newContent.replace(/\n\n\n+/g, '\n\n');

    if (newContent !== content) {
      await fs.writeFile(filePath, newContent);
      console.log(`✅ Fixed ${filePath}`);
      fixedCount++;
    }
  }

  console.log(`\n✨ Fixed ${fixedCount} files with double AdminLayout issue`);
}

// Run the script
fixAdminDoubleLayout().catch(console.error); 