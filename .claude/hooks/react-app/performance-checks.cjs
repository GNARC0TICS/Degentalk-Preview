/**
 * Performance Checks Hook  
 * Catches performance anti-patterns in React code
 */

module.exports = {
  name: 'performance-checks',
  description: 'Detect React performance anti-patterns',
  filePatterns: ['**/*.{tsx,jsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for inline object/function definitions in JSX
      if (line.includes('={') && line.includes('{')) {
        const inlineObjectPattern = /=\{\{[^}]+\}\}/;
        const inlineFunctionPattern = /=\{[^}]*=>[^}]*\}/;
        
        if (inlineObjectPattern.test(line)) {
          errors.push({
            line: lineNumber,
            column: line.search(inlineObjectPattern),
            message: 'Inline objects cause unnecessary re-renders. Extract to variable or useMemo.',
            severity: 'warning',
            rule: 'no-inline-objects'
          });
        }
        
        if (inlineFunctionPattern.test(line)) {
          errors.push({
            line: lineNumber,
            column: line.search(inlineFunctionPattern),
            message: 'Inline functions cause unnecessary re-renders. Use useCallback or extract.',
            severity: 'warning',
            rule: 'no-inline-functions'
          });
        }
      }
      
      // Check for missing React.memo on components
      if (line.includes('export') && line.includes('function') && line.includes('Props')) {
        const nextLines = lines.slice(index, index + 10).join(' ');
        if (!nextLines.includes('React.memo') && !nextLines.includes('memo(')) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: 'Consider wrapping component with React.memo for better performance',
            severity: 'info',
            rule: 'suggest-memo'
          });
        }
      }
      
      // Check for missing key prop in map
      if (line.includes('.map(') && !line.includes('key=')) {
        const mapContext = lines.slice(Math.max(0, index - 2), index + 5).join(' ');
        if (mapContext.includes('return') && mapContext.includes('<')) {
          errors.push({
            line: lineNumber,
            column: line.indexOf('.map('),
            message: 'Missing key prop in mapped elements causes performance issues',
            severity: 'error',
            rule: 'missing-key-prop'
          });
        }
      }
      
      // Check for useState with object/array (should use useReducer)
      const useStatePattern = /useState\s*\(\s*\{|\useState\s*\(\s*\[/;
      if (useStatePattern.test(line)) {
        errors.push({
          line: lineNumber,
          column: line.search(useStatePattern),
          message: 'Complex state objects should use useReducer for better performance',
          severity: 'info',
          rule: 'prefer-use-reducer'
        });
      }
      
      // Check for missing dependency arrays
      if (/use(Effect|Callback|Memo)\s*\(/.test(line) && !line.includes(']')) {
        const hookMatch = line.match(/use(Effect|Callback|Memo)/);
        errors.push({
          line: lineNumber,
          column: line.indexOf(hookMatch[0]),
          message: `${hookMatch[0]} missing dependency array can cause performance issues`,
          severity: 'warning',
          rule: 'missing-dep-array'
        });
      }
    });
    
    return errors;
  }
};