/**
 * Enforce Test File Placement Hook
 * 
 * Ensures test files are created in the correct locations:
 * - Client tests: client/src/__tests__/
 * - Server tests: server/src/**/__tests__/ or *.test.ts in domain folders
 * - E2E tests: tests/e2e/
 * 
 * Only fires when creating test files (*.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx)
 */

const path = require('path');

module.exports = {
  name: 'enforce-test-file-placement',
  description: 'Ensures test files are created in proper directories',
  hooks: ['pre-create', 'pre-edit'],
  filePattern: '**/*.{test,spec}.{ts,tsx,js,jsx}',
  
  run: async (context) => {
    const { filePath, operation, content } = context;
    const errors = [];
    
    // Only check on file creation, not edits
    if (operation !== 'create') {
      return errors;
    }
    
    const relativePath = path.relative(context.projectRoot, filePath);
    const pathParts = relativePath.split(path.sep);
    const fileName = path.basename(filePath);
    
    // Check if this is a test file
    const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(fileName);
    if (!isTestFile) {
      return errors;
    }
    
    // Determine workspace
    const workspace = pathParts[0];
    
    if (workspace === 'client') {
      // Client tests must be in __tests__ directories
      const srcIndex = pathParts.indexOf('src');
      if (srcIndex === -1) {
        errors.push({
          line: 0,
          column: 0,
          message: 'Client test files must be inside the src directory',
          severity: 'error',
          rule: 'test-file-placement'
        });
        return errors;
      }
      
      // Check if file is in __tests__ directory
      if (!pathParts.includes('__tests__')) {
        const correctPath = getCorrectClientTestPath(relativePath);
        errors.push({
          line: 0,
          column: 0,
          message: `Test file should be placed in __tests__ directory. Suggested location: ${correctPath}`,
          severity: 'error',
          rule: 'test-file-placement',
          suggestion: correctPath
        });
      }
    } else if (workspace === 'server') {
      // Server tests can be either:
      // 1. In __tests__ directories
      // 2. *.test.ts files alongside source files
      const srcIndex = pathParts.indexOf('src');
      if (srcIndex === -1) {
        errors.push({
          line: 0,
          column: 0,
          message: 'Server test files must be inside the src directory',
          severity: 'error',
          rule: 'test-file-placement'
        });
        return errors;
      }
      
      // If using test components pattern (ErrorBoundaryTest, etc), must be in __tests__
      if (fileName.includes('Test') && !fileName.includes('.test.')) {
        if (!pathParts.includes('__tests__')) {
          errors.push({
            line: 0,
            column: 0,
            message: 'Test component files (e.g., ErrorBoundaryTest) must be in __tests__ directory',
            severity: 'error',
            rule: 'test-file-placement'
          });
        }
      }
    } else if (workspace === 'tests') {
      // E2E tests should be in tests/e2e/
      if (!pathParts.includes('e2e')) {
        errors.push({
          line: 0,
          column: 0,
          message: 'End-to-end tests should be placed in tests/e2e/ directory',
          severity: 'warning',
          rule: 'test-file-placement'
        });
      }
    } else if (workspace === 'scripts') {
      // Test scripts are allowed in scripts/testing/
      if (!pathParts.includes('testing')) {
        errors.push({
          line: 0,
          column: 0,
          message: 'Test scripts should be placed in scripts/testing/ directory',
          severity: 'warning',
          rule: 'test-file-placement'
        });
      }
    }
    
    // Check for old test directory patterns
    if (relativePath.includes('/test/') && !relativePath.includes('__test')) {
      errors.push({
        line: 0,
        column: 0,
        message: 'Use __tests__ directory instead of test/ directory',
        severity: 'error',
        rule: 'test-file-placement'
      });
    }
    
    if (relativePath.includes('components/test/')) {
      errors.push({
        line: 0,
        column: 0,
        message: 'Test components should be in __tests__/components/ not components/test/',
        severity: 'error',
        rule: 'test-file-placement'
      });
    }
    
    return errors;
  }
};

function getCorrectClientTestPath(currentPath) {
  // Convert path like client/src/features/admin/AdminPanel.test.tsx
  // to client/src/__tests__/features/admin/AdminPanel.test.tsx
  const parts = currentPath.split(path.sep);
  const srcIndex = parts.indexOf('src');
  
  if (srcIndex === -1) return currentPath;
  
  // Insert __tests__ after src
  const newParts = [
    ...parts.slice(0, srcIndex + 1),
    '__tests__',
    ...parts.slice(srcIndex + 1)
  ];
  
  return newParts.join(path.sep);
}