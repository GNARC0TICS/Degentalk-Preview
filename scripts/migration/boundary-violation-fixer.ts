#!/usr/bin/env tsx
/**
 * Automated Boundary Violation Migration Script
 * 
 * Systematically fixes cross-domain import violations by replacing them
 * with type-safe event emissions following proven patterns.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { randomUUID } from 'crypto';

// Configuration
const SERVER_ROOT = '/home/developer/Degentalk-BETA/server';
const DOMAINS_DIR = join(SERVER_ROOT, 'src/domains');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Migration patterns detected from working fix
const MIGRATION_PATTERNS = {
  'admin.middleware': {
    imports: ['asyncHandler', 'isAdmin', 'isAdminOrModerator'],
    replacement: 'event-based error handling and auth',
    eventType: 'admin.route.error',
    handlerTemplate: 'socialAsyncHandler',
    dependencies: ['express', 'crypto']
  },
  'admin.errors': {
    imports: ['AdminError', 'AdminErrorCodes'],
    replacement: 'domain-specific errors with event emission',
    eventType: 'admin.error.occurred',
    handlerTemplate: 'domainErrorHandler',
    dependencies: ['core errors']
  },
  'xp.service': {
    imports: ['xpService', 'awardXp', 'deductXp'],
    replacement: 'XP events',
    eventType: 'xp.award',
    handlerTemplate: 'xpEventEmitter',
    dependencies: ['xp domain']
  }
};

// Circuit breaker metrics
const migrationMetrics = {
  filesScanned: 0,
  violationsFound: 0,
  violationsFixed: 0,
  errors: 0,
  startTime: Date.now()
};

interface ViolationMatch {
  file: string;
  line: number;
  content: string;
  pattern: keyof typeof MIGRATION_PATTERNS;
  imports: string[];
  domain: string;
}

/**
 * Recursively scan domains directory for TypeScript files
 */
function getAllTSFiles(dir: string, excludeDirs: string[] = ['admin', '__tests__', 'node_modules']): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !excludeDirs.some(exclude => entry === exclude)) {
        files.push(...getAllTSFiles(fullPath, excludeDirs));
      } else if (stat.isFile() && entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Extract domain name from file path
 */
function getDomainFromPath(filePath: string): string {
  const relativePath = relative(DOMAINS_DIR, filePath);
  return relativePath.split('/')[0] || 'unknown';
}

/**
 * Analyze file for boundary violations
 */
function analyzeFile(filePath: string): ViolationMatch[] {
  migrationMetrics.filesScanned++;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations: ViolationMatch[] = [];
    const domain = getDomainFromPath(filePath);
    
    // Also check for multiline imports
    const multilineImportRegex = /import\s+(?:type\s+)?\{\s*([^}]+)\s*\}\s+from\s+['"](\.\.\?\.\.\/admin\/[^'"]+)['"]/gs;
    const multilineMatches = content.matchAll(multilineImportRegex);
    
    for (const match of multilineMatches) {
      const [fullMatch, importList, importPath] = match;
      const imports = importList.split(',').map(i => i.trim());
      
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      // Detect pattern type
      let pattern: keyof typeof MIGRATION_PATTERNS | null = null;
      if (importPath.includes('admin.middleware')) pattern = 'admin.middleware';
      else if (importPath.includes('admin.errors')) pattern = 'admin.errors';
      else if (importPath.includes('xp.service')) pattern = 'xp.service';
      
      if (pattern) {
        violations.push({
          file: filePath,
          line: lineNumber,
          content: fullMatch.trim(),
          pattern,
          imports,
          domain
        });
        migrationMetrics.violationsFound++;
      }
    }

    lines.forEach((line, index) => {
      // Match single-line imports with ../../admin/ pattern
      const importMatch = line.match(/import.+from\s+['"]\.\.\/\.\.\/admin\/([^'"]+)['"];?/);
      
      if (importMatch) {
        const [fullMatch, importPath] = importMatch;
        const importList = line.match(/\{([^}]+)\}/)?.[1] || '';
        const imports = importList ? importList.split(',').map(i => i.trim()) : ['default'];
        
        // Detect pattern type from import path
        let pattern: keyof typeof MIGRATION_PATTERNS | null = null;
        if (importPath.includes('admin.middleware')) pattern = 'admin.middleware';
        else if (importPath.includes('admin.errors')) pattern = 'admin.errors';
        else if (importPath.includes('xp.service')) pattern = 'xp.service';
        
        if (pattern) {
          violations.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            pattern,
            imports,
            domain
          });
          migrationMetrics.violationsFound++;
        }
      }
    });
    
    return violations;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    migrationMetrics.errors++;
    return [];
  }
}

/**
 * Generate replacement code based on pattern
 */
function generateReplacement(violation: ViolationMatch): { imports: string[], handler: string, eventSchema?: string } {
  const { pattern, domain, imports } = violation;
  const config = MIGRATION_PATTERNS[pattern];
  const correlationId = randomUUID();
  
  switch (pattern) {
    case 'admin.middleware':
      return {
        imports: [
          "import type { Request, Response, NextFunction, RequestHandler } from 'express';",
          "import { randomUUID } from 'crypto';",
          "import { eventEmitter } from '@domains/notifications/event-notification-listener';"
        ],
        handler: `
// ${domain} async handler that emits admin events
const ${domain}AsyncHandler = (
  routeHandler: RequestHandler
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    try {
      await routeHandler(req, res, next);
    } catch (error) {
      // Emit asynchronously to not block response
      setImmediate(() => {
        eventEmitter.emit('admin.route.error', {
          domain: '${domain}',
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : String(error),
          timestamp: new Date(),
          userId: req.user?.id || null,
          correlationId,
          path: req.path,
          method: req.method
        });
      });
      next(error);
    }
  };
};`
      };
      
    case 'admin.errors':
      return {
        imports: [
          "import { eventEmitter } from '@domains/notifications/event-notification-listener';"
        ],
        handler: `
// ${domain} error handler with admin monitoring
class ${domain.charAt(0).toUpperCase() + domain.slice(1)}Error extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = '${domain.charAt(0).toUpperCase() + domain.slice(1)}Error';
    
    // Emit error event for admin monitoring
    setImmediate(() => {
      eventEmitter.emit('admin.error.occurred', {
        domain: '${domain}',
        error: {
          message: this.message,
          name: this.name,
          code: this.code
        },
        timestamp: new Date()
      });
    });
  }
}

const ${domain.charAt(0).toUpperCase() + domain.slice(1)}ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;`
      };
      
    case 'xp.service':
      return {
        imports: [
          "import { eventEmitter } from '@domains/notifications/event-notification-listener';"
        ],
        handler: `
// ${domain} XP operations via events
const ${domain}XpService = {
  async awardXp(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>) {
    eventEmitter.emit('xp.award', {
      userId,
      amount,
      reason,
      metadata
    });
  },
  
  async deductXp(userId: string, amount: number, reason: string, metadata?: Record<string, unknown>) {
    eventEmitter.emit('xp.award', {
      userId,
      amount: -amount,
      reason,
      metadata
    });
  }
};`
      };
      
    default:
      return { imports: [], handler: '// Unknown pattern - manual migration required' };
  }
}

/**
 * Apply migration to a single file
 */
function migrateFile(violations: ViolationMatch[]): boolean {
  if (violations.length === 0) return false;
  
  const filePath = violations[0].file;
  const domain = violations[0].domain;
  
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    const handlerGenerated = new Set<string>();
    
    // Process each violation
    for (const violation of violations) {
      const { imports, handler } = generateReplacement(violation);
      
      // Remove old import
      content = content.replace(violation.content, '');
      
      // Add new imports (deduplicated)
      const existingImports = content.match(/^import\s+.*$/gm) || [];
      for (const newImport of imports) {
        if (!existingImports.some(existing => existing.trim() === newImport.trim())) {
          const insertPoint = content.indexOf('\n\n') || content.indexOf('\n');
          content = content.slice(0, insertPoint) + '\n' + newImport + content.slice(insertPoint);
        }
      }
      
      // Add handler (once per file)
      const handlerKey = `${domain}-${violation.pattern}`;
      if (!handlerGenerated.has(handlerKey)) {
        const routerMatch = content.match(/const router.*?=/);
        if (routerMatch) {
          const insertPoint = content.indexOf(routerMatch[0]);
          content = content.slice(0, insertPoint) + handler + '\n\n' + content.slice(insertPoint);
          handlerGenerated.add(handlerKey);
        }
      }
      
      // Replace handler usage
      if (violation.pattern === 'admin.middleware') {
        content = content.replace(/asyncHandler/g, `${domain}AsyncHandler`);
      }
      
      modified = true;
    }
    
    if (modified) {
      if (!DRY_RUN) {
        writeFileSync(filePath, content);
      }
      migrationMetrics.violationsFixed += violations.length;
      return true;
    }
  } catch (error) {
    console.error(`Error migrating file ${filePath}:`, error);
    migrationMetrics.errors++;
  }
  
  return false;
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Boundary Violation Migration');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE MIGRATION'}`);
  console.log('─'.repeat(50));
  
  // Scan all files
  const files = getAllTSFiles(DOMAINS_DIR);
  console.log(`📁 Scanning ${files.length} TypeScript files...`);
  
  // Analyze violations
  const allViolations: ViolationMatch[] = [];
  for (const file of files) {
    const violations = analyzeFile(file);
    allViolations.push(...violations);
  }
  
  // Group by file
  const violationsByFile = new Map<string, ViolationMatch[]>();
  for (const violation of allViolations) {
    const existing = violationsByFile.get(violation.file) || [];
    existing.push(violation);
    violationsByFile.set(violation.file, existing);
  }
  
  console.log(`🔍 Found ${migrationMetrics.violationsFound} violations in ${violationsByFile.size} files`);
  
  if (VERBOSE) {
    console.log('\nViolation Summary:');
    const patternCounts = new Map<string, number>();
    for (const violation of allViolations) {
      patternCounts.set(violation.pattern, (patternCounts.get(violation.pattern) || 0) + 1);
    }
    for (const [pattern, count] of patternCounts) {
      console.log(`  ${pattern}: ${count} violations`);
    }
  }
  
  // Apply migrations
  let filesModified = 0;
  for (const [file, violations] of violationsByFile) {
    if (VERBOSE) {
      console.log(`\n📝 Processing: ${relative(SERVER_ROOT, file)}`);
      for (const violation of violations) {
        console.log(`  Line ${violation.line}: ${violation.pattern} (${violation.imports.join(', ')})`);
      }
    }
    
    if (migrateFile(violations)) {
      filesModified++;
      if (!VERBOSE) {
        process.stdout.write('.');
      }
    }
  }
  
  if (!VERBOSE) console.log(''); // New line after dots
  
  // Final summary
  const duration = Date.now() - migrationMetrics.startTime;
  console.log('\n✅ Migration Complete!');
  console.log('─'.repeat(50));
  console.log(`📊 Files scanned: ${migrationMetrics.filesScanned}`);
  console.log(`🔍 Violations found: ${migrationMetrics.violationsFound}`);
  console.log(`🔧 Violations fixed: ${migrationMetrics.violationsFixed}`);
  console.log(`📁 Files modified: ${filesModified}`);
  console.log(`❌ Errors: ${migrationMetrics.errors}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN: No files were actually modified');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\n🎯 Next Steps:');
    console.log('1. Add missing event schemas to event-notification-listener.ts');
    console.log('2. Create event handlers in respective domains'); 
    console.log('3. Run: pnpm typecheck');
    console.log('4. Test the migrated functionality');
  }
  
  // Exit with error code if there were errors
  if (migrationMetrics.errors > 0) {
    process.exit(1);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { runMigration, analyzeFile, migrateFile, MIGRATION_PATTERNS };