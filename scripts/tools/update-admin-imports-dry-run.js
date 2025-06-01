import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Process files to identify imports without making changes
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundImports = [];
    
    // Check for each pattern
    for (const regex of importRegexPatterns) {
      let match;
      // Use a new regex instance each time to reset lastIndex
      const patternWithGlobal = new RegExp(regex.source, 'g');
      
      while ((match = patternWithGlobal.exec(content)) !== null) {
        const [fullMatch, importName, importPath] = match;
        
        // Check if this import path is in our mapping
        if (importMapping[importPath]) {
          foundImports.push({
            file: filePath,
            importStatement: fullMatch.trim(),
            oldPath: importPath,
            newPath: importMapping[importPath],
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    }
    
    return foundImports;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [];
  }
}

// Main function
function main() {
  console.log('Scanning for deprecated admin imports (DRY RUN - no changes will be made)...');
  const allImports = [];
  
  for (const dir of dirToSearch) {
    const files = getFilesInDirectory(dir);
    console.log(`Found ${files.length} files to check in ${dir}`);
    
    for (const file of files) {
      const imports = processFile(file);
      if (imports.length > 0) {
        allImports.push(...imports);
      }
    }
  }
  
  console.log(`\nFound ${allImports.length} deprecated imports across ${new Set(allImports.map(i => i.file)).size} files\n`);
  
  if (allImports.length > 0) {
    console.log('=== Imports that would be updated ===');
    allImports.forEach(imp => {
      console.log(`\nFile: ${imp.file} (line ${imp.line})`);
      console.log(`Old: ${imp.importStatement}`);
      
      let newStatement;
      if (imp.importStatement.includes('require')) {
        const importNamePart = imp.importStatement.split('=')[0];
        newStatement = `${importNamePart}= require('${imp.newPath}')`;
      } else {
        const importNamePart = imp.importStatement.split(' from ')[0];
        newStatement = `${importNamePart} from '${imp.newPath}'`;
      }
      
      console.log(`New: ${newStatement}`);
    });
    
    console.log('\n=== Summary of changes ===');
    const filesByPath = {};
    
    allImports.forEach(imp => {
      if (!filesByPath[imp.file]) {
        filesByPath[imp.file] = [];
      }
      filesByPath[imp.file].push(imp);
    });
    
    Object.keys(filesByPath).forEach(file => {
      console.log(`${file}: ${filesByPath[file].length} imports`);
    });
    
    console.log('\nTo apply these changes, run the ./scripts/update-admin-imports.js script');
  } else {
    console.log('No deprecated imports found.');
  }
}

// Run the script
main(); 