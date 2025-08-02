/**
 * No Any Types Hook
 * Prevents usage of `any` type except in approved contexts like CCPayment API
 */

module.exports = {
  name: 'no-any-types',
  description: 'Prevent usage of any type except in approved contexts',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: [
    '**/*.test.*',
    '**/*.spec.*', 
    '**/scripts/**',
    '**/migrations/**'
  ],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    // Regex patterns to detect any usage
    const anyPatterns = [
      /:\s*any(?!\w)/g,           // : any
      /\<any\>/g,                 // <any>
      /\(.*any.*\)/g,             // (param: any)
      /function.*any/g,           // function(): any
      /any\[\]/g,                 // any[]
      /Array<any>/g,              // Array<any>
      /Promise<any>/g,            // Promise<any>
      /Record<.*any.*>/g          // Record<string, any>
    ];
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Skip if line has exception patterns
      if (isExceptionLine(line, filePath)) {
        return;
      }
      
      // Check each pattern
      anyPatterns.forEach(pattern => {
        const matches = Array.from(line.matchAll(pattern));
        matches.forEach(match => {
          const context = getContext(line, match.index);
          
          errors.push({
            line: lineNumber,
            column: match.index + 1,
            message: `Avoid using 'any' type. Use specific types or 'unknown' with type guards instead.`,
            severity: 'error',
            rule: 'no-any-types',
            context: context,
            suggestion: getSuggestion(context, match[0])
          });
        });
      });
    });
    
    return errors;
  }
};

/**
 * Check if a line contains exception patterns
 */
function isExceptionLine(line, filePath) {
  // ESLint disable comments
  if (line.includes('eslint-disable') && line.includes('no-explicit-any')) {
    return true;
  }
  
  // TypeScript ignore comments
  if (line.includes('@ts-ignore')) {
    return true;
  }
  
  // CCPayment API exceptions
  const ccpaymentPatterns = [
    /ccpayment/i,
    /CCPayment/,
    /processCCPayment/,
    /ccpaymentApi/,
    /ccpaymentRequest/,
    /ccpaymentResponse/,
    /@ccpayment-api/,
    /CCPayment API/i,
    /ccpayment integration/i
  ];
  
  return ccpaymentPatterns.some(pattern => pattern.test(line));
}

/**
 * Get context around the any usage
 */
function getContext(line, position) {
  if (line.includes('function')) return 'function';
  if (line.includes('interface')) return 'interface';
  if (line.includes('type')) return 'type-alias';
  if (line.includes('const') || line.includes('let') || line.includes('var')) return 'variable';
  if (line.includes('Promise')) return 'promise';
  if (line.includes('Record')) return 'record';
  if (line.includes('Array') || line.includes('[]')) return 'array';
  return 'general';
}

/**
 * Get suggestion based on context
 */
function getSuggestion(context, match) {
  switch (context) {
    case 'function':
      return 'Use specific parameter and return types';
    case 'interface':
      return 'Define specific property types';
    case 'variable':
      return 'Use specific type or unknown with type guard';
    case 'promise':
      return 'Specify Promise generic type: Promise<SpecificType>';
    case 'record':
      return 'Use Record<string, SpecificType> or create interface';
    case 'array':
      return 'Use SpecificType[] or Array<SpecificType>';
    default:
      return 'Replace with specific type or unknown';
  }
}