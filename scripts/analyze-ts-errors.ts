#!/usr/bin/env tsx
/**
 * TypeScript Error Analysis Script
 * 
 * Analyzes TypeScript errors and generates reports for tracking progress
 * Usage: pnpm tsx scripts/analyze-ts-errors.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ErrorInfo {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  category?: string;
}

interface ErrorReport {
  timestamp: string;
  totalErrors: number;
  byCode: Record<string, number>;
  byFile: Record<string, number>;
  byCategory: Record<string, ErrorInfo[]>;
  errors: ErrorInfo[];
}

// TypeScript error code descriptions
const ERROR_CODES: Record<string, string> = {
  'TS2339': 'Property does not exist',
  'TS2322': 'Type not assignable',
  'TS2345': 'Argument type mismatch',
  'TS2554': 'Expected X arguments, but got Y',
  'TS2559': 'Type has no properties in common',
  'TS2769': 'No overload matches this call',
  'TS2740': 'Type is missing properties',
  'TS2305': 'Module has no exported member',
  'TS2307': 'Cannot find module',
  'TS2551': 'Property does not exist (did you mean X?)',
  'TS2552': 'Cannot find name (did you mean X?)',
  'TS2353': 'Object literal may only specify known properties',
  'TS2739': 'Type is missing properties',
  'TS2352': 'Conversion may be a mistake'
};

function parseTypeScriptErrors(output: string): ErrorInfo[] {
  const errors: ErrorInfo[] = [];
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    
    if (match) {
      const [, file, lineNum, column, code, message] = match;
      errors.push({
        file: file.replace(process.cwd() + '/', ''),
        line: parseInt(lineNum),
        column: parseInt(column),
        code,
        message,
        category: categorizeError(code, message)
      });
    }
  }
  
  return errors;
}

function categorizeError(code: string, message: string): string {
  if (code === 'TS2339' || code === 'TS2551') {
    if (message.includes('does not exist on type \'unknown\'')) {
      return 'API Response Type';
    }
    if (message.includes('MissionStreak') || message.includes('Mission')) {
      return 'Mission Types';
    }
    if (message.includes('User')) {
      return 'User Types';
    }
    if (message.includes('does not exist on type')) {
      return 'Missing Property';
    }
  }
  
  if (code === 'TS2322' || code === 'TS2345') {
    if (message.includes('UseMutationResult') || message.includes('UseQueryResult')) {
      return 'React Query Types';
    }
    if (message.includes('SVGProps')) {
      return 'Component Props';
    }
  }
  
  if (code === 'TS2554' || code === 'TS2769') {
    return 'Function Arguments';
  }
  
  if (code === 'TS2307' || code === 'TS2305') {
    return 'Import/Export';
  }
  
  return 'Other';
}

function generateReport(errors: ErrorInfo[]): ErrorReport {
  const report: ErrorReport = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    byCode: {},
    byFile: {},
    byCategory: {},
    errors
  };
  
  // Group by error code
  errors.forEach(error => {
    report.byCode[error.code] = (report.byCode[error.code] || 0) + 1;
    report.byFile[error.file] = (report.byFile[error.file] || 0) + 1;
    
    if (!report.byCategory[error.category || 'Other']) {
      report.byCategory[error.category || 'Other'] = [];
    }
    report.byCategory[error.category || 'Other'].push(error);
  });
  
  return report;
}

function generateMarkdownSummary(report: ErrorReport): string {
  let md = `# TypeScript Error Report\n\n`;
  md += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  md += `## Summary\n\n`;
  md += `**Total Errors**: ${report.totalErrors}\n\n`;
  
  md += `### Errors by Category\n\n`;
  md += `| Category | Count | Percentage |\n`;
  md += `|----------|-------|------------|\n`;
  
  Object.entries(report.byCategory)
    .sort(([, a], [, b]) => b.length - a.length)
    .forEach(([category, errors]) => {
      const percentage = ((errors.length / report.totalErrors) * 100).toFixed(1);
      md += `| ${category} | ${errors.length} | ${percentage}% |\n`;
    });
  
  md += `\n### Errors by Type\n\n`;
  md += `| Code | Description | Count |\n`;
  md += `|------|-------------|-------|\n`;
  
  Object.entries(report.byCode)
    .sort(([, a], [, b]) => b - a)
    .forEach(([code, count]) => {
      md += `| ${code} | ${ERROR_CODES[code] || 'Unknown'} | ${count} |\n`;
    });
  
  md += `\n### Files with Most Errors\n\n`;
  md += `| File | Error Count |\n`;
  md += `|------|-------------|\n`;
  
  Object.entries(report.byFile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count]) => {
      md += `| ${file} | ${count} |\n`;
    });
  
  return md;
}

function main() {
  console.log('🔍 Analyzing TypeScript errors...\n');
  
  try {
    // Run typecheck and capture output
    const output = execSync('pnpm typecheck', { 
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..', 'client')
    }).toString();
    
    console.log('✅ No TypeScript errors found!');
    return;
  } catch (error: any) {
    // TypeScript errors cause non-zero exit code
    const output = error.stdout?.toString() || '';
    const errors = parseTypeScriptErrors(output);
    const report = generateReport(errors);
    
    // Save JSON report
    const reportsDir = path.join(__dirname, 'error-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(reportsDir, `errors-${timestamp}.json`);
    const mdPath = path.join(reportsDir, `errors-${timestamp}.md`);
    const latestPath = path.join(reportsDir, 'latest.md');
    
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`📊 JSON report saved to: ${jsonPath}`);
    
    // Generate and save markdown summary
    const markdown = generateMarkdownSummary(report);
    fs.writeFileSync(mdPath, markdown);
    fs.writeFileSync(latestPath, markdown); // Also save as latest
    console.log(`📝 Markdown summary saved to: ${mdPath}`);
    
    // Print summary to console
    console.log('\n' + '='.repeat(60));
    console.log(`Total Errors: ${report.totalErrors}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('Top Error Categories:');
    Object.entries(report.byCategory)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 5)
      .forEach(([category, errors]) => {
        console.log(`  ${category}: ${errors.length} errors`);
      });
    
    // Exit with error code to indicate errors exist
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { parseTypeScriptErrors, generateReport, generateMarkdownSummary };