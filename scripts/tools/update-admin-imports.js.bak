import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Define mapping of old imports to new domain-driven paths
const importMapping = {
  // Main Admin routes
  './admin-routes': './src/domains/admin/admin.routes',
  '../admin-routes': '../src/domains/admin/admin.routes',
  '../../admin-routes': '../../src/domains/admin/admin.routes',
  
  // Users domain
  './routes/admin-routes': './src/domains/admin/sub-domains/users/users.routes',
  '../routes/admin-routes': '../src/domains/admin/sub-domains/users/users.routes',
  
  // User Groups domain
  './admin-user-groups': './src/domains/admin/sub-domains/user-groups/user-groups.routes',
  '../admin-user-groups': '../src/domains/admin/sub-domains/user-groups/user-groups.routes',
  '../../admin-user-groups': '../../src/domains/admin/sub-domains/user-groups/user-groups.routes',
  
  // Reports domain
  './admin-reports': './src/domains/admin/sub-domains/reports/reports.routes',
  '../admin-reports': '../src/domains/admin/sub-domains/reports/reports.routes',
  '../../admin-reports': '../../src/domains/admin/sub-domains/reports/reports.routes',
  
  // Treasury domain
  './admin-treasury': './src/domains/admin/sub-domains/treasury/treasury.routes',
  '../admin-treasury': '../src/domains/admin/sub-domains/treasury/treasury.routes',
  '../../admin-treasury': '../../src/domains/admin/sub-domains/treasury/treasury.routes',
  './admin-wallet-routes': './src/domains/admin/sub-domains/treasury/treasury.routes',
  '../admin-wallet-routes': '../src/domains/admin/sub-domains/treasury/treasury.routes',
  '../../admin-wallet-routes': '../../src/domains/admin/sub-domains/treasury/treasury.routes',
  
  // Analytics domain
  './routes/admin-stats-routes': './src/domains/admin/sub-domains/analytics/analytics.routes',
  '../routes/admin-stats-routes': '../src/domains/admin/sub-domains/analytics/analytics.routes',
  '../../routes/admin-stats-routes': '../../src/domains/admin/sub-domains/analytics/analytics.routes',
  
  // Settings domain
  './routes/admin-settings-routes': './src/domains/admin/sub-domains/settings/settings.routes',
  '../routes/admin-settings-routes': '../src/domains/admin/sub-domains/settings/settings.routes',
  '../../routes/admin-settings-routes': '../../src/domains/admin/sub-domains/settings/settings.routes',
  
  // XP domain
  './admin-xp-routes': './src/domains/admin/sub-domains/xp/xp.routes',
  '../admin-xp-routes': '../src/domains/admin/sub-domains/xp/xp.routes',
  '../../admin-xp-routes': '../../src/domains/admin/sub-domains/xp/xp.routes',
  './routes/admin-xp-routes': './src/domains/admin/sub-domains/xp/xp.routes',
  '../routes/admin-xp-routes': '../src/domains/admin/sub-domains/xp/xp.routes',
  '../../routes/admin-xp-routes': '../../src/domains/admin/sub-domains/xp/xp.routes',
  './routes/admin-badges-routes': './src/domains/admin/sub-domains/xp/badges.routes',
  '../routes/admin-badges-routes': '../src/domains/admin/sub-domains/xp/badges.routes',
  '../../routes/admin-badges-routes': '../../src/domains/admin/sub-domains/xp/badges.routes',
  './routes/admin-levels-routes': './src/domains/admin/sub-domains/xp/levels.routes',
  '../routes/admin-levels-routes': '../src/domains/admin/sub-domains/xp/levels.routes',
  '../../routes/admin-levels-routes': '../../src/domains/admin/sub-domains/xp/levels.routes',
  
  // Rules domain
  './admin-rules-routes': './src/domains/admin/sub-domains/rules/rules.routes',
  '../admin-rules-routes': '../src/domains/admin/sub-domains/rules/rules.routes',
  '../../admin-rules-routes': '../../src/domains/admin/sub-domains/rules/rules.routes',
  
  // Economy domain
  './routes/admin-economy-routes': './src/domains/admin/sub-domains/economy/economy.routes',
  '../routes/admin-economy-routes': '../src/domains/admin/sub-domains/economy/economy.routes',
  '../../routes/admin-economy-routes': '../../src/domains/admin/sub-domains/economy/economy.routes',
};

// Import regex patterns to match
const importRegexPatterns = [
  // import X from 'path';
  /import\s+([A-Za-z0-9_{},$\s]+)\s+from\s+['"]([^'"]+)['"]/g,
  // const X = require('path');
  /(?:const|let|var)\s+([A-Za-z0-9_{},$\s]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
];

// Directories to search
const dirToSearch = [
  './server',
  './client/src'
];

// File extensions to check
const extensionsToCheck = ['.ts', '.tsx', '.js', '.jsx'];

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get list of all files to check
function getFilesInDirectory(dir) {
  const files = [];
  
  function traverseDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and archive directories
        if (entry.name !== 'node_modules' && entry.name !== 'archive' && !entry.name.startsWith('.')) {
          traverseDir(fullPath);
        }
      } else if (entry.isFile() && extensionsToCheck.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }
  
  traverseDir(path.resolve(dir));
  return files;
}

// Process files to update imports
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Check for each pattern
    for (const regex of importRegexPatterns) {
      content = content.replace(regex, (match, importName, importPath) => {
        // Check if this import path is in our mapping
        if (importMapping[importPath]) {
          hasChanges = true;
          const newPath = importMapping[importPath];
          
          if (match.includes('require')) {
            return `${importName.split('=')[0]}= require('${newPath}')`;
          } else {
            return `import ${importName} from '${newPath}'`;
          }
        }
        return match;
      });
    }
    
    // If changes were made, write the file back
    if (hasChanges) {
      console.log(`Updating imports in ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Scanning for files to update...');
  let totalUpdated = 0;
  
  for (const dir of dirToSearch) {
    const files = getFilesInDirectory(dir);
    console.log(`Found ${files.length} files to check in ${dir}`);
    
    for (const file of files) {
      const updated = processFile(file);
      if (updated) {
        totalUpdated++;
      }
    }
  }
  
  console.log(`\nUpdate complete! ${totalUpdated} files were updated.`);
  
  if (totalUpdated > 0) {
    console.log('\nTo verify the changes, you can use:');
    console.log('git diff');
  }
}

// Run the script
main(); 