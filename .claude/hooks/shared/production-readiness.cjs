/**
 * Production Readiness Hook
 * Ensures code is production-ready before commit
 */

module.exports = {
  name: 'production-readiness',
  description: 'Enforce production-ready code standards',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/scripts/**'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for debug statements
      const debugPatterns = [
        /debugger\s*;?/,
        /console\.trace\(/,
        /console\.time\(/,
        /console\.timeEnd\(/,
        /console\.count\(/,
        /console\.group\(/,
        /console\.table\(/
      ];
      
      debugPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          errors.push({
            line: lineNumber,
            column: line.search(pattern),
            message: 'Remove debug statements before production',
            severity: 'error',
            rule: 'no-debug-statements'
          });
        }
      });
      
      // Check for TODO/FIXME in main code (not scripts)
      if (!filePath.includes('/scripts/') && !filePath.includes('/docs/')) {
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(line) && !line.trim().startsWith('//')) {
          errors.push({
            line: lineNumber,
            column: line.search(/\b(TODO|FIXME|HACK|XXX)\b/),
            message: 'Resolve TODO/FIXME before production release',
            severity: 'warning',
            rule: 'no-todos-in-production'
          });
        }
      }
      
      // Check for test-only imports in production code
      const testImports = [
        /@testing-library/,
        /vitest/,
        /jest/
      ];
      
      testImports.forEach(pattern => {
        if (pattern.test(line) && line.includes('import')) {
          errors.push({
            line: lineNumber,
            column: line.indexOf('import'),
            message: 'Test imports should not be in production code',
            severity: 'error',
            rule: 'no-test-imports'
          });
        }
      });
      
      // Check for unused variables (simple regex)
      const unusedVarPattern = /const\s+(\w+)\s*=/;
      const match = line.match(unusedVarPattern);
      if (match && !content.includes(match[1] + '.') && !content.includes(match[1] + '(')) {
        // Simple check - more sophisticated would need AST
        if (line.indexOf(match[0]) === line.lastIndexOf(match[1])) {
          errors.push({
            line: lineNumber,
            column: line.indexOf(match[1]),
            message: `Unused variable '${match[1]}' detected`,
            severity: 'warning',
            rule: 'no-unused-vars'
          });
        }
      }
    });
    
    return errors;
  }
};