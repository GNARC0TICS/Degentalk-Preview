/**
 * Enforces domain boundaries - no cross-domain internal imports
 */

const DOMAIN_FILE_PATTERN = /\/domains\/([^/]+)\//;
const INTERNAL_IMPORT_PATTERN = /from\s+['"]\.\.\/([\w-]+)\/((?!index)[^'"]+)['"]/;
const SERVICE_IMPORT_PATTERN = /from\s+['"]\.\.\/([\w-]+)\/(service|repository|controller|validator|transformer)['"]/;

module.exports = {
  name: 'enforce-domain-boundaries',
  check(content, filePath) {
    const errors = [];
    const warnings = [];
    
    // Extract current domain
    const currentDomainMatch = filePath.match(DOMAIN_FILE_PATTERN);
    if (!currentDomainMatch) {
      return { errors, warnings };
    }
    
    const currentDomain = currentDomainMatch[1];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      
      // Check for cross-domain internal imports
      const internalMatch = line.match(INTERNAL_IMPORT_PATTERN);
      if (internalMatch) {
        const importedDomain = internalMatch[1];
        const importedFile = internalMatch[2];
        
        // If importing from different domain
        if (importedDomain !== currentDomain) {
          errors.push({
            line: index + 1,
            message: `Cross-domain imports must use the domain's index.ts. Import from '../${importedDomain}' or '@domains/${importedDomain}' instead.`,
            fix: `Change to: import { ... } from '../${importedDomain}';`
          });
        }
      }
      
      // Check for direct service/repository imports
      const serviceMatch = line.match(SERVICE_IMPORT_PATTERN);
      if (serviceMatch) {
        const importedDomain = serviceMatch[1];
        
        if (importedDomain !== currentDomain) {
          errors.push({
            line: index + 1,
            message: `Cannot import internal files from other domains. Use EventBus for cross-domain communication.`,
            fix: `Import from '../${importedDomain}' and use EventBus.emit() for communication.`
          });
        }
      }
    });
    
    return { errors, warnings };
  }
};