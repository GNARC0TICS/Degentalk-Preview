// ---------------------------------------------------------------------------
// PERFORMANCE: pre-compile common import usage patterns once
// ---------------------------------------------------------------------------
const COMMON_IMPORT_PATTERNS = [
  {
    usage: /\bisValidId\s*\(/g,
    import: "import { isValidId } from '@shared/utils/id';",
    name: 'isValidId',
  },
  {
    usage: /\blogger\./g,
    import: "import { logger } from '@/lib/logger';",
    name: 'logger',
  },
  {
    usage: /\bUserId\b/g,
    import: "import type { UserId } from '@shared/types/ids';",
    name: 'UserId',
  },
  {
    usage: /\bForumId\b/g,
    import: "import type { ForumId } from '@shared/types/ids';",
    name: 'ForumId',
  },
];

function hasImport(content, pattern) {
  const importName = pattern.name;
  const importRegex = new RegExp(`import(?:\\s+type)?\\s+\\{[^}]*\\b${importName}\\b[^}]*\\}`, 'm');
  return importRegex.test(content);
}

module.exports = {
  name: 'validate-imports',
  description: 'Enforce import conventions for DegenTalk',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for @db/types imports (forbidden)
      if (trimmedLine.includes("from '@db/types'")) {
        errors.push({
          line: index + 1,
          column: line.indexOf('@db/types'),
          message: "Import from '@shared/types/ids' instead of '@db/types' for ID types",
          severity: 'error',
          code: 'forbidden-db-types-import',
          fix: {
            oldString: "from '@db/types'",
            newString: "from '@shared/types/ids'"
          }
        });
      }
      
      // Check for relative imports crossing workspace boundaries
      const relativeMatch = trimmedLine.match(/from\s+['"](\.\.[\/\\].*)['"]/);
      if (relativeMatch) {
        const importPath = relativeMatch[1];
        const currentWorkspace = this.getWorkspace(filePath);
        const targetWorkspace = this.getWorkspaceFromRelativePath(filePath, importPath);
        
        if (currentWorkspace !== targetWorkspace && targetWorkspace) {
          errors.push({
            line: index + 1,
            column: line.indexOf(importPath),
            message: `Use path alias instead of relative import across workspaces (${currentWorkspace} → ${targetWorkspace})`,
            severity: 'warning',
            code: 'cross-workspace-relative-import',
            suggestion: this.suggestPathAlias(importPath, targetWorkspace)
          });
        }
        
        // Check for deeply nested relative imports
        const depth = (importPath.match(/\.\.[\/\\]/g) || []).length;
        if (depth > 2) {
          errors.push({
            line: index + 1,
            column: line.indexOf(importPath),
            message: `Avoid deeply nested relative imports (${depth} levels). Consider using path aliases.`,
            severity: 'warning',
            code: 'deep-relative-import'
          });
        }
      }
      
      // Check for missing file extensions in imports
      const importMatch = trimmedLine.match(/from\s+['"]([^'"]+)['"]/);
      if (importMatch && !importMatch[1].startsWith('@') && !importMatch[1].startsWith('.')) {
        const importPath = importMatch[1];
        
        // Skip node_modules and built-in modules
        if (!importPath.includes('/') || importPath.startsWith('node:')) {
          return;
        }
        
        if (!importPath.endsWith('.js') && !importPath.endsWith('.ts') && 
            !importPath.endsWith('.tsx') && !importPath.endsWith('.json')) {
          errors.push({
            line: index + 1,
            column: line.indexOf(importPath),
            message: 'Add explicit file extension for local imports',
            severity: 'warning',
            code: 'missing-file-extension'
          });
        }
      }
      
      // Check for importing from index files explicitly
      if (trimmedLine.includes('/index\'') || trimmedLine.includes('/index"')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('/index'),
          message: 'Remove explicit /index from imports',
          severity: 'info',
          code: 'explicit-index-import',
          fix: {
            oldString: '/index',
            newString: ''
          }
        });
      }
      
      // Check for potential circular imports (basic check)
      if (trimmedLine.includes('import') && filePath.includes('types/') && 
          (trimmedLine.includes('/components/') || trimmedLine.includes('/services/'))) {
        errors.push({
          line: index + 1,
          message: 'Potential circular import detected: types should not import from components/services',
          severity: 'warning',
          code: 'potential-circular-import'
        });
      }
    });
    
    // Check for missing imports based on usage
    this.checkMissingImports(content, errors);
    
    return errors;
  },
  
  getWorkspace(filePath) {
    if (filePath.includes('/client/')) return 'client';
    if (filePath.includes('/server/')) return 'server';
    if (filePath.includes('/shared/')) return 'shared';
    if (filePath.includes('/db/')) return 'db';
    return 'root';
  },
  
  getWorkspaceFromRelativePath(currentPath, relativePath) {
    // Simple heuristic to determine target workspace from relative path
    const parts = relativePath.split(/[\/\\]/);
    if (parts.includes('client')) return 'client';
    if (parts.includes('server')) return 'server';
    if (parts.includes('shared')) return 'shared';
    if (parts.includes('db')) return 'db';
    return null;
  },
  
  suggestPathAlias(relativePath, targetWorkspace) {
    const mapping = {
      'client': '@/',
      'server': '@server/',
      'shared': '@shared/',
      'db': '@db/'
    };
    
    const alias = mapping[targetWorkspace];
    if (!alias) return null;
    
    // Try to convert relative path to alias path
    const pathParts = relativePath.split(/[\/\\]/).filter(p => p !== '..');
    const workspaceIndex = pathParts.findIndex(p => p === targetWorkspace);
    
    if (workspaceIndex >= 0) {
      const remainingPath = pathParts.slice(workspaceIndex + 1).join('/');
      return `${alias}${remainingPath}`;
    }
    
    return null;
  },
  
  // now uses module-scope COMMON_IMPORT_PATTERNS
  
  checkMissingImports(content, errors) {
    COMMON_IMPORT_PATTERNS.forEach((pattern) => {
      if (pattern.usage.test(content) && !hasImport(content, pattern)) {
        errors.push({
          line: 1,
          message: `Missing import for ${pattern.name}`,
          severity: 'warning',
          code: 'missing-import',
          fix: {
            import: pattern.import,
          },
        });
      }
    });
  },
  
  autoFix(filePath, content, errors) {
    let fixedContent = content;
    const importsToAdd = new Set();
    
    // Apply string replacements
    errors.forEach(error => {
      if (error.fix && error.fix.oldString && error.fix.newString) {
        fixedContent = fixedContent.replace(error.fix.oldString, error.fix.newString);
      }
      
      if (error.fix && error.fix.import) {
        importsToAdd.add(error.fix.import);
      }
    });
    
    // Add missing imports
    if (importsToAdd.size > 0) {
      const imports = Array.from(importsToAdd);
      const lines = fixedContent.split('\n');
      
      // Find insertion point (after existing imports)
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import') || lines[i].trim().startsWith('//')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() !== '') {
          break;
        }
      }
      
      // Insert imports
      imports.forEach(imp => {
        lines.splice(insertIndex++, 0, imp);
      });
      
      lines.splice(insertIndex, 0, ''); // Add blank line
      fixedContent = lines.join('\n');
    }
    
    return fixedContent;
  }
};