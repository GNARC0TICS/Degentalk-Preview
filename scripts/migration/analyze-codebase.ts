#!/usr/bin/env tsx

/**
 * DegenTalk Codebase Analysis Framework
 * 
 * Comprehensive analysis of code patterns, dependencies, and migration complexity.
 * Provides domain-by-domain insights for targeted refactoring strategy.
 */

import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { relative, dirname, basename } from 'path';

interface CodeFile {
  path: string;
  domain: string;
  subdomain?: string;
  layer: 'types' | 'services' | 'controllers' | 'routes' | 'middleware' | 'components' | 'hooks' | 'pages' | 'utils' | 'other';
  size: number;
  lines: number;
  complexity: number;
  dependencies: string[];
  exports: string[];
  idPatterns: IdPattern[];
  typeUsage: TypeUsage;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  migrationEffort: number; // 1-10 scale
}

interface IdPattern {
  type: 'definition' | 'usage' | 'conversion';
  pattern: string;
  line: number;
  context: string;
  suggestedFix: string;
  confidence: number; // 0-1
}

interface TypeUsage {
  hasAnyTypes: boolean;
  hasUnknownTypes: boolean;
  hasBrandedIds: boolean;
  hasNumericIds: boolean;
  hasTypeGuards: boolean;
  hasZodValidation: boolean;
  typeImports: string[];
}

interface DomainAnalysis {
  name: string;
  files: CodeFile[];
  totalIssues: number;
  avgComplexity: number;
  migrationEffort: number;
  dependencies: string[];
  dependents: string[];
  criticalPath: boolean;
  riskAssessment: {
    runtime: 'low' | 'medium' | 'high' | 'critical';
    testing: 'low' | 'medium' | 'high' | 'critical';
    integration: 'low' | 'medium' | 'high' | 'critical';
  };
  migrationStrategy: {
    priority: number;
    approach: 'atomic' | 'incremental' | 'parallel';
    estimatedDays: number;
    blockers: string[];
    prerequisites: string[];
  };
}

interface CodebaseAnalysis {
  timestamp: string;
  summary: {
    totalFiles: number;
    totalLines: number;
    totalIssues: number;
    domains: number;
    avgComplexity: number;
    migrationEstimate: number; // days
  };
  domains: DomainAnalysis[];
  dependencyGraph: Record<string, string[]>;
  migrationRoadmap: MigrationPhase[];
  riskMatrix: RiskAssessment[];
}

interface MigrationPhase {
  phase: number;
  name: string;
  duration: number; // days
  domains: string[];
  parallel: boolean;
  blockers: string[];
  deliverables: string[];
  successCriteria: string[];
}

interface RiskAssessment {
  domain: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  mitigation: string[];
  testingRequired: string[];
}

// Domain classification patterns
const DOMAIN_PATTERNS = {
  'user-management': [
    'user', 'profile', 'auth', 'session', 'settings'
  ],
  'forum-core': [
    'forum', 'thread', 'post', 'reaction', 'mention'
  ],
  'economy': [
    'wallet', 'transaction', 'tip', 'dgt', 'economy', 'payment'
  ],
  'gamification': [
    'xp', 'level', 'achievement', 'mission', 'leaderboard', 'badge'
  ],
  'cosmetics': [
    'cosmetic', 'frame', 'title', 'shop', 'inventory', 'sticker'
  ],
  'social': [
    'friend', 'message', 'notification', 'mention', 'subscription'
  ],
  'moderation': [
    'admin', 'moderator', 'report', 'ban', 'role', 'permission'
  ],
  'engagement': [
    'shoutbox', 'rain', 'airdrop', 'vault', 'engagement'
  ],
  'infrastructure': [
    'middleware', 'validation', 'cache', 'queue', 'backup'
  ]
};

// ID patterns for detection
const ID_PATTERNS = [
  { pattern: /\bid:\s*number\b/g, type: 'definition', severity: 'critical' },
  { pattern: /\buserId:\s*number\b/g, type: 'definition', severity: 'critical' },
  { pattern: /\bthreadId:\s*number\b/g, type: 'definition', severity: 'critical' },
  { pattern: /\bpostId:\s*number\b/g, type: 'definition', severity: 'critical' },
  { pattern: /parseInt\(\s*[^)]*\.id\s*\)/g, type: 'conversion', severity: 'high' },
  { pattern: /Number\(\s*[^)]*\.id\s*\)/g, type: 'conversion', severity: 'high' }
];

function classifyDomain(filePath: string): { domain: string; subdomain?: string; layer: string } {
  const path = filePath.toLowerCase();
  
  // Determine layer
  let layer = 'other';
  if (path.includes('/types/')) layer = 'types';
  else if (path.includes('/services/')) layer = 'services';
  else if (path.includes('/controllers/') || path.includes('.controller.')) layer = 'controllers';
  else if (path.includes('/routes/') || path.includes('.routes.')) layer = 'routes';
  else if (path.includes('/middleware/')) layer = 'middleware';
  else if (path.includes('/components/')) layer = 'components';
  else if (path.includes('/hooks/')) layer = 'hooks';
  else if (path.includes('/pages/')) layer = 'pages';
  else if (path.includes('/utils/') || path.includes('/lib/')) layer = 'utils';
  
  // Determine domain
  let domain = 'other';
  let subdomain: string | undefined;
  
  for (const [domainName, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    for (const pattern of patterns) {
      if (path.includes(pattern)) {
        domain = domainName;
        // Extract subdomain from path structure
        const segments = filePath.split('/');
        const domainIndex = segments.findIndex(s => s.toLowerCase().includes(pattern));
        if (domainIndex > 0 && domainIndex < segments.length - 1) {
          subdomain = segments[domainIndex + 1];
        }
        break;
      }
    }
    if (domain !== 'other') break;
  }
  
  // Special cases for server structure
  if (path.includes('server/src/domains/')) {
    const parts = filePath.split('/');
    const domainIndex = parts.findIndex(p => p === 'domains');
    if (domainIndex >= 0 && domainIndex < parts.length - 1) {
      domain = parts[domainIndex + 1];
      if (domainIndex < parts.length - 2) {
        subdomain = parts[domainIndex + 2];
      }
    }
  }
  
  return { domain, subdomain, layer: layer as any };
}

function analyzeFile(filePath: string): CodeFile {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const { domain, subdomain, layer } = classifyDomain(filePath);
  
  // Basic metrics
  const size = content.length;
  const lineCount = lines.length;
  
  // Complexity estimation (rough)
  const complexity = calculateComplexity(content);
  
  // Extract dependencies and exports
  const dependencies = extractDependencies(content);
  const exports = extractExports(content);
  
  // Analyze ID patterns
  const idPatterns = analyzeIdPatterns(content, lines);
  
  // Type usage analysis
  const typeUsage = analyzeTypeUsage(content);
  
  // Risk assessment
  const riskLevel = assessRisk(domain, layer, idPatterns.length, complexity);
  
  // Migration effort estimation
  const migrationEffort = estimateMigrationEffort(idPatterns, typeUsage, complexity);
  
  return {
    path: filePath,
    domain,
    subdomain,
    layer,
    size,
    lines: lineCount,
    complexity,
    dependencies,
    exports,
    idPatterns,
    typeUsage,
    riskLevel,
    migrationEffort
  };
}

function calculateComplexity(content: string): number {
  // Simple complexity metric based on control flow and nesting
  const controlFlow = (content.match(/\b(if|for|while|switch|try|catch)\b/g) || []).length;
  const functions = (content.match(/\b(function|=>|\basync\b)/g) || []).length;
  const classes = (content.match(/\bclass\b/g) || []).length;
  const nesting = calculateNesting(content);
  
  return Math.min(10, Math.round((controlFlow + functions * 2 + classes * 3 + nesting) / 10));
}

function calculateNesting(content: string): number {
  let maxNesting = 0;
  let currentNesting = 0;
  
  for (const char of content) {
    if (char === '{') {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    } else if (char === '}') {
      currentNesting--;
    }
  }
  
  return maxNesting;
}

function extractDependencies(content: string): string[] {
  const imports = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g) || [];
  const requires = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
  
  return [...imports, ...requires]
    .map(imp => {
      const match = imp.match(/['"`]([^'"`]+)['"`]/);
      return match ? match[1] : '';
    })
    .filter(Boolean)
    .filter(dep => !dep.startsWith('.') && !dep.startsWith('@types/'))
    .slice(0, 20); // Limit to avoid noise
}

function extractExports(content: string): string[] {
  const exports = [
    ...Array.from(content.matchAll(/export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g)),
    ...Array.from(content.matchAll(/export\s*{\s*([^}]+)\s*}/g))
  ];
  
  return exports
    .flatMap(match => {
      if (match[1].includes(',')) {
        return match[1].split(',').map(s => s.trim());
      }
      return [match[1]];
    })
    .filter(Boolean)
    .slice(0, 20); // Limit to avoid noise
}

function analyzeIdPatterns(content: string, lines: string[]): IdPattern[] {
  const patterns: IdPattern[] = [];
  
  for (const { pattern, type, severity } of ID_PATTERNS) {
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1]?.trim() || '';
      
      // Skip comments and intentionally legacy code
      if (line.includes('//') && (line.includes('legacy') || line.includes('TODO'))) continue;
      
      patterns.push({
        type: type as any,
        pattern: match[0],
        line: lineNum,
        context: line,
        suggestedFix: generateSuggestedFix(match[0]),
        confidence: calculateConfidence(match[0], line)
      });
    }
  }
  
  return patterns;
}

function generateSuggestedFix(pattern: string): string {
  if (pattern.includes('userId:')) return 'UserId';
  if (pattern.includes('threadId:')) return 'ThreadId';
  if (pattern.includes('postId:')) return 'PostId';
  if (pattern.includes('forumId:')) return 'ForumId';
  if (pattern.includes('walletId:')) return 'WalletId';
  if (pattern.includes('parseInt')) return 'remove parseInt, use branded type';
  if (pattern.includes('Number(')) return 'remove Number(), use branded type';
  return 'check entity context for correct branded type';
}

function calculateConfidence(pattern: string, context: string): number {
  let confidence = 0.5;
  
  // Higher confidence for specific ID types
  if (pattern.includes('userId') || pattern.includes('threadId')) confidence += 0.3;
  
  // Lower confidence for generic 'id'
  if (pattern === 'id: number' && !context.includes('interface')) confidence -= 0.2;
  
  // Higher confidence in interface definitions
  if (context.includes('interface') || context.includes('type')) confidence += 0.2;
  
  return Math.max(0.1, Math.min(1.0, confidence));
}

function analyzeTypeUsage(content: string): TypeUsage {
  return {
    hasAnyTypes: /\bany\b/.test(content) && !content.includes('// any'),
    hasUnknownTypes: /\bunknown\b/.test(content),
    hasBrandedIds: /UserId|ThreadId|PostId|ForumId|WalletId/.test(content),
    hasNumericIds: /\bid:\s*number\b/.test(content),
    hasTypeGuards: /\bis\w+\s*\(/i.test(content),
    hasZodValidation: /z\.|zod|schema/i.test(content),
    typeImports: extractTypeImports(content)
  };
}

function extractTypeImports(content: string): string[] {
  const typeImports = content.match(/import\s+type\s*{[^}]+}\s*from/g) || [];
  return typeImports
    .map(imp => imp.match(/{\s*([^}]+)\s*}/))?.[0]?.[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean) || [];
}

function assessRisk(domain: string, layer: string, issueCount: number, complexity: number): 'low' | 'medium' | 'high' | 'critical' {
  let riskScore = 0;
  
  // Domain risk factors
  if (['economy', 'user-management', 'moderation'].includes(domain)) riskScore += 3;
  else if (['forum-core', 'gamification'].includes(domain)) riskScore += 2;
  else riskScore += 1;
  
  // Layer risk factors
  if (['services', 'controllers', 'middleware'].includes(layer)) riskScore += 3;
  else if (['routes', 'types'].includes(layer)) riskScore += 2;
  else riskScore += 1;
  
  // Issue count factor
  if (issueCount > 10) riskScore += 3;
  else if (issueCount > 5) riskScore += 2;
  else if (issueCount > 0) riskScore += 1;
  
  // Complexity factor
  if (complexity > 7) riskScore += 2;
  else if (complexity > 4) riskScore += 1;
  
  if (riskScore >= 9) return 'critical';
  if (riskScore >= 6) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

function estimateMigrationEffort(patterns: IdPattern[], typeUsage: TypeUsage, complexity: number): number {
  let effort = 0;
  
  // Base effort from pattern count
  effort += patterns.length * 0.1;
  
  // Complexity multiplier
  effort += complexity * 0.2;
  
  // Type safety penalties
  if (typeUsage.hasAnyTypes) effort += 1;
  if (!typeUsage.hasBrandedIds && typeUsage.hasNumericIds) effort += 2;
  if (!typeUsage.hasTypeGuards) effort += 0.5;
  
  // Type safety bonuses
  if (typeUsage.hasZodValidation) effort -= 0.5;
  if (typeUsage.hasTypeGuards) effort -= 0.3;
  
  return Math.max(0.1, Math.min(10, effort));
}

async function analyzeCodebase(): Promise<CodebaseAnalysis> {
  console.log('🔍 Starting comprehensive codebase analysis...\n');
  
  const files = await glob('**/*.{ts,tsx}', {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      '**/coverage/**'
    ]
  });
  
  console.log(`📁 Found ${files.length} TypeScript files`);
  
  const analyzedFiles: CodeFile[] = [];
  const domains = new Map<string, CodeFile[]>();
  
  // Analyze each file
  for (let i = 0; i < files.length; i++) {
    if (i % 100 === 0) {
      console.log(`   Analyzing file ${i + 1}/${files.length}...`);
    }
    
    try {
      const file = analyzeFile(files[i]);
      analyzedFiles.push(file);
      
      if (!domains.has(file.domain)) {
        domains.set(file.domain, []);
      }
      domains.get(file.domain)!.push(file);
    } catch (error) {
      console.warn(`Warning: Could not analyze ${files[i]}:`, error);
    }
  }
  
  console.log('\n📊 Generating domain analyses...');
  
  // Generate domain analyses
  const domainAnalyses: DomainAnalysis[] = [];
  for (const [domainName, domainFiles] of domains) {
    const analysis = generateDomainAnalysis(domainName, domainFiles, analyzedFiles);
    domainAnalyses.push(analysis);
  }
  
  // Sort by priority/risk
  domainAnalyses.sort((a, b) => {
    const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aRisk = riskOrder[a.riskAssessment.runtime];
    const bRisk = riskOrder[b.riskAssessment.runtime];
    if (aRisk !== bRisk) return bRisk - aRisk;
    return b.totalIssues - a.totalIssues;
  });
  
  // Generate summary
  const summary = {
    totalFiles: analyzedFiles.length,
    totalLines: analyzedFiles.reduce((sum, f) => sum + f.lines, 0),
    totalIssues: analyzedFiles.reduce((sum, f) => sum + f.idPatterns.length, 0),
    domains: domains.size,
    avgComplexity: analyzedFiles.reduce((sum, f) => sum + f.complexity, 0) / analyzedFiles.length,
    migrationEstimate: domainAnalyses.reduce((sum, d) => sum + d.migrationStrategy.estimatedDays, 0)
  };
  
  // Generate roadmap and risk matrix
  const migrationRoadmap = generateMigrationRoadmap(domainAnalyses);
  const riskMatrix = generateRiskMatrix(domainAnalyses);
  const dependencyGraph = generateDependencyGraph(analyzedFiles);
  
  return {
    timestamp: new Date().toISOString(),
    summary,
    domains: domainAnalyses,
    dependencyGraph,
    migrationRoadmap,
    riskMatrix
  };
}

function generateDomainAnalysis(domainName: string, files: CodeFile[], allFiles: CodeFile[]): DomainAnalysis {
  const totalIssues = files.reduce((sum, f) => sum + f.idPatterns.length, 0);
  const avgComplexity = files.reduce((sum, f) => sum + f.complexity, 0) / files.length;
  const migrationEffort = files.reduce((sum, f) => sum + f.migrationEffort, 0);
  
  // Find dependencies and dependents
  const dependencies = new Set<string>();
  const dependents = new Set<string>();
  
  for (const file of files) {
    file.dependencies.forEach(dep => {
      if (dep.startsWith('@') || dep.startsWith('./') || dep.startsWith('../')) {
        dependencies.add(dep);
      }
    });
  }
  
  // Check if other domains depend on this one
  for (const otherFile of allFiles) {
    if (otherFile.domain !== domainName) {
      for (const dep of otherFile.dependencies) {
        if (dep.includes(domainName)) {
          dependents.add(otherFile.domain);
        }
      }
    }
  }
  
  // Assess if this is on critical path
  const criticalPath = ['user-management', 'forum-core', 'economy'].includes(domainName) || dependents.size > 3;
  
  // Risk assessment
  const maxRisk = files.reduce((max, f) => {
    const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return Math.max(max, riskOrder[f.riskLevel]);
  }, 0);
  
  const riskLevel = ['low', 'medium', 'high', 'critical'][maxRisk - 1] as any;
  
  return {
    name: domainName,
    files,
    totalIssues,
    avgComplexity,
    migrationEffort,
    dependencies: Array.from(dependencies),
    dependents: Array.from(dependents),
    criticalPath,
    riskAssessment: {
      runtime: riskLevel,
      testing: totalIssues > 20 ? 'high' : totalIssues > 10 ? 'medium' : 'low',
      integration: dependents.size > 3 ? 'high' : dependents.size > 1 ? 'medium' : 'low'
    },
    migrationStrategy: {
      priority: criticalPath ? (maxRisk > 2 ? 1 : 2) : (maxRisk > 3 ? 2 : 3),
      approach: totalIssues > 50 ? 'incremental' : totalIssues > 20 ? 'parallel' : 'atomic',
      estimatedDays: Math.ceil(migrationEffort / 5), // 5 effort units per day
      blockers: dependents.size > 0 ? [`Dependencies from: ${Array.from(dependents).join(', ')}`] : [],
      prerequisites: dependencies.length > 0 ? [`Requires: ${dependencies.slice(0, 3).join(', ')}`] : []
    }
  };
}

function generateMigrationRoadmap(domains: DomainAnalysis[]): MigrationPhase[] {
  const phases: MigrationPhase[] = [];
  const processed = new Set<string>();
  
  // Phase 1: Critical path, low dependency domains
  const phase1Domains = domains.filter(d => 
    d.riskAssessment.runtime === 'critical' && d.dependents.length === 0
  );
  
  if (phase1Domains.length > 0) {
    phases.push({
      phase: 1,
      name: 'Critical Foundation',
      duration: Math.max(...phase1Domains.map(d => d.migrationStrategy.estimatedDays)),
      domains: phase1Domains.map(d => d.name),
      parallel: false,
      blockers: [],
      deliverables: ['Type-safe core services', 'Runtime validation', 'Zero critical issues'],
      successCriteria: ['All tests pass', 'No type errors', 'API contracts maintained']
    });
    phase1Domains.forEach(d => processed.add(d.name));
  }
  
  // Phase 2: High-risk domains with resolved dependencies
  const phase2Domains = domains.filter(d => 
    !processed.has(d.name) && 
    (d.riskAssessment.runtime === 'high' || d.criticalPath)
  );
  
  if (phase2Domains.length > 0) {
    phases.push({
      phase: 2,
      name: 'Core Systems',
      duration: Math.max(...phase2Domains.map(d => d.migrationStrategy.estimatedDays)),
      domains: phase2Domains.map(d => d.name),
      parallel: true,
      blockers: phase1Domains.map(d => d.name),
      deliverables: ['Domain type safety', 'Integration tests', 'Performance validation'],
      successCriteria: ['End-to-end tests pass', 'No runtime type errors', 'Performance maintained']
    });
    phase2Domains.forEach(d => processed.add(d.name));
  }
  
  // Phase 3: Medium-risk domains
  const phase3Domains = domains.filter(d => 
    !processed.has(d.name) && d.riskAssessment.runtime === 'medium'
  );
  
  if (phase3Domains.length > 0) {
    phases.push({
      phase: 3,
      name: 'Extended Systems',
      duration: Math.max(...phase3Domains.map(d => d.migrationStrategy.estimatedDays)),
      domains: phase3Domains.map(d => d.name),
      parallel: true,
      blockers: [...phase1Domains, ...phase2Domains].map(d => d.name),
      deliverables: ['Complete type coverage', 'Documentation updates'],
      successCriteria: ['All domains type-safe', 'Documentation complete']
    });
    phase3Domains.forEach(d => processed.add(d.name));
  }
  
  // Phase 4: Low-risk cleanup
  const phase4Domains = domains.filter(d => !processed.has(d.name));
  
  if (phase4Domains.length > 0) {
    phases.push({
      phase: 4,
      name: 'Final Cleanup',
      duration: Math.max(...phase4Domains.map(d => d.migrationStrategy.estimatedDays)),
      domains: phase4Domains.map(d => d.name),
      parallel: true,
      blockers: [],
      deliverables: ['100% type safety', 'Code quality improvements'],
      successCriteria: ['Zero type issues', 'ESLint rules enforced']
    });
  }
  
  return phases;
}

function generateRiskMatrix(domains: DomainAnalysis[]): RiskAssessment[] {
  return domains.map(domain => ({
    domain: domain.name,
    risk: domain.riskAssessment.runtime,
    factors: [
      `${domain.totalIssues} ID issues`,
      `${domain.files.length} files`,
      `${domain.dependents.length} dependents`,
      `Complexity: ${domain.avgComplexity.toFixed(1)}`
    ],
    mitigation: [
      domain.migrationStrategy.approach === 'atomic' ? 'Single-shot migration' : 'Incremental migration',
      'Comprehensive testing',
      'Feature flags for rollback',
      'Dependency isolation'
    ],
    testingRequired: [
      'Unit tests for all changed functions',
      'Integration tests for API contracts',
      domain.criticalPath ? 'End-to-end critical path tests' : 'Smoke tests',
      'Performance regression tests'
    ]
  }));
}

function generateDependencyGraph(files: CodeFile[]): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  
  for (const file of files) {
    if (!graph[file.domain]) {
      graph[file.domain] = [];
    }
    
    for (const dep of file.dependencies) {
      // Find which domain this dependency belongs to
      const depDomain = files.find(f => 
        dep.includes(f.domain) || f.path.includes(dep.replace(/^[@./]+/, ''))
      )?.domain;
      
      if (depDomain && depDomain !== file.domain && !graph[file.domain].includes(depDomain)) {
        graph[file.domain].push(depDomain);
      }
    }
  }
  
  return graph;
}

async function main() {
  console.log('🚀 DegenTalk Codebase Analysis\n');
  
  const analysis = await analyzeCodebase();
  
  // Ensure output directory
  const outputDir = 'scripts/migration/output';
  mkdirSync(outputDir, { recursive: true });
  
  // Write comprehensive analysis
  writeFileSync(
    `${outputDir}/codebase-analysis.json`,
    JSON.stringify(analysis, null, 2)
  );
  
  // Write migration roadmap
  writeFileSync(
    `${outputDir}/migration-roadmap.md`,
    generateRoadmapMarkdown(analysis)
  );
  
  // Write domain reports
  for (const domain of analysis.domains) {
    writeFileSync(
      `${outputDir}/domain-${domain.name}.json`,
      JSON.stringify(domain, null, 2)
    );
  }
  
  // Console summary
  console.log('\n📋 CODEBASE ANALYSIS COMPLETE');
  console.log('===============================');
  console.log(`Files analyzed: ${analysis.summary.totalFiles}`);
  console.log(`Total lines: ${analysis.summary.totalLines.toLocaleString()}`);
  console.log(`ID issues found: ${analysis.summary.totalIssues}`);
  console.log(`Domains identified: ${analysis.summary.domains}`);
  console.log(`Migration estimate: ${analysis.summary.migrationEstimate} days`);
  
  console.log('\n🎯 TOP PRIORITY DOMAINS');
  console.log('=======================');
  analysis.domains.slice(0, 5).forEach((domain, i) => {
    console.log(`${i + 1}. ${domain.name}`);
    console.log(`   Issues: ${domain.totalIssues}, Risk: ${domain.riskAssessment.runtime}`);
    console.log(`   Effort: ${domain.migrationStrategy.estimatedDays} days, Approach: ${domain.migrationStrategy.approach}`);
  });
  
  console.log(`\n📄 Reports generated in ${outputDir}/`);
  console.log('   - codebase-analysis.json (full analysis)');
  console.log('   - migration-roadmap.md (strategic overview)');
  console.log('   - domain-*.json (detailed domain reports)');
}

function generateRoadmapMarkdown(analysis: CodebaseAnalysis): string {
  return `# DegenTalk Migration Roadmap

Generated: ${analysis.timestamp}

## Executive Summary

- **Total Files**: ${analysis.summary.totalFiles.toLocaleString()}
- **Total Lines**: ${analysis.summary.totalLines.toLocaleString()}
- **ID Issues**: ${analysis.summary.totalIssues}
- **Domains**: ${analysis.summary.domains}
- **Estimated Duration**: ${analysis.summary.migrationEstimate} days

## Migration Phases

${analysis.migrationRoadmap.map(phase => `
### Phase ${phase.phase}: ${phase.name}
- **Duration**: ${phase.duration} days
- **Domains**: ${phase.domains.join(', ')}
- **Parallel**: ${phase.parallel ? 'Yes' : 'No'}
- **Blockers**: ${phase.blockers.length > 0 ? phase.blockers.join(', ') : 'None'}

**Deliverables:**
${phase.deliverables.map(d => `- ${d}`).join('\n')}

**Success Criteria:**
${phase.successCriteria.map(c => `- ${c}`).join('\n')}
`).join('\n')}

## Domain Priority Matrix

| Domain | Issues | Risk | Effort | Dependents | Strategy |
|--------|--------|------|--------|------------|----------|
${analysis.domains.map(d => 
  `| ${d.name} | ${d.totalIssues} | ${d.riskAssessment.runtime} | ${d.migrationStrategy.estimatedDays}d | ${d.dependents.length} | ${d.migrationStrategy.approach} |`
).join('\n')}

## Risk Assessment

${analysis.riskMatrix.filter(r => r.risk === 'critical' || r.risk === 'high').map(risk => `
### ${risk.domain} (${risk.risk.toUpperCase()} RISK)

**Risk Factors:**
${risk.factors.map(f => `- ${f}`).join('\n')}

**Mitigation:**
${risk.mitigation.map(m => `- ${m}`).join('\n')}

**Testing Required:**
${risk.testingRequired.map(t => `- ${t}`).join('\n')}
`).join('\n')}

## Dependency Graph

${Object.entries(analysis.dependencyGraph).map(([domain, deps]) => 
  `- **${domain}** depends on: ${deps.length > 0 ? deps.join(', ') : 'none'}`
).join('\n')}

## Implementation Strategy

1. **Start with Phase 1** (Critical Foundation) - zero dependencies
2. **Run comprehensive tests** after each domain migration
3. **Use feature flags** for risky changes
4. **Maintain API contracts** throughout migration
5. **Document breaking changes** and provide migration guides

## Success Metrics

- [ ] Zero \`any\` types in production code
- [ ] 100% branded ID usage
- [ ] All API contracts type-safe
- [ ] Comprehensive test coverage maintained
- [ ] Performance benchmarks maintained
- [ ] Zero runtime type errors

---

*Generated by DegenTalk Migration Analysis Tool*
`;
}

// ESM entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeCodebase, CodebaseAnalysis, DomainAnalysis };