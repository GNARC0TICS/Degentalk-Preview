#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const adminPagesDir = '/Users/gnarcotic/Degentalk/client/src/pages/admin';

// Icon mapping for imports
const iconImports = {
  'ShoppingBag': 'ShoppingBag',
  'FolderTree': 'FolderTree', 
  'Flag': 'Flag',
  'BarChart3': 'BarChart3',
  'Activity': 'Activity',
  'Sparkles': 'Sparkles',
  'Sticker': 'Sticker',
  'Zap': 'Zap',
  'Smile': 'Smile',
  'ToggleLeft': 'ToggleLeft',
  'Settings': 'Settings',
  'Megaphone': 'Megaphone',
  'MessageSquare': 'MessageSquare',
  'Package': 'Package',
  'Wallet': 'Wallet',
  'Shield': 'Shield',
  'LayoutDashboard': 'LayoutDashboard',
};

function fixImportStatements(content, filePath) {
  try {
    // Fix broken import statements that got mangled
    content = content.replace(/import\s*{\s*import\s+/g, 'import ');
    content = content.replace(/;\s*([^i])/g, ';\nimport $1');
    content = content.replace(/import\s+([^{].*?)\s*}\s*from/g, 'import { $1 } from');
    
    // Fix specific patterns from the conversion script
    content = content.replace(/import\s*{\s*([^}]*)\s*import\s+([^}]*)\s*}\s*from\s*(['"][^'"]*['"])/g, 
      'import { $1 } from $3;\nimport $2');
    
    // Fix mangled import lines
    const lines = content.split('\n');
    const fixedLines = [];
    let currentImport = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for broken import statements
      if (line.includes('import') && !line.includes('from') && !line.includes(';')) {
        currentImport = line;
        continue;
      }
      
      if (currentImport && line.includes('from')) {
        // Reconstruct the import
        fixedLines.push(currentImport + ' ' + line);
        currentImport = '';
        continue;
      }
      
      if (currentImport && line.trim() && !line.includes('//')) {
        // This is likely part of a broken import
        currentImport += ' ' + line.trim();
        continue;
      }
      
      if (currentImport) {
        // End the broken import and start fresh
        fixedLines.push(currentImport);
        currentImport = '';
      }
      
      fixedLines.push(line);
    }
    
    content = fixedLines.join('\n');
    
    // Find the module ID from the file path
    const fileName = path.basename(filePath, '.tsx');
    const moduleId = getModuleIdFromFilePath(filePath);
    const requiredIcon = getIconForModule(moduleId);
    
    if (requiredIcon) {
      // Check if the icon is already imported
      const hasIconImport = content.includes(`import { ${requiredIcon} }`) || 
                           content.includes(`${requiredIcon},`) ||
                           content.includes(`, ${requiredIcon}`);
      
      if (!hasIconImport) {
        // Add the icon import
        const lucideImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/);
        if (lucideImportMatch) {
          const currentIcons = lucideImportMatch[1];
          const newIconsImport = `import { ${currentIcons.trim()}, ${requiredIcon} } from 'lucide-react';`;
          content = content.replace(lucideImportMatch[0], newIconsImport);
        } else {
          // Add new lucide-react import
          const lastImportMatch = content.match(/^import.*$/gm);
          if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
            content = content.slice(0, lastImportIndex) + 
                     `\nimport { ${requiredIcon} } from 'lucide-react';` + 
                     content.slice(lastImportIndex);
          }
        }
      }
    }
    
    return content;
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error.message);
    return content;
  }
}

function getModuleIdFromFilePath(filePath) {
  if (filePath.includes('animations')) return 'animations';
  if (filePath.includes('stickers')) return 'stickers';
  if (filePath.includes('emojis')) return 'emojis';
  if (filePath.includes('avatar-frames')) return 'cosmetics';
  if (filePath.includes('shop')) return 'shop';
  if (filePath.includes('reports')) return 'reports';
  if (filePath.includes('stats')) return 'analytics';
  if (filePath.includes('system-analytics')) return 'system-analytics';
  if (filePath.includes('feature-flags')) return 'feature-flags';
  if (filePath.includes('social-config')) return 'settings';
  if (filePath.includes('announcements')) return 'announcements';
  if (filePath.includes('forum-structure')) return 'forum';
  if (filePath.includes('dgt-packages')) return 'dgt-packages';
  if (filePath.includes('wallets')) return 'wallets';
  if (filePath.includes('roles')) return 'roles';
  if (filePath.includes('index.tsx') && filePath.includes('/admin/')) return 'dashboard';
  return null;
}

function getIconForModule(moduleId) {
  const iconMap = {
    'shop': 'ShoppingBag',
    'shop-categories': 'FolderTree',
    'reports': 'Flag',
    'analytics': 'BarChart3',
    'system-analytics': 'Activity',
    'cosmetics': 'Sparkles',
    'stickers': 'Sticker',
    'animations': 'Zap',
    'emojis': 'Smile',
    'feature-flags': 'ToggleLeft',
    'settings': 'Settings',
    'announcements': 'Megaphone',
    'forum': 'MessageSquare',
    'dgt-packages': 'Package',
    'wallets': 'Wallet',
    'roles': 'Shield',
    'dashboard': 'LayoutDashboard',
  };
  return iconMap[moduleId];
}

function findAndFixFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      findAndFixFiles(filePath);
    } else if (file.name.endsWith('.tsx') && file.name !== 'admin-layout.tsx') {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already has ProtectedAdminRoute properly imported
        if (!content.includes('ProtectedAdminRoute') || 
            !content.includes('import ProtectedAdminRoute')) {
          continue;
        }
        
        // Check for syntax errors in imports
        if (content.includes('import {') && content.includes('import ')) {
          const lines = content.split('\n').slice(0, 20); // Check first 20 lines
          const hasImportError = lines.some(line => 
            line.includes('import {') && line.includes('import ') && 
            !line.includes('from')
          );
          
          if (hasImportError) {
            console.log(`🔧 Fixing import errors in ${path.relative(adminPagesDir, filePath)}`);
            const fixedContent = fixImportStatements(content, filePath);
            fs.writeFileSync(filePath, fixedContent, 'utf8');
            console.log(`✅ Fixed ${path.basename(filePath)}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
  }
}

function main() {
  console.log('🔧 Fixing conversion import errors...\n');
  findAndFixFiles(adminPagesDir);
  console.log('\n🎉 Import fixes complete!');
}

if (require.main === module) {
  main();
}

module.exports = { fixImportStatements };