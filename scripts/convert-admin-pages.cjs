#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Map of page files to their module IDs from admin.config.ts
const pageToModuleMap = {
  'shop/index.tsx': 'shop',
  'shop/categories.tsx': 'shop-categories',
  'reports/index.tsx': 'reports',
  'stats/index.tsx': 'analytics',
  'system-analytics.tsx': 'system-analytics',
  'avatar-frames.tsx': 'cosmetics',
  'stickers.tsx': 'stickers',
  'ui/animations.tsx': 'animations',
  'emojis.tsx': 'emojis',
  'feature-flags.tsx': 'feature-flags',
  'social-config.tsx': 'settings',
  'announcements/index.tsx': 'announcements',
  'forum-structure.tsx': 'forum',
  'dgt-packages.tsx': 'dgt-packages',
  'wallets/index.tsx': 'wallets',
  'roles.tsx': 'roles',
  'index.tsx': 'dashboard',
};

const adminPagesDir = '/Users/gnarcotic/Degentalk/client/src/pages/admin';

function getModuleIcon(moduleId) {
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
  return iconMap[moduleId] || 'Settings';
}

function getModuleName(moduleId) {
  const nameMap = {
    'shop': 'Shop Management',
    'shop-categories': 'Shop Categories',
    'reports': 'Reports',
    'analytics': 'Analytics',
    'system-analytics': 'System Analytics',
    'cosmetics': 'Avatar Frames',
    'stickers': 'Stickers',
    'animations': 'Animations',
    'emojis': 'Emojis',
    'feature-flags': 'Feature Flags',
    'settings': 'Settings',
    'announcements': 'Announcements',
    'forum': 'Forum Structure',
    'dgt-packages': 'DGT Packages',
    'wallets': 'Wallet Management',
    'roles': 'Roles',
    'dashboard': 'Dashboard',
  };
  return nameMap[moduleId] || 'Admin Module';
}

function convertAdminPage(filePath, moduleId) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already converted (contains ProtectedAdminRoute)
    if (content.includes('ProtectedAdminRoute')) {
      console.log(`⏭️  Skipping ${path.basename(filePath)} - already converted`);
      return;
    }

    // Add imports
    const imports = [
      "import ProtectedAdminRoute from '@/components/admin/protected-admin-route';",
      "import { useAdminModule } from '@/hooks/use-admin-modules';",
      "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';"
    ];

    // Find the last import and add our imports
    const lastImportMatch = content.match(/^import.*$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
      
      content = 
        content.slice(0, lastImportIndex) + 
        '\n' + imports.join('\n') + 
        content.slice(lastImportIndex);
    }

    // Find the main export function
    const exportMatch = content.match(/export default function (\w+)/);
    if (!exportMatch) {
      console.log(`❌ Could not find export function in ${path.basename(filePath)}`);
      return;
    }

    const originalFunctionName = exportMatch[1];
    const moduleContentName = originalFunctionName.replace(/Page$/, '') + 'ModuleContent';
    const icon = getModuleIcon(moduleId);
    const moduleName = getModuleName(moduleId);

    // Replace the function name and add module logic
    content = content.replace(
      `export default function ${originalFunctionName}()`,
      `// ${moduleName} Module Component (Protected)
function ${moduleContentName}()`
    );

    // Add module logic at the beginning of the function
    const functionStart = content.indexOf(`function ${moduleContentName}()`) + `function ${moduleContentName}()`.length;
    const functionBody = content.slice(functionStart);
    const openBraceIndex = functionBody.indexOf('{') + 1;
    
    const moduleLogic = `
	const { module, isEnabled } = useAdminModule('${moduleId}');

	// Show module disabled message if not enabled
	if (!isEnabled) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="p-8 text-center">
						<${icon} className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">${moduleName} Module Disabled</h3>
						<p className="text-muted-foreground">
							The ${moduleName} module has been disabled by an administrator.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}
`;

    content = 
      content.slice(0, functionStart + openBraceIndex) + 
      moduleLogic + 
      content.slice(functionStart + openBraceIndex);

    // Add the wrapper component at the end
    const wrapperComponent = `
// Main exported component with protection wrapper
export default function ${originalFunctionName}() {
	return (
		<ProtectedAdminRoute moduleId="${moduleId}">
			<${moduleContentName} />
		</ProtectedAdminRoute>
	);
}`;

    content = content + wrapperComponent;

    // Add the icon import if not present
    const iconsImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/);
    if (iconsImportMatch && !iconsImportMatch[1].includes(icon)) {
      const currentIcons = iconsImportMatch[1];
      const newIconsImport = `import { ${currentIcons.trim()}, ${icon} } from 'lucide-react';`;
      content = content.replace(iconsImportMatch[0], newIconsImport);
    }

    // Write the converted file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Converted ${path.basename(filePath)} -> ${moduleId} module`);
    
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(filePath)}:`, error.message);
  }
}

function main() {
  console.log('🔄 Converting admin pages to modular system...\n');
  
  for (const [pageFile, moduleId] of Object.entries(pageToModuleMap)) {
    const filePath = path.join(adminPagesDir, pageFile);
    
    if (fs.existsSync(filePath)) {
      convertAdminPage(filePath, moduleId);
    } else {
      console.log(`⚠️  File not found: ${pageFile}`);
    }
  }
  
  console.log('\n🎉 Conversion complete!');
}

if (require.main === module) {
  main();
}

module.exports = { convertAdminPage, pageToModuleMap };