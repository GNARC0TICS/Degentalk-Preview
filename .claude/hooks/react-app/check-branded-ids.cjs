const { readFileSync } = require('fs');
const path = require('path');

// PERFORMANCE OPTIMISATION — preload patterns & compile regexes once at module scope
// Resolve path to branded-ID patterns JSON once
const PATTERNS_PATH = path.join(__dirname, '..', 'branded-id-patterns.json');

let PATTERNS_CACHE;
try {
  PATTERNS_CACHE = JSON.parse(readFileSync(PATTERNS_PATH, 'utf8'));
} catch (error) {
  /* eslint-disable no-console */
  console.error('[check-branded-ids] Failed to load branded-id-patterns.json', error);
  PATTERNS_CACHE = null;
}

// Helper to map pattern objects → { regex, meta }
const compilePatterns = (arr = []) =>
  arr.map((p) => ({ regex: new RegExp(p.pattern, 'g'), meta: p }));

// Pre-compile all regex sets (fall back to empty array if file missing)
const NUMERIC_REGEXES = compilePatterns(PATTERNS_CACHE?.patterns?.numericComparisons);
const USE_STATE_REGEXES = compilePatterns(PATTERNS_CACHE?.patterns?.useStateTypes);
const DIRECT_CAST_REGEXES = compilePatterns(PATTERNS_CACHE?.patterns?.directIdCasts);
const WRONG_IMPORT_REGEXES = compilePatterns(PATTERNS_CACHE?.patterns?.wrongImports);

module.exports = {
  name: 'check-branded-ids',
  description: 'Validate branded ID usage in DegenTalk',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/migrations/**', '**/scripts/**'],
  
  check(filePath, content) {
    // Bail early if pattern cache missing (avoids hard crash)
    if (!PATTERNS_CACHE) {
      return [
        {
          line: 0,
          message: 'Branded ID patterns unavailable – hook skipped',
          severity: 'warning',
        },
      ];
    }

    const errors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      NUMERIC_REGEXES.forEach(({ regex, meta }) => {
        const matches = line.match(regex);
        
        if (matches) {
          matches.forEach(match => {
            const column = line.indexOf(match);
            errors.push({
              line: index + 1,
              column,
              message: meta.message,
              severity: 'error',
              code: 'branded-id-numeric-comparison',
              fix: {
                oldString: match,
                newString: match.replace(/(\w+Id)\s*[><=]+\s*\d+/, 'isValidId($1)'),
                imports: meta.fix.imports,
              }
            });
          });
        }
      });
    });
    
    // Check for useState<number> with ID setters
    USE_STATE_REGEXES.forEach(({ regex, meta }) => {
      const matches = content.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const lineIndex = content.indexOf(match);
          const lineNumber = content.substring(0, lineIndex).split('\n').length;
          
          errors.push({
            line: lineNumber,
            message: meta.message.replace('$1', match.includes('number') ? 'number' : match.includes('string') ? 'string' : 'any'),
            severity: 'error',
            code: 'branded-id-wrong-state-type'
          });
        });
      }
    });
    
    // Check for direct type assertions (as UserId)
    DIRECT_CAST_REGEXES.forEach(({ regex, meta }) => {
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        const lineIndex = content.substring(0, match.index).split('\n').length;
        errors.push({
          line: lineIndex,
          message: meta.message,
          severity: 'warning',
          code: 'branded-id-direct-cast',
          fix: {
            oldString: match[0],
            newString: meta.fix.template.replace('$1', match[0].replace(/as\s+/, '')),
            imports: meta.fix.imports,
          }
        });
      }
    });
    
    // Check for @db/types imports
    WRONG_IMPORT_REGEXES.forEach(({ regex, meta }) => {
      if (content.match(regex)) {
        const lineIndex = content.search(regex);
        const lineNumber = content.substring(0, lineIndex).split('\n').length;
        
        errors.push({
          line: lineNumber,
          message: meta.message,
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