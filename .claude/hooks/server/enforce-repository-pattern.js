/**
 * Enforces repository pattern - services cannot directly access database
 */

const DOMAIN_SERVICE_PATTERN = /\/domains\/[^/]+\/.*\.service\.(ts|js)$/;
const DB_IMPORT_PATTERNS = [
  /from\s+['"]@db['"]/,
  /from\s+['"]@schema['"]/,
  /from\s+['"]drizzle-orm['"]/,
  /\bdb\./,
  /\bdb\[/,
];

module.exports = {
  name: 'enforce-repository-pattern',
  check(content, filePath) {
    const errors = [];
    
    // Only check service files
    if (!DOMAIN_SERVICE_PATTERN.test(filePath)) {
      return { errors, warnings: [] };
    }
    
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      
      // Check for DB imports
      for (const pattern of DB_IMPORT_PATTERNS) {
        if (pattern.test(line)) {
          errors.push({
            line: index + 1,
            message: 'Services must not directly access the database. Use repositories for all DB operations.',
            fix: 'Move this query to the domain repository and inject it into the service.'
          });
        }
      }
    });
    
    return { errors, warnings: [] };
  }
};