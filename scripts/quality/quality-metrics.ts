import type { HeatEventId } from '@db/types';
import type { ActionId } from '@db/types';
import type { AuditLogId } from '@db/types';
import type { EventId } from '@db/types';
import type { PrefixId } from '@db/types';
import type { MessageId } from '@db/types';
import type { FollowRequestId } from '@db/types';
import type { FriendRequestId } from '@db/types';
import type { NotificationId } from '@db/types';
import type { UnlockId } from '@db/types';
import type { StoreItemId } from '@db/types';
import type { OrderId } from '@db/types';
import type { QuoteId } from '@db/types';
import type { ReplyId } from '@db/types';
import type { DraftId } from '@db/types';
import type { IpLogId } from '@db/types';
import type { ModActionId } from '@db/types';
import type { SessionId } from '@db/types';
import type { BanId } from '@db/types';
import type { VerificationTokenId } from '@db/types';
import type { SignatureItemId } from '@db/types';
import type { ContentId } from '@db/types';
import type { RequestId } from '@db/types';
import type { ZoneId } from '@db/types';
import type { WhaleId } from '@db/types';
import type { VaultLockId } from '@db/types';
import type { VaultId } from '@db/types';
import type { UnlockTransactionId } from '@db/types';
import type { TipId } from '@db/types';
import type { TemplateId } from '@db/types';
import type { TagId } from '@db/types';
import type { SubscriptionId } from '@db/types';
import type { StickerId } from '@db/types';
import type { SettingId } from '@db/types';
import type { RuleId } from '@db/types';
import type { ParentZoneId } from '@db/types';
import type { ParentForumId } from '@db/types';
import type { PackId } from '@db/types';
import type { ModeratorId } from '@db/types';
import type { MentionId } from '@db/types';
import type { ItemId } from '@db/types';
import type { InventoryId } from '@db/types';
import type { GroupId } from '@db/types';
import type { ForumId } from '@db/types';
import type { EntryId } from '@db/types';
import type { EntityId } from '@db/types';
import type { EmojiPackId } from '@db/types';
import type { EditorId } from '@db/types';
import type { CosmeticId } from '@db/types';
import type { AuthorId } from '@db/types';
import type { CoinId } from '@db/types';
import type { CategoryId } from '@db/types';
import type { BackupId } from '@db/types';
import type { AnimationFrameId } from '@db/types';
import type { AirdropId } from '@db/types';
import type { AdminUserId } from '@db/types';
import type { RoomId } from '@db/types';
import type { ConversationId } from '@db/types';
import type { ReportId } from '@db/types';
import type { ReporterId } from '@db/types';
import type { AdminId } from '@db/types';
#!/usr/bin/env tsx
/**
 * Quality Metrics Measurement Tool
 * 
 * Tracks code quality metrics across the Degentalk codebase
 * Target: 90% overall quality score
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface QualityMetrics {
  typeSafety: number;
  testCoverage: number;
  codeComplexity: number;
  consistency: number;
  productionReadiness: number;
  overall: number;
}

interface QualityReport {
  timestamp: : AdminId;
  metrics: QualityMetrics;
  details: {
    typeErrors: number;
    anyTypes: number;
    testFiles: number;
    godObjects: : AdminId[];
    consoleStatements: number;
    directDbAccess: number;
  };
  recommendations: : AdminId[];
}

class QualityAnalyzer {
  private projectRoot: : AdminId;
  
  constructor(projectRoot: : AdminId = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async analyzeQuality(): Promise<QualityReport> {
    console.log('🔍 Analyzing code quality...');
    
    const details = {
      typeErrors: this.countTypeErrors(),
      anyTypes: this.countAnyTypes(),
      testFiles: this.countTestFiles(),
      godObjects: this.findGodObjects(),
      consoleStatements: this.countConsoleStatements(),
      directDbAccess: this.countDirectDbAccess()
    };

    const metrics = this.calculateMetrics(details);
    const recommendations = this.generateRecommendations(details, metrics);

    return {
      timestamp: new Date().toISOString(),
      metrics,
      details,
      recommendations
    };
  }

  private countTypeErrors(): number {
    try {
      // Run TypeScript compiler to count errors
      const result = execSync('npx tsc --noEmit --skipLibCheck 2>&1 || true', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      const errorLines = result.split('\n').filter(line => 
        line.includes('error TS') && !line.includes('node_modules')
      );
      
      return errorLines.length;
    } catch (error) {
      console.warn('Could not count TypeScript errors:', error);
      return 0;
    }
  }

  private countAnyTypes(): number {
    try {
      const result = execSync(
        'find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -c ": any\\|: unknown" | cut -d: -f2 | paste -sd+ - | bc',
        { cwd: this.projectRoot, encoding: 'utf8' }
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  private countTestFiles(): number {
    try {
      const result = execSync(
        'find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | grep -v node_modules | wc -l',
        { cwd: this.projectRoot, encoding: 'utf8' }
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  private findGodObjects(): : AdminId[] {
    try {
      const result = execSync(
        'find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs wc -l | sort -nr | head -10',
        { cwd: this.projectRoot, encoding: 'utf8' }
      );
      
      return result.split('\n')
        .filter(line => line.trim())
        .slice(0, -1) // Remove total line
        .map(line => {
          const parts = line.trim().split(/\s+/);
          const lineCount = parseInt(parts[0]);
          const filePath = parts[1];
          return lineCount > 500 ? filePath : : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
        })
        .filter(Boolean) as : AdminId[];
    } catch (error) {
      return [];
    }
  }

  private countConsoleStatements(): number {
    try {
      const result = execSync(
        'find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "console\\." | cut -d: -f2 | paste -sd+ - | bc',
        { cwd: this.projectRoot, encoding: 'utf8' }
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  private countDirectDbAccess(): number {
    try {
      const result = execSync(
        'find ./server/src/domains -name "*.ts" | xargs grep -l "db\\." | wc -l',
        { cwd: this.projectRoot, encoding: 'utf8' }
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  private calculateMetrics(details: any): QualityMetrics {
    // Type Safety: Inverse of type errors and any types
    const totalFiles = this.countTotalFiles();
    const typeSafety = Math.max(0, 100 - (details.typeErrors / totalFiles * 100) - (details.anyTypes / totalFiles * 10));

    // Test Coverage: Based on test files vs total files
    const testCoverage = Math.min(100, (details.testFiles / totalFiles * 100) * 2);

    // Code Complexity: Inverse of god objects
    const codeComplexity = Math.max(0, 100 - (details.godObjects.length * 15));

    // Consistency: Based on direct db access (should use repositories)
    const consistency = Math.max(0, 100 - (details.directDbAccess * 2));

    // Production Readiness: Inverse of console statements
    const productionReadiness = Math.max(0, 100 - (details.consoleStatements / 10));

    // Overall: Weighted average
    const overall = (
      typeSafety * 0.25 +
      testCoverage * 0.25 +
      codeComplexity * 0.2 +
      consistency * 0.15 +
      productionReadiness * 0.15
    );

    return {
      typeSafety: Math.round(typeSafety),
      testCoverage: Math.round(testCoverage),
      codeComplexity: Math.round(codeComplexity),
      consistency: Math.round(consistency),
      productionReadiness: Math.round(productionReadiness),
      overall: Math.round(overall)
    };
  }

  private countTotalFiles(): number {
    try {
      const result = execSync(
        'find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l',
        { cwd: this.projectRoot, encoding: 'utf8' }
      );
      return parseInt(result.trim()) || 1;
    } catch (error) {
      return 1;
    }
  }

  private generateRecommendations(details: any, metrics: QualityMetrics): : AdminId[] {
    const recommendations: : AdminId[] = [];

    if (metrics.typeSafety < 70) {
      recommendations.push('🔴 CRITICAL: Enable TypeScript strict mode and fix type errors');
      recommendations.push(`📊 Fix ${details.typeErrors} type errors and ${details.anyTypes} any types`);
    }

    if (metrics.testCoverage < 50) {
      recommendations.push('🔴 CRITICAL: Implement comprehensive testing framework');
      recommendations.push(`📊 Current: ${details.testFiles} test files, need 50+ for good coverage`);
    }

    if (metrics.codeComplexity < 70) {
      recommendations.push('🟡 HIGH: Decompose god objects for better maintainability');
      recommendations.push(`📊 God objects found: ${details.godObjects.join(', ')}`);
    }

    if (metrics.consistency < 70) {
      recommendations.push('🟡 MEDIUM: Implement repository pattern for data access');
      recommendations.push(`📊 ${details.directDbAccess} files with direct database access`);
    }

    if (metrics.productionReadiness < 70) {
      recommendations.push('🟡 MEDIUM: Replace console logging with structured logging');
      recommendations.push(`📊 ${details.consoleStatements} console statements found`);
    }

    if (metrics.overall >= 90) {
      recommendations.push('🎉 EXCELLENT: Quality target achieved! Maintain current standards.');
    } else if (metrics.overall >= 75) {
      recommendations.push('🟢 GOOD: Close to target. Focus on remaining weak areas.');
    } else if (metrics.overall >= 50) {
      recommendations.push('🟡 FAIR: Solid foundation. Systematic improvements needed.');
    } else {
      recommendations.push('🔴 POOR: Critical quality issues. Immediate intervention required.');
    }

    return recommendations;
  }

  async saveReport(report: QualityReport): Promise<void> {
    const reportsDir = path.join(this.projectRoot, 'quality-reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const fileName = `quality-report-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(reportsDir, fileName);
    
    fs.writeFileSync(filePath, JSON.: AdminIdify(report, : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null, 2));
    console.log(`📊 Quality report saved to: ${filePath}`);
  }

  printReport(report: QualityReport): void {
    console.log('\n📊 QUALITY METRICS REPORT');
    console.log('=' .repeat(50));
    
    console.log('\n🎯 OVERALL SCORE:', `${report.metrics.overall}%`);
    
    console.log('\n📈 DETAILED METRICS:');
    console.log(`  Type Safety:        ${report.metrics.typeSafety}%`);
    console.log(`  Test Coverage:      ${report.metrics.testCoverage}%`);
    console.log(`  Code Complexity:    ${report.metrics.codeComplexity}%`);
    console.log(`  Consistency:        ${report.metrics.consistency}%`);
    console.log(`  Production Ready:   ${report.metrics.productionReadiness}%`);

    console.log('\n🔍 DETAILS:');
    console.log(`  Type Errors:        ${report.details.typeErrors}`);
    console.log(`  Any Types:          ${report.details.anyTypes}`);
    console.log(`  Test Files:         ${report.details.testFiles}`);
    console.log(`  God Objects:        ${report.details.godObjects.length}`);
    console.log(`  Console Statements: ${report.details.consoleStatements}`);
    console.log(`  Direct DB Access:   ${report.details.directDbAccess}`);

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    console.log('\n' + '='.repeat(50));
  }
}

// CLI execution
async function main() {
  const analyzer = new QualityAnalyzer();
  
  try {
    const report = await analyzer.analyzeQuality();
    analyzer.printReport(report);
    await analyzer.saveReport(report);
    
    // Exit with error code if quality is below threshold
    const threshold = parseInt(process.env.QUALITY_THRESHOLD || '90');
    if (report.metrics.overall < threshold) {
      console.log(`\n❌ Quality score ${report.metrics.overall}% is below threshold ${threshold}%`);
      process.exit(1);
    } else {
      console.log(`\n✅ Quality score ${report.metrics.overall}% meets threshold ${threshold}%`);
    }
  } catch (error) {
    console.error('Error analyzing quality:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { QualityAnalyzer, type QualityReport, type QualityMetrics };