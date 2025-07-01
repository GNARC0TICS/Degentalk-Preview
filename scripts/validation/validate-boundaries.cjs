#!/usr/bin/env node

/**
 * Workspace Boundary Validation Script
 * Validates DDD bounded context boundaries and dependency flow rules
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define workspace contexts and their allowed dependencies
const WORKSPACE_CONTEXTS = {
  'shared': {
    allowedDependencies: [],
    disallowedDependencies: ['@degentalk/client', '@degentalk/server', '@degentalk/db', '@degentalk/scripts']
  },
  'db': {
    allowedDependencies: ['@degentalk/shared'],
    disallowedDependencies: ['@degentalk/client', '@degentalk/server', '@degentalk/scripts']
  },
  'client': {
    allowedDependencies: ['@degentalk/shared'],
    disallowedDependencies: ['@degentalk/db', '@degentalk/server', '@degentalk/scripts']
  },
  'server': {
    allowedDependencies: ['@degentalk/shared', '@degentalk/db'],
    disallowedDependencies: ['@degentalk/client', '@degentalk/scripts']
  },
  'scripts': {
    allowedDependencies: ['@degentalk/shared', '@degentalk/db', '@degentalk/server', '@degentalk/client'],
    disallowedDependencies: []
  }
};

const IMPORT_PATTERNS = [
  /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
];

function getContextFromPath(filePath) {
  const parts = filePath.split(path.sep);
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'client') return 'client';
    if (parts[i] === 'server') return 'server';  
    if (parts[i] === 'shared') return 'shared';
    if (parts[i] === 'db') return 'db';
    if (parts[i] === 'scripts') return 'scripts';
  }
  
  return null;
}

function extractImports(content) {
  const imports = [];
  
  for (const pattern of IMPORT_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }
  
  return imports;
}

function validateFile(filePath) {
  const context = getContextFromPath(filePath);
  if (!context || !WORKSPACE_CONTEXTS[context]) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = extractImports(content);
  const violations = [];
  
  const { disallowedDependencies } = WORKSPACE_CONTEXTS[context];
  
  for (const importPath of imports) {
    for (const disallowed of disallowedDependencies) {
      if (importPath.startsWith(disallowed)) {
        violations.push({
          file: filePath,
          context,
          import: importPath,
          violation: `Cross-context import violation: "${context}" cannot import from "${disallowed}"`
        });
      }
    }
    
    // Check for relative imports crossing contexts
    if (importPath.startsWith('../') && importPath.includes('@degentalk/')) {
      violations.push({
        file: filePath,
        context,
        import: importPath,
        violation: 'Use direct workspace imports instead of relative paths for "@degentalk/*" packages'
      });
    }
  }
  
  return violations;
}

function validatePackageJson(packagePath) {
  if (!fs.existsSync(packagePath)) {
    return [];
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const context = getContextFromPath(packagePath);
  
  if (!context || !WORKSPACE_CONTEXTS[context]) {
    return [];
  }
  
  const violations = [];
  const { disallowedDependencies } = WORKSPACE_CONTEXTS[context];
  
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies
  };
  
  for (const dep of Object.keys(allDeps)) {
    for (const disallowed of disallowedDependencies) {
      if (dep === disallowed) {
        violations.push({
          file: packagePath,
          context,
          dependency: dep,
          violation: `Package dependency violation: "${context}" cannot depend on "${disallowed}"`
        });
      }
    }
  }
  
  return violations;
}

function main() {
  console.log('🔍 Validating workspace boundaries...');
  
  const violations = [];
  
  // Validate TypeScript/JavaScript files
  const codeFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
  });
  
  for (const file of codeFiles) {
    violations.push(...validateFile(file));
  }
  
  // Validate package.json files
  const packageFiles = glob.sync('**/package.json', {
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });
  
  for (const file of packageFiles) {
    violations.push(...validatePackageJson(file));
  }
  
  // Report results
  if (violations.length === 0) {
    console.log('✅ All workspace boundaries are valid!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${violations.length} boundary violations:`);
    console.log('');
    
    const violationsByContext = {};
    for (const violation of violations) {
      if (!violationsByContext[violation.context]) {
        violationsByContext[violation.context] = [];
      }
      violationsByContext[violation.context].push(violation);
    }
    
    for (const [context, contextViolations] of Object.entries(violationsByContext)) {
      console.log(`📦 ${context.toUpperCase()} Context (${contextViolations.length} violations):`);
      
      for (const violation of contextViolations) {
        console.log(`   ❌ ${violation.file}`);
        console.log(`      ${violation.violation}`);
        if (violation.import) {
          console.log(`      Import: ${violation.import}`);
        }
        if (violation.dependency) {
          console.log(`      Dependency: ${violation.dependency}`);
        }
        console.log('');
      }
    }
    
    console.log('💡 To fix these violations:');
    console.log('   1. Move shared logic to @degentalk/shared');
    console.log('   2. Use events for cross-domain communication');
    console.log('   3. Remove disallowed dependencies from package.json');
    console.log('   4. Use direct workspace imports instead of relative paths');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateFile, validatePackageJson, getContextFromPath };