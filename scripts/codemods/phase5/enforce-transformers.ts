import { Project, SyntaxKind, CallExpression, PropertyAccessExpression } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Codemod: enforce-transformers
 * ----------------------------
 * Detects raw res.json() calls and suggests transformer usage
 * 
 * This codemod audits the codebase for violations of the transformer pattern
 * and provides specific suggestions for each domain.
 * 
 * Does NOT automatically fix (too risky) - provides actionable report
 * 
 * Usage:
 * - pnpm codemod:transformers
 * - pnpm codemod:transformers --fix-simple (auto-fix obvious cases)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

interface TransformerViolation {
  file: string;
  line: number;
  column: number;
  context: string;
  domain: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
  autoFixable: boolean;
}

export async function enforceTransformersCodemod(dryRun = false, fixSimple = false) {
  console.log(`🚀 Starting transformer enforcement audit ${dryRun ? '(DRY RUN)' : ''}`);
  
  const project = new Project({
    tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
  });
  
  // Focus on server-side route and controller files
  const filePaths = globSync('server/**/*.{ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.transformer.ts', // Skip transformer files themselves
      'server/src/core/**', // Skip core utilities  
      'server/src/middleware/**' // Skip middleware
    ]
  });

  const violations: TransformerViolation[] = [];
  const fixedFiles: string[] = [];
  let autoFixCount = 0;

  for (const relPath of filePaths) {
    try {
      const fullPath = path.join(projectRoot, relPath);
      const sourceFile = project.addSourceFileAtPath(fullPath);
      let fileModified = false;
      
      // Find res.json(), res.send(), and chained response calls
      sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
          const callExpr = node as CallExpression;
          const expression = callExpr.getExpression();
          
          // Pattern 1: res.json() or res.send()
          if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const object = propAccess.getExpression().getText().trim();
            const method = propAccess.getName();
            
            if (object === 'res' && (method === 'json' || method === 'send')) {
              violations.push(createViolation(sourceFile, node, relPath, 'direct'));
              
              // Auto-fix simple cases if requested
              if (fixSimple && !dryRun) {
                const fixed = attemptAutoFix(callExpr, violations[violations.length - 1], sourceFile);
                if (fixed) {
                  autoFixCount++;
                  fileModified = true;
                }
              }
            }
          }
          
          // Pattern 2: res.status(200).json() - chained calls
          if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const method = propAccess.getName();
            
            if (method === 'json' || method === 'send') {
              const chainObject = propAccess.getExpression();
              if (chainObject.getKind() === SyntaxKind.CallExpression) {
                const chainCall = chainObject as CallExpression;
                const chainExpr = chainCall.getExpression();
                
                if (chainExpr.getKind() === SyntaxKind.PropertyAccessExpression) {
                  const chainProp = chainExpr as PropertyAccessExpression;
                  const rootObject = chainProp.getExpression().getText().trim();
                  
                  if (rootObject === 'res') {
                    violations.push(createViolation(sourceFile, node, relPath, 'chained'));
                  }
                }
              }
            }
          }
        }
      });

      if (fileModified) {
        fixedFiles.push(relPath);
        await sourceFile.save();
      }
    } catch (error) {
      console.error(`Error processing ${relPath}:`, error);
    }
  }

  return {
    violations,
    autoFixCount,
    fixedFiles,
    summary: generateSummaryReport(violations, autoFixCount)
  };
}

function createViolation(sourceFile: any, node: any, relPath: string, type: string): TransformerViolation {
  const position = sourceFile.getLineAndColumnAtPos(node.getStart());
  const domain = extractDomainFromPath(relPath);
  const context = extractContextAroundNode(sourceFile, node);
  
  return {
    file: relPath,
    line: position.line,
    column: position.column,
    context: `${type}: ${context}`,
    domain,
    suggestion: getTransformerSuggestion(domain, relPath, context),
    severity: determineSeverity(domain, context),
    autoFixable: isAutoFixable(context)
  };
}

function extractDomainFromPath(filePath: string): string {
  // Extract domain from server/src/domains/[domain]/ structure
  const domainMatch = filePath.match(/server\/src\/domains\/([^\/]+)/);
  if (domainMatch) {
    return domainMatch[1];
  }
  
  // Extract from route patterns
  const routeMatch = filePath.match(/server\/src\/routes\/[^\/]*([^\/]+)/);
  if (routeMatch) {
    return routeMatch[1].replace('.routes', '').replace('.controller', '');
  }
  
  return 'unknown';
}

function extractContextAroundNode(sourceFile: any, node: any): string {
  const start = Math.max(0, node.getStart() - 100);
  const end = Math.min(sourceFile.getFullText().length, node.getEnd() + 100);
  return sourceFile.getFullText().slice(start, end).trim();
}

function getTransformerSuggestion(domain: string, filePath: string, context: string): string {
  // Mapping of domains to their transformer suggestions
  const transformerMap: Record<string, string[]> = {
    'users': [
      'UserTransformer.toPublicUser(user)',
      'UserTransformer.toAuthenticatedSelf(user)', 
      'UserTransformer.toAdminUserDetail(user)'
    ],
    'forum': [
      'ForumTransformer.toPublicThread(thread)',
      'ForumTransformer.toAuthenticatedThread(thread)', 
      'ForumTransformer.toPublicPost(post)',
      'ForumTransformer.toAdminThread(thread) // for admin endpoints'
    ],
    'wallet': [
      'EconomyTransformer.toTransaction(transaction)',
      'EconomyTransformer.toTransactionHistory(transactions)',
      'EconomyTransformer.toWalletBalance(wallet)'
    ],
    'shop': [
      'ShopTransformer.toPublicProduct(product)',
      'ShopTransformer.toAuthenticatedProduct(product)',
      'CosmeticsTransformer.toPublicCosmetic(cosmetic)'
    ],
    'gamification': [
      'CloutTransformer.toPublicAchievement(achievement)',
      'CloutTransformer.toAuthenticatedAchievement(achievement)',
      'CloutTransformer.toAdminAchievement(achievement)'
    ],
    'messaging': [
      'MessageTransformer.toPublicMessage(message)',
      'MessageTransformer.toAuthenticatedMessage(message)',
      'MessageTransformer.toPublicConversation(conversation)'
    ],
    'economy': [
      'EconomyTransformer.toTransaction(transaction)',
      'EconomyTransformer.toTransactionHistoryItem(transaction)'
    ],
    'admin': [
      '// Use appropriate domain transformer with .toAdmin*() method',
      '// Admin endpoints should use enhanced transformers with full data'
    ]
  };
  
  const suggestions = transformerMap[domain] || [`${domain}Transformer.toPublicX(data)`];
  
  // Try to infer specific suggestion from context
  if (context.includes('user')) return suggestions.find(s => s.includes('User')) || suggestions[0];
  if (context.includes('thread')) return suggestions.find(s => s.includes('Thread')) || suggestions[0];
  if (context.includes('post')) return suggestions.find(s => s.includes('Post')) || suggestions[0];
  if (context.includes('transaction')) return suggestions.find(s => s.includes('Transaction')) || suggestions[0];
  
  return suggestions[0];
}

function determineSeverity(domain: string, context: string): 'error' | 'warning' | 'info' {
  // Admin endpoints are less critical (often need raw data)
  if (domain === 'admin') return 'warning';
  
  // Public API endpoints are critical
  if (context.includes('router.get') || context.includes('app.get')) return 'error';
  
  // Development/testing endpoints are less critical
  if (context.includes('dev') || context.includes('test')) return 'info';
  
  return 'error';
}

function isAutoFixable(context: string): boolean {
  // Simple cases that can be auto-fixed
  return (
    context.includes('res.json(user)') ||
    context.includes('res.json(users)') ||
    context.includes('res.json(transaction)') ||
    context.includes('res.json(transactions)')
  );
}

function attemptAutoFix(callExpr: CallExpression, violation: TransformerViolation, sourceFile: any): boolean {
  try {
    const args = callExpr.getArguments();
    if (args.length !== 1) return false;
    
    const arg = args[0].getText();
    
    // Simple transformations
    if (arg === 'user') {
      callExpr.replaceWithText('res.json(UserTransformer.toPublicUser(user))');
      return true;
    }
    
    if (arg === 'users') {
      callExpr.replaceWithText('res.json(UserTransformer.toPublicUsers(users))');
      return true;
    }
    
    if (arg === 'transaction') {
      callExpr.replaceWithText('res.json(EconomyTransformer.toTransaction(transaction))');
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

function generateSummaryReport(violations: TransformerViolation[], autoFixCount: number): string {
  const totalViolations = violations.length;
  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;
  
  const domainBreakdown = violations.reduce((acc, v) => {
    acc[v.domain] = (acc[v.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let report = `\n📊 Transformer Enforcement Report\n`;
  report += `${'='.repeat(50)}\n`;
  report += `Total violations: ${totalViolations}\n`;
  report += `  - Errors: ${errorCount}\n`;
  report += `  - Warnings: ${warningCount}\n`;
  report += `  - Auto-fixed: ${autoFixCount}\n\n`;
  
  if (Object.keys(domainBreakdown).length > 0) {
    report += `Violations by domain:\n`;
    Object.entries(domainBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([domain, count]) => {
        report += `  - ${domain}: ${count}\n`;
      });
  }
  
  return report;
}

function generateDetailedReport(violations: TransformerViolation[]): void {
  if (violations.length === 0) {
    console.log('✅ No transformer violations found!');
    return;
  }

  console.log('\n🔍 Detailed Violation Report:');
  console.log('=' .repeat(80));
  
  violations.forEach((violation, index) => {
    const icon = violation.severity === 'error' ? '❌' : 
                 violation.severity === 'warning' ? '⚠️' : 'ℹ️';
    
    console.log(`\n${icon} Violation ${index + 1}:`);
    console.log(`   File: ${violation.file}:${violation.line}:${violation.column}`);
    console.log(`   Domain: ${violation.domain}`);
    console.log(`   Severity: ${violation.severity.toUpperCase()}`);
    console.log(`   Suggestion: ${violation.suggestion}`);
    console.log(`   Auto-fixable: ${violation.autoFixable ? 'Yes' : 'No'}`);
    
    if (violation.context.length < 200) {
      console.log(`   Context: ${violation.context.replace(/\s+/g, ' ')}`);
    }
  });
  
  console.log('\n💡 Fixing suggestions:');
  console.log('1. Import the appropriate transformer at the top of each file');
  console.log('2. Replace res.json(data) with res.json(Transformer.toMethod(data))');  
  console.log('3. Choose the right transformer method based on user permissions');
  console.log('4. Run `pnpm lint` and `pnpm typecheck` after fixes');
}

// CLI interface
if (typeof require !== 'undefined' && require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  const fixSimple = process.argv.includes('--fix-simple');
  const detailed = process.argv.includes('--detailed');
  
  enforceTransformersCodemod(dryRun, fixSimple).then(result => {
    console.log(result.summary);
    
    if (detailed) {
      generateDetailedReport(result.violations);
    } else if (result.violations.length > 0) {
      console.log('\n📝 Run with --detailed for full violation report');
      console.log('📝 Run with --fix-simple to auto-fix obvious cases');
    }
    
    if (result.autoFixCount > 0) {
      console.log(`\n✅ Auto-fixed ${result.autoFixCount} simple violations`);
      console.log('💡 Next steps:');
      console.log('  1. Review auto-fixed files for correctness');
      console.log('  2. Manually fix remaining violations');
      console.log('  3. Run `pnpm typecheck` to verify imports');
    }
    
    // Exit with error code if critical violations found
    const criticalViolations = result.violations.filter(v => v.severity === 'error');
    if (criticalViolations.length > 0) {
      console.log(`\n❌ ${criticalViolations.length} critical violations require attention`);
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Codemod failed:', error);
    process.exit(1);
  });
}