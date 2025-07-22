const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
  name: 'check-branded-ids',
  description: 'Validate branded ID usage in DegenTalk',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/migrations/**', '**/scripts/**'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    // Load patterns
    const patternsPath = path.join(__dirname, '..', 'branded-id-patterns.json');
    let patterns;
    try {
      patterns = JSON.parse(readFileSync(patternsPath, 'utf8'));
    } catch (error) {
      return [{
        line: 0,
        message: 'Failed to load branded ID patterns',
        severity: 'error'
      }];
    }
    
    // Check for numeric comparisons (userId > 0 patterns)
    lines.forEach((line, index) => {
      patterns.patterns.numericComparisons.forEach(pattern => {
        const regex = new RegExp(pattern.pattern, 'g');
        const matches = line.match(regex);
        
        if (matches) {
          matches.forEach(match => {
            const column = line.indexOf(match);
            errors.push({
              line: index + 1,
              column,
              message: pattern.message,
              severity: 'error',
              code: 'branded-id-numeric-comparison',
              fix: {
                oldString: match,
                newString: match.replace(
                  /(\w+Id)\s*[><=]+\s*\d+/,
                  'isValidId($1)'
                ),
                imports: pattern.fix.imports
              }
            });
          });
        }
      });
    });
    
    // Check for useState<number> with ID setters
    patterns.patterns.useStateTypes.forEach(pattern => {
      const regex = new RegExp(pattern.pattern, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const lineIndex = content.indexOf(match);
          const lineNumber = content.substring(0, lineIndex).split('\n').length;
          
          errors.push({
            line: lineNumber,
            message: pattern.message.replace('$1', match.includes('number') ? 'number' : match.includes('string') ? 'string' : 'any'),
            severity: 'error',
            code: 'branded-id-wrong-state-type'
          });
        });
      }
    });
    
    // Check for direct type assertions (as UserId)
    patterns.patterns.directIdCasts.forEach(pattern => {
      const regex = new RegExp(pattern.pattern, 'g');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        const lineIndex = content.substring(0, match.index).split('\n').length;
        errors.push({
          line: lineIndex,
          message: pattern.message,
          severity: 'warning',
          code: 'branded-id-direct-cast',
          fix: {
            oldString: match[0],
            newString: pattern.fix.template.replace('$1', match[0].replace(/as\s+/, '')),
            imports: pattern.fix.imports
          }
        });
      }
    });
    
    // Check for @db/types imports
    patterns.patterns.wrongImports.forEach(pattern => {
      const regex = new RegExp(pattern.pattern, 'g');
      if (content.match(regex)) {
        const lineIndex = content.search(regex);
        const lineNumber = content.substring(0, lineIndex).split('\n').length;
        
        errors.push({
          line: lineNumber,
          message: pattern.message,
          severity: 'error',
          code: 'branded-id-wrong-import',
          fix: {
            oldString: "from '@db/types'",
            newString: "from '@shared/types/ids'"
          }
        });
      }
    });
    
    return errors;
  },
  
  autoFix(filePath, content, errors) {
    let fixedContent = content;
    const importsToAdd = new Set();
    
    errors.forEach(error => {
      if (error.fix) {
        fixedContent = fixedContent.replace(error.fix.oldString, error.fix.newString);
        
        if (error.fix.imports) {
          error.fix.imports.forEach(imp => importsToAdd.add(imp));
        }
      }
    });
    
    // Add missing imports at the top
    if (importsToAdd.size > 0) {
      const imports = Array.from(importsToAdd).join('\n');
      const firstImportMatch = fixedContent.match(/^import.*from.*;/m);
      
      if (firstImportMatch) {
        fixedContent = fixedContent.replace(
          firstImportMatch[0],
          `${imports}\n${firstImportMatch[0]}`
        );
      } else {
        fixedContent = `${imports}\n\n${fixedContent}`;
      }
    }
    
    return fixedContent;
  }
};