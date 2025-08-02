module.exports = {
  name: 'check-api-request-signature',
  description: 'Ensures apiRequest calls use correct signatures and params types',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: ['**/*.test.*', '**/api-request.ts'],

  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for apiRequest with object params that might have type issues
      const apiRequestMatch = line.match(/apiRequest[<\w]*\s*\(\s*\{[^}]*params:\s*([^,}]+)/);
      if (apiRequestMatch) {
        const paramsValue = apiRequestMatch[1].trim();
        
        // Check if params is a typed object that might not have index signature
        if (paramsValue.includes('filters') || paramsValue.includes('Filters')) {
          errors.push({
            line: index + 1,
            column: line.indexOf('params:'),
            message: 'Filter objects may need index signature. Consider spreading: params: { ...filters } or ensure the type has [key: string]: string | number | boolean | undefined | string[]',
            severity: 'warning',
            rule: 'api-request-params-type'
          });
        }
      }

      // Check for incorrect apiRequest overload usage
      if (line.includes('apiRequest(') && line.includes('url:') && !line.includes('method:')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('apiRequest'),
          message: 'apiRequest with object parameter requires method property',
          severity: 'error',
          rule: 'api-request-missing-method'
        });
      }

      // Check for old apiRequest string signature
      const stringApiRequest = line.match(/apiRequest\s*\(\s*['"`]\/api/);
      if (stringApiRequest && !line.includes(',')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('apiRequest'),
          message: 'Prefer object syntax for apiRequest: apiRequest({ url: "/api/...", method: "GET" })',
          severity: 'info',
          rule: 'api-request-prefer-object'
        });
      }
    });

    return errors;
  }
};