// ---------------------------------------------------------------------------
// PERFORMANCE: compile regexes once at module scope
// ---------------------------------------------------------------------------
const CONSOLE_METHOD_REGEX = /console\.(log|error|warn|info|debug|trace|table|time|timeEnd)/g;
const CONSOLE_VAR_REGEX = /const\s+(\w+)\s*=\s*console\.(log|error|warn|info|debug)/g;

module.exports = {
  name: 'no-console',
  description: 'Replace console.* with logger.*',
  filePatterns: ['**/*.{ts,tsx,js,jsx}'],
  excludePatterns: [
    '**/*.test.*', 
    '**/*.spec.*', 
    '**/scripts/**',
    '**/tools/**',
    '**/vite.config.*',
    '**/vitest.config.*'
  ],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    // Skip files that are intentionally using console (e.g., client-side logging)
    if (filePath.includes('/client/') && content.includes('// @console-allowed')) {
      return errors;
    }
    
    lines.forEach((line, index) => {
      // Match console.method patterns
      let match;
      
      CONSOLE_METHOD_REGEX.lastIndex = 0; // reset stateful regex
      while ((match = CONSOLE_METHOD_REGEX.exec(line)) !== null) {
        const method = match[1];
        const column = match.index;
        
        // Skip if it's in a comment
        const beforeMatch = line.substring(0, column);
        if (beforeMatch.includes('//') || beforeMatch.includes('/*')) {
          continue;
        }
        
        // Skip if explicitly allowed
        if (line.includes('// @console-ok') || line.includes('eslint-disable-next-line no-console')) {
          continue;
        }
        
        errors.push({
          line: index + 1,
          column,
          message: `Use logger.${method} instead of console.${method}`,
          severity: 'error',
          code: 'no-console-usage',
          fix: {
            oldString: `console.${method}`,
            newString: `logger.${method}`,
            imports: method === 'debug' ? 
              ["import { logger } from '@core/logger';"] :
              ["import { logger } from '@/lib/logger';"]
          }
        });
      }
      
      // Also check for console methods used as variables
      CONSOLE_VAR_REGEX.lastIndex = 0;
      while ((match = CONSOLE_VAR_REGEX.exec(line)) !== null) {
        const varName = match[1];
        const method = match[2];
        const column = match.index;
        
        errors.push({
          line: index + 1,
          column,
          message: `Use logger.${method} instead of assigning console.${method} to variable`,
          severity: 'error',
          code: 'no-console-variable',
          fix: {
            oldString: `const ${varName} = console.${method}`,
            newString: `const ${varName} = logger.${method}`,
            imports: ["import { logger } from '@/lib/logger';"]
          }
        });
      }
    });
    
    return errors;
  },
  
  autoFix(filePath, content, errors) {
    let fixedContent = content;
    const importsToAdd = new Set();
    
    // Apply fixes in reverse order to maintain line positions
    const sortedErrors = errors
      .filter(error => error.fix)
      .sort((a, b) => b.line - a.line || b.column - a.column);
    
    sortedErrors.forEach(error => {
      const lines = fixedContent.split('\n');
      const lineIndex = error.line - 1;
      
      if (lines[lineIndex]) {
        lines[lineIndex] = lines[lineIndex].replace(error.fix.oldString, error.fix.newString);
        fixedContent = lines.join('\n');
        
        if (error.fix.imports) {
          error.fix.imports.forEach(imp => importsToAdd.add(imp));
        }
      }
    });
    
    // Add missing logger import
    if (importsToAdd.size > 0 && !fixedContent.includes("from '@/lib/logger'") && !fixedContent.includes("from '@core/logger'")) {
      const loggerImport = Array.from(importsToAdd)[0]; // Use the first import
      const firstImportMatch = fixedContent.match(/^import.*from.*;/m);
      
      if (firstImportMatch) {
        fixedContent = fixedContent.replace(
          firstImportMatch[0],
          `${loggerImport}\n${firstImportMatch[0]}`
        );
      } else {
        // Add after any existing imports or at the top
        const lines = fixedContent.split('\n');
        let insertIndex = 0;
        
        // Find last import line
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import') || lines[i].trim().startsWith('//')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() !== '') {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, loggerImport, '');
        fixedContent = lines.join('\n');
      }
    }
    
    return fixedContent;
  }
};