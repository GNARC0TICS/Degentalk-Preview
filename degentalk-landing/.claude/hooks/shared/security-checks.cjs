/**
 * Security Checks Hook
 * Prevents common security vulnerabilities
 */

module.exports = {
  name: 'security-checks',
  description: 'Prevent security vulnerabilities in production code',
  filePatterns: ['**/*.{ts,tsx,js,jsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for hardcoded secrets/keys
      const secretPatterns = [
        /(?:password|secret|key|token)\s*[:=]\s*['"]\w{8,}/i,
        /sk_live_\w+/,         // Stripe live keys
        /pk_live_\w+/,         // Stripe public keys  
        /AKIA[0-9A-Z]{16}/,    // AWS keys
        /ghp_[a-zA-Z0-9]{36}/  // GitHub tokens
      ];
      
      secretPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('process.env') && !line.includes('config.')) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: 'Hardcoded secrets detected. Use environment variables or config files.',
            severity: 'error',
            rule: 'no-hardcoded-secrets'
          });
        }
      });
      
      // Check for SQL injection risks
      if (line.includes('db.raw(') && line.includes('${')) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('db.raw('),
          message: 'Potential SQL injection. Use parameterized queries.',
          severity: 'error',
          rule: 'no-sql-injection'
        });
      }
      
      // Check for XSS risks
      if (line.includes('dangerouslySetInnerHTML') && !line.includes('DOMPurify')) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('dangerouslySetInnerHTML'),
          message: 'XSS risk: Sanitize HTML with DOMPurify before rendering.',
          severity: 'error',
          rule: 'no-unsanitized-html'
        });
      }
      
      // Check for eval usage
      if (/\beval\s*\(/.test(line)) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('eval'),
          message: 'eval() is dangerous and should not be used.',
          severity: 'error',
          rule: 'no-eval'
        });
      }
    });
    
    return errors;
  }
};