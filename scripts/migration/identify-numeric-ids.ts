#!/usr/bin/env tsx

/**
 * Numeric ID Detection Script (DETECT-ONLY)
 * 
 * Scans codebase for numeric ID patterns that need branded type conversion.
 * NEVER mutates files - pure detection for migration planning.
 */

import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface IdIssue {
  file: string;
  line: number;
  column: number;
  pattern: string;
  context: string;
  severity: 'critical' | 'high' | 'medium';
  suggestedType: string;
}

interface MigrationReport {
  timestamp: string;
  totalFiles: number;
  totalIssues: number;
  batches: {
    [batchName: string]: {
      files: string[];
      issues: IdIssue[];
      priority: number;
    };
  };
  summary: {
    critical: number;
    high: number;
    medium: number;
  };
}

// Patterns to detect (ordered by severity)
const NUMERIC_ID_PATTERNS = [
  {
    pattern: /\bid:\s*number\b/g,
    severity: 'critical' as const,
    description: 'Direct numeric ID',
    suggestedType: 'check entity context for correct branded type'
  },
  {
    pattern: /\buserId:\s*number\b/g,
    severity: 'critical' as const,
    description: 'Numeric user ID',
    suggestedType: 'UserId'
  },
  {
    pattern: /\bthreadId:\s*number\b/g,
    severity: 'critical' as const,
    description: 'Numeric thread ID',
    suggestedType: 'ThreadId'
  },
  {
    pattern: /\bpostId:\s*number\b/g,
    severity: 'critical' as const,
    description: 'Numeric post ID',
    suggestedType: 'PostId'
  },
  {
    pattern: /\bforumId:\s*number\b/g,
    severity: 'critical' as const,
    description: 'Numeric forum ID',
    suggestedType: 'ForumId'
  },
  {
    pattern: /\bwalletId:\s*number\b/g,
    severity: 'critical' as const,
    description: 'Numeric wallet ID',
    suggestedType: 'WalletId'
  },
  {
    pattern: /\btransactionId:\s*number\b/g,
    severity: 'high' as const,
    description: 'Numeric transaction ID',
    suggestedType: 'TransactionId'
  },
  {
    pattern: /\bcategoryId:\s*number\b/g,
    severity: 'medium' as const,
    description: 'Numeric category ID',
    suggestedType: 'CategoryId'
  },
  {
    pattern: /parseInt\(\s*[^)]*\.id\s*\)/g,
    severity: 'high' as const,
    description: 'Parsing ID as integer',
    suggestedType: 'remove parseInt, use branded type'
  },
  {
    pattern: /Number\(\s*[^)]*\.id\s*\)/g,
    severity: 'high' as const,
    description: 'Converting ID to number',
    suggestedType: 'remove Number(), use branded type'
  }
];

// Define migration batches (logical groupings)
const MIGRATION_BATCHES = {
  'client-types': {
    pattern: 'client/src/types/**/*.ts',
    priority: 1,
    description: 'Core client type definitions'
  },
  'client-hooks': {
    pattern: 'client/src/hooks/**/*.{ts,tsx}',
    priority: 2,
    description: 'React hooks layer'
  },
  'client-api': {
    pattern: 'client/src/{lib,core,features}/**/api*.{ts,tsx}',
    priority: 3,
    description: 'API client layer'
  },
  'client-components': {
    pattern: 'client/src/components/**/*.{ts,tsx}',
    priority: 4,
    description: 'React components'
  },
  'client-pages': {
    pattern: 'client/src/pages/**/*.{ts,tsx}',
    priority: 5,
    description: 'Page components'
  },
  'client-other': {
    pattern: 'client/src/**/*.{ts,tsx}',
    priority: 6,
    description: 'Other client files'
  },
  'server-types': {
    pattern: 'server/src/types/**/*.ts',
    priority: 7,
    description: 'Server type definitions'
  },
  'server-services': {
    pattern: 'server/src/services/**/*.ts',
    priority: 8,
    description: 'Business logic services (HIGH IMPACT)'
  },
  'server-routes': {
    pattern: 'server/src/routes/**/*.ts',
    priority: 9,
    description: 'API route handlers'
  },
  'server-repositories': {
    pattern: 'server/src/repositories/**/*.ts',
    priority: 10,
    description: 'Data access layer'
  },
  'server-middleware': {
    pattern: 'server/src/middleware/**/*.ts',
    priority: 11,
    description: 'Express middleware'
  },
  'server-other': {
    pattern: 'server/src/**/*.ts',
    priority: 12,
    description: 'Other server files'
  },
  'database': {
    pattern: 'db/**/*.ts',
    priority: 13,
    description: 'Database layer (should be clean)'
  }
};

function scanFile(filePath: string): IdIssue[] {
  const issues: IdIssue[] = [];
  
  // Early exit for unwanted files (performance optimization)
  if (filePath.includes('.backup.')) return issues;
  if (filePath.endsWith('.d.ts')) return issues;
  if (filePath.includes('/scripts/')) return issues;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const patternDef of NUMERIC_ID_PATTERNS) {
      let match;
      patternDef.pattern.lastIndex = 0; // Reset regex state
      
      while ((match = patternDef.pattern.exec(content)) !== null) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1];
        const column = match.index - content.lastIndexOf('\n', match.index - 1);
        
        // Skip comments and type definitions that are intentionally legacy
        if (line.includes('//') && line.includes('legacy')) continue;
        if (line.includes('LEGACY') || line.includes('TODO')) continue;
        
        // Skip inventory item IDs that should remain as numbers
        if (filePath.includes('/types/inventory') && line.includes('should be number')) continue;
        
        issues.push({
          file: filePath,
          line: lineNum,
          column,
          pattern: match[0],
          context: line.trim(),
          severity: patternDef.severity,
          suggestedType: patternDef.suggestedType
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan ${filePath}:`, error);
  }
  
  return issues;
}

async function detectNumericIds(): Promise<MigrationReport> {
  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    totalFiles: 0,
    totalIssues: 0,
    batches: {},
    summary: { critical: 0, high: 0, medium: 0 }
  };
  
  console.log('🔍 Scanning for numeric ID patterns...\n');
  
  // Process each batch
  for (const [batchName, batchConfig] of Object.entries(MIGRATION_BATCHES)) {
    console.log(`📁 Batch: ${batchName} (${batchConfig.description})`);
    
    const files = await glob(batchConfig.pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/build/**'] 
    });
    
    const batchIssues: IdIssue[] = [];
    
    for (const file of files) {
      const fileIssues = scanFile(file);
      batchIssues.push(...fileIssues);
      
      if (fileIssues.length > 0) {
        console.log(`   ⚠️  ${file}: ${fileIssues.length} issues`);
      }
    }
    
    report.batches[batchName] = {
      files,
      issues: batchIssues,
      priority: batchConfig.priority
    };
    
    report.totalFiles += files.length;
    report.totalIssues += batchIssues.length;
    
    // Update summary counts
    for (const issue of batchIssues) {
      report.summary[issue.severity]++;
    }
    
    console.log(`   📊 ${files.length} files, ${batchIssues.length} issues\n`);
  }
  
  return report;
}

async function main() {
  console.log('🚀 DegenTalk Numeric ID Migration - Detection Phase\n');
  
  const report = await detectNumericIds();
  
  // Ensure output directory exists
  const outputDir = 'scripts/migration/output';
  mkdirSync(outputDir, { recursive: true });
  
  // Write detailed report
  const reportPath = `${outputDir}/numeric-id-report.json`;
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Write summary
  const summaryPath = `${outputDir}/migration-summary.md`;
  const summary = generateSummaryMarkdown(report);
  writeFileSync(summaryPath, summary);
  
  // Console output
  console.log('📋 MIGRATION SUMMARY');
  console.log('===================');
  console.log(`Total files scanned: ${report.totalFiles}`);
  console.log(`Total issues found: ${report.totalIssues}`);
  console.log(`Critical: ${report.summary.critical}`);
  console.log(`High: ${report.summary.high}`);
  console.log(`Medium: ${report.summary.medium}\n`);
  
  console.log('📁 BATCH BREAKDOWN');
  console.log('==================');
  for (const [batchName, batch] of Object.entries(report.batches)) {
    if (batch.issues.length > 0) {
      console.log(`${batchName}: ${batch.issues.length} issues (Priority ${batch.priority})`);
    }
  }
  
  console.log(`\n📄 Reports saved:`);
  console.log(`   Detailed: ${reportPath}`);
  console.log(`   Summary: ${summaryPath}`);
  
  // Report critical issues but don't exit (for artifact regeneration)
  if (report.summary.critical > 0) {
    console.log(`\n⚠️ Found ${report.summary.critical} critical issues (expected during migration)`);
  }
  
  console.log('\n✅ Detection complete');
}

function generateSummaryMarkdown(report: MigrationReport): string {
  return `# Numeric ID Migration Report

Generated: ${report.timestamp}

## Summary
- **Total Files**: ${report.totalFiles}
- **Total Issues**: ${report.totalIssues}
- **Critical**: ${report.summary.critical}
- **High**: ${report.summary.high}  
- **Medium**: ${report.summary.medium}

## Migration Batches (Priority Order)

${Object.entries(report.batches)
  .sort(([,a], [,b]) => a.priority - b.priority)
  .map(([name, batch]) => `### ${name} (Priority ${batch.priority})
- Files: ${batch.files.length}
- Issues: ${batch.issues.length}
- Status: ${batch.issues.length === 0 ? '✅ Clean' : '⚠️ Needs migration'}

${batch.issues.length > 0 ? `Top issues:
${batch.issues.slice(0, 5).map(issue => 
  `- \`${issue.file}:${issue.line}\` - ${issue.pattern} → ${issue.suggestedType}`
).join('\n')}` : ''}
`).join('\n')}

## Next Steps
1. Start with Priority 1 batches (client-types)
2. Run targeted fix script for each batch
3. Update CI to prevent regressions
4. Validate with type checking and tests

## CI Integration
Add to your CI pipeline:
\`\`\`bash
npm run migration:check-ids
\`\`\`
`;
}

// ESM entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { detectNumericIds, NUMERIC_ID_PATTERNS, MIGRATION_BATCHES };