/**
 * E2E Test Analytics Reporter
 * Comprehensive reporting and analytics for behavioral flow verification tests
 */

import { FullResult, TestCase, TestResult, Reporter } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from "../../../server/src/core/logger";

export interface TestAnalytics {
	summary: {
		totalTests: number;
		passed: number;
		failed: number;
		skipped: number;
		duration: number;
		startTime: string;
		endTime: string;
	};
	behaviorMetrics: {
		userJourneyTests: UserJourneyMetric[];
		crossDomainTests: CrossDomainMetric[];
		performanceMetrics: PerformanceMetric[];
	};
	dataConsistency: {
		seededDataValidation: ValidationResult[];
		uiBackendConsistency: ConsistencyResult[];
		crossDomainIntegrity: IntegrityResult[];
	};
	recommendations: string[];
	trends: {
		testDuration: number[];
		passRates: number[];
		commonFailures: FailurePattern[];
	};
}

export interface UserJourneyMetric {
	journeyType: string;
	testName: string;
	status: 'passed' | 'failed' | 'skipped';
	duration: number;
	behaviorScore: number;
	stepsCompleted: number;
	totalSteps: number;
	engagementMetrics: {
		sessionDuration: number;
		actionsPerformed: number;
		pagesVisited: number;
		conversionEvents: number;
	};
	issues: string[];
}

export interface CrossDomainMetric {
	domains: string[];
	testName: string;
	status: 'passed' | 'failed' | 'skipped';
	duration: number;
	dataConsistencyScore: number;
	validationResults: {
		valid: boolean;
		issues: string[];
	};
	performanceImpact: number;
}

export interface PerformanceMetric {
	operation: string;
	avgDuration: number;
	minDuration: number;
	maxDuration: number;
	threshold: number;
	withinThreshold: boolean;
	samples: number;
}

export interface ValidationResult {
	domain: string;
	validationCount: number;
	issuesFound: number;
	criticalIssues: number;
	details: string[];
}

export interface ConsistencyResult {
	component: string;
	uiValue: any;
	backendValue: any;
	consistent: boolean;
	tolerance: number;
}

export interface IntegrityResult {
	relationship: string;
	valid: boolean;
	brokenReferences: number;
	details: string[];
}

export interface FailurePattern {
	pattern: string;
	frequency: number;
	tests: string[];
	category: 'behavioral' | 'technical' | 'data' | 'performance';
}

export class TestAnalyticsReporter implements Reporter {
	private analytics: TestAnalytics;
	private outputDir: string;
	private startTime: Date;

	constructor(options: { outputDir?: string } = {}) {
		this.outputDir = options.outputDir || './test-results/analytics';
		this.startTime = new Date();

		// Ensure output directory exists
		if (!existsSync(this.outputDir)) {
			mkdirSync(this.outputDir, { recursive: true });
		}

		this.analytics = {
			summary: {
				totalTests: 0,
				passed: 0,
				failed: 0,
				skipped: 0,
				duration: 0,
				startTime: this.startTime.toISOString(),
				endTime: ''
			},
			behaviorMetrics: {
				userJourneyTests: [],
				crossDomainTests: [],
				performanceMetrics: []
			},
			dataConsistency: {
				seededDataValidation: [],
				uiBackendConsistency: [],
				crossDomainIntegrity: []
			},
			recommendations: [],
			trends: {
				testDuration: [],
				passRates: [],
				commonFailures: []
			}
		};
	}

	onBegin(): void {
		logger.info('\n🧪 Starting E2E Behavioral Flow Verification Tests');
		logger.info(`📊 Analytics will be saved to: ${this.outputDir}`);
	}

	onTestEnd(test: TestCase, result: TestResult): void {
		this.analytics.summary.totalTests++;
		this.analytics.summary.duration += result.duration;

		switch (result.status) {
			case 'passed':
				this.analytics.summary.passed++;
				break;
			case 'failed':
				this.analytics.summary.failed++;
				break;
			case 'skipped':
				this.analytics.summary.skipped++;
				break;
		}

		// Extract test-specific metrics
		this.extractTestMetrics(test, result);

		// Track duration trends
		this.analytics.trends.testDuration.push(result.duration);
	}

	onEnd(result: FullResult): void {
		this.analytics.summary.endTime = new Date().toISOString();

		// Calculate trends and recommendations
		this.calculateTrends();
		this.generateRecommendations();

		// Generate reports
		this.generateAnalyticsReport();
		this.generateHTMLReport();
		this.generateMetricsCSV();

		logger.info('\n📈 Test Analytics Summary:');
		logger.info(`   Total Tests: ${this.analytics.summary.totalTests}`);
		logger.info(`   Passed: ${this.analytics.summary.passed} (${Math.round((this.analytics.summary.passed / this.analytics.summary.totalTests) * 100)}%)`);
		logger.info(`   Failed: ${this.analytics.summary.failed}`);
		logger.info(`   Duration: ${Math.round(this.analytics.summary.duration / 1000)}s`);
		logger.info(`\n📋 Reports generated in: ${this.outputDir}`);
	}

	private extractTestMetrics(test: TestCase, result: TestResult): void {
		const testTitle = test.title;
		const testFile = test.location.file;

		// Extract user journey metrics
		if (testFile.includes('user-journey-analytics')) {
			this.extractUserJourneyMetrics(testTitle, result);
		}

		// Extract cross-domain metrics
		if (testFile.includes('data-consistency')) {
			this.extractCrossDomainMetrics(testTitle, result);
		}

		// Extract performance metrics
		this.extractPerformanceMetrics(testTitle, result);
	}

	private extractUserJourneyMetrics(testTitle: string, result: TestResult): void {
		// Parse behavioral data from test attachments or stdout
		const behaviorData = this.parseBehaviorData(result);

		const metric: UserJourneyMetric = {
			journeyType: this.identifyJourneyType(testTitle),
			testName: testTitle,
			status: result.status as any,
			duration: result.duration,
			behaviorScore: behaviorData.engagementScore || 0,
			stepsCompleted: behaviorData.stepsCompleted || 0,
			totalSteps: behaviorData.totalSteps || 0,
			engagementMetrics: {
				sessionDuration: behaviorData.sessionDuration || 0,
				actionsPerformed: behaviorData.actionsPerformed || 0,
				pagesVisited: behaviorData.pagesVisited || 0,
				conversionEvents: behaviorData.conversionEvents || 0
			},
			issues: this.extractIssues(result)
		};

		this.analytics.behaviorMetrics.userJourneyTests.push(metric);
	}

	private extractCrossDomainMetrics(testTitle: string, result: TestResult): void {
		const domains = this.identifyDomains(testTitle);
		const validationData = this.parseValidationData(result);

		const metric: CrossDomainMetric = {
			domains,
			testName: testTitle,
			status: result.status as any,
			duration: result.duration,
			dataConsistencyScore: validationData.consistencyScore || 0,
			validationResults: {
				valid: validationData.valid || false,
				issues: validationData.issues || []
			},
			performanceImpact: validationData.performanceImpact || 0
		};

		this.analytics.behaviorMetrics.crossDomainTests.push(metric);
	}

	private extractPerformanceMetrics(testTitle: string, result: TestResult): void {
		// Extract performance measurements from test output
		const performanceData = this.parsePerformanceData(result);

		for (const [operation, measurements] of Object.entries(performanceData)) {
			const durations = measurements as number[];
			if (durations.length > 0) {
				const metric: PerformanceMetric = {
					operation,
					avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
					minDuration: Math.min(...durations),
					maxDuration: Math.max(...durations),
					threshold: this.getPerformanceThreshold(operation),
					withinThreshold: durations.every((d) => d < this.getPerformanceThreshold(operation)),
					samples: durations.length
				};

				this.analytics.behaviorMetrics.performanceMetrics.push(metric);
			}
		}
	}

	private parseBehaviorData(result: TestResult): any {
		// Parse behavioral data from test stdout/attachments
		const stdout = result.stdout.join('\n');

		try {
			// Look for behavior analytics data in test output
			const behaviorMatch = stdout.match(/BEHAVIOR_ANALYTICS:(.+)/);
			if (behaviorMatch) {
				return JSON.parse(behaviorMatch[1]);
			}
		} catch (error) {
			console.warn('Failed to parse behavior data:', error);
		}

		return {};
	}

	private parseValidationData(result: TestResult): any {
		const stdout = result.stdout.join('\n');

		try {
			const validationMatch = stdout.match(/VALIDATION_RESULTS:(.+)/);
			if (validationMatch) {
				return JSON.parse(validationMatch[1]);
			}
		} catch (error) {
			console.warn('Failed to parse validation data:', error);
		}

		return {};
	}

	private parsePerformanceData(result: TestResult): Record<string, number[]> {
		const stdout = result.stdout.join('\n');
		const performanceData: Record<string, number[]> = {};

		// Look for performance measurements in test output
		const performanceRegex = /PERFORMANCE:(\w+):(\d+)ms/g;
		let match;

		while ((match = performanceRegex.exec(stdout)) !== null) {
			const operation = match[1];
			const duration = parseInt(match[2]);

			if (!performanceData[operation]) {
				performanceData[operation] = [];
			}
			performanceData[operation].push(duration);
		}

		return performanceData;
	}

	private identifyJourneyType(testTitle: string): string {
		if (testTitle.includes('New User')) return 'newbie-onboarding';
		if (testTitle.includes('Whale')) return 'crypto-whale';
		if (testTitle.includes('Forum Engagement')) return 'forum-engagement';
		if (testTitle.includes('Economic')) return 'economic-participation';
		return 'unknown';
	}

	private identifyDomains(testTitle: string): string[] {
		const domains: string[] = [];

		if (testTitle.includes('Forum')) domains.push('forum');
		if (testTitle.includes('Economy') || testTitle.includes('Wallet')) domains.push('economy');
		if (testTitle.includes('Admin')) domains.push('admin');
		if (testTitle.includes('Social')) domains.push('social');
		if (testTitle.includes('User')) domains.push('user');

		return domains.length > 0 ? domains : ['unknown'];
	}

	private extractIssues(result: TestResult): string[] {
		const issues: string[] = [];

		if (result.error) {
			issues.push(result.error.message || 'Unknown error');
		}

		// Extract issues from test output
		const stdout = result.stdout.join('\n');
		const issueMatches = stdout.match(/ISSUE:(.+)/g);

		if (issueMatches) {
			issues.push(...issueMatches.map((match) => match.replace('ISSUE:', '').trim()));
		}

		return issues;
	}

	private getPerformanceThreshold(operation: string): number {
		const thresholds: Record<string, number> = {
			thread_creation: 10000, // 10 seconds
			wallet_operation: 5000, // 5 seconds
			login: 3000, // 3 seconds
			page_load: 2000, // 2 seconds
			api_call: 1000, // 1 second
			default: 5000 // 5 seconds default
		};

		return thresholds[operation] || thresholds.default;
	}

	private calculateTrends(): void {
		// Calculate pass rates over time
		const totalTests = this.analytics.summary.totalTests;
		const passRate = totalTests > 0 ? (this.analytics.summary.passed / totalTests) * 100 : 0;
		this.analytics.trends.passRates.push(passRate);

		// Identify common failure patterns
		const failures = this.analytics.behaviorMetrics.userJourneyTests
			.filter((test) => test.status === 'failed')
			.concat(
				this.analytics.behaviorMetrics.crossDomainTests.filter(
					(test) => test.status === 'failed'
				) as any[]
			);

		const failurePatterns: Record<string, FailurePattern> = {};

		for (const failure of failures) {
			for (const issue of failure.issues || []) {
				const pattern = this.categorizeFailure(issue);

				if (!failurePatterns[pattern.pattern]) {
					failurePatterns[pattern.pattern] = {
						pattern: pattern.pattern,
						frequency: 0,
						tests: [],
						category: pattern.category
					};
				}

				failurePatterns[pattern.pattern].frequency++;
				failurePatterns[pattern.pattern].tests.push(failure.testName);
			}
		}

		this.analytics.trends.commonFailures = Object.values(failurePatterns)
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 10); // Top 10 failure patterns
	}

	private categorizeFailure(issue: string): {
		pattern: string;
		category: FailurePattern['category'];
	} {
		if (issue.includes('timeout') || issue.includes('wait')) {
			return { pattern: 'Timeout/Wait Issues', category: 'technical' };
		}
		if (issue.includes('balance') || issue.includes('consistency')) {
			return { pattern: 'Data Consistency Issues', category: 'data' };
		}
		if (issue.includes('behavior') || issue.includes('engagement')) {
			return { pattern: 'Behavioral Pattern Issues', category: 'behavioral' };
		}
		if (issue.includes('performance') || issue.includes('slow')) {
			return { pattern: 'Performance Issues', category: 'performance' };
		}

		return { pattern: 'Other Issues', category: 'technical' };
	}

	private generateRecommendations(): void {
		const recommendations: string[] = [];

		// Performance recommendations
		const slowOperations = this.analytics.behaviorMetrics.performanceMetrics.filter(
			(metric) => !metric.withinThreshold
		);

		if (slowOperations.length > 0) {
			recommendations.push(
				`Performance Optimization: ${slowOperations.length} operations exceed thresholds. ` +
					`Focus on: ${slowOperations.map((op) => op.operation).join(', ')}`
			);
		}

		// Behavioral recommendations
		const lowEngagementTests = this.analytics.behaviorMetrics.userJourneyTests.filter(
			(test) => test.behaviorScore < 50
		);

		if (lowEngagementTests.length > 0) {
			recommendations.push(
				`User Experience: ${lowEngagementTests.length} user journeys show low engagement scores. ` +
					`Review onboarding flows and user interface responsiveness.`
			);
		}

		// Data consistency recommendations
		const dataIssues = this.analytics.behaviorMetrics.crossDomainTests.filter(
			(test) => !test.validationResults.valid
		);

		if (dataIssues.length > 0) {
			recommendations.push(
				`Data Integrity: ${dataIssues.length} cross-domain tests show data consistency issues. ` +
					`Review data synchronization between domains.`
			);
		}

		// Test reliability recommendations
		const passRate = (this.analytics.summary.passed / this.analytics.summary.totalTests) * 100;
		if (passRate < 90) {
			recommendations.push(
				`Test Reliability: Pass rate is ${passRate.toFixed(1)}%. Target 90%+ for reliable CI/CD. ` +
					`Address flaky tests and improve test data setup.`
			);
		}

		this.analytics.recommendations = recommendations;
	}

	private generateAnalyticsReport(): void {
		const reportPath = join(this.outputDir, 'analytics-report.json');
		writeFileSync(reportPath, JSON.stringify(this.analytics, null, 2));
	}

	private generateHTMLReport(): void {
		const html = this.generateHTMLContent();
		const reportPath = join(this.outputDir, 'analytics-report.html');
		writeFileSync(reportPath, html);
	}

	private generateHTMLContent(): string {
		const passRate = (
			(this.analytics.summary.passed / this.analytics.summary.totalTests) *
			100
		).toFixed(1);
		const avgDuration = (
			this.analytics.summary.duration /
			this.analytics.summary.totalTests /
			1000
		).toFixed(1);

		return `
<!DOCTYPE html>
<html>
<head>
    <title>E2E Test Analytics Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .metric-card { background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2d3748; }
        .metric-label { color: #718096; font-size: 0.9em; margin-top: 5px; }
        .pass { color: #48bb78; }
        .fail { color: #f56565; }
        .warning { color: #ed8936; }
        .recommendation { background: #f7fafc; border-left: 4px solid #4299e1; padding: 15px; margin: 10px 0; }
        .chart-container { height: 300px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f7fafc; font-weight: 600; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 500; }
        .status-passed { background: #c6f6d5; color: #2f855a; }
        .status-failed { background: #fed7d7; color: #c53030; }
        .status-skipped { background: #feebc8; color: #c05621; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 E2E Test Analytics Report</h1>
        <p>Behavioral Flow Verification & Cross-Domain Consistency Analysis</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="metric-grid">
        <div class="metric-card">
            <div class="metric-value ${parseFloat(passRate) >= 90 ? 'pass' : 'fail'}">${passRate}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.analytics.summary.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${avgDuration}s</div>
            <div class="metric-label">Average Duration</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${this.analytics.behaviorMetrics.userJourneyTests.length}</div>
            <div class="metric-label">User Journey Tests</div>
        </div>
    </div>

    <div class="metric-card">
        <h2>🎯 Recommendations</h2>
        ${this.analytics.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join('')}
    </div>

    <div class="metric-card">
        <h2>👤 User Journey Analytics</h2>
        <table>
            <tr>
                <th>Journey Type</th>
                <th>Test Name</th>
                <th>Status</th>
                <th>Behavior Score</th>
                <th>Duration</th>
                <th>Steps Completed</th>
            </tr>
            ${this.analytics.behaviorMetrics.userJourneyTests
							.map(
								(test) => `
                <tr>
                    <td>${test.journeyType}</td>
                    <td>${test.testName}</td>
                    <td><span class="status-badge status-${test.status}">${test.status}</span></td>
                    <td>${test.behaviorScore}/100</td>
                    <td>${(test.duration / 1000).toFixed(1)}s</td>
                    <td>${test.stepsCompleted}/${test.totalSteps}</td>
                </tr>
            `
							)
							.join('')}
        </table>
    </div>

    <div class="metric-card">
        <h2>🔗 Cross-Domain Test Results</h2>
        <table>
            <tr>
                <th>Domains</th>
                <th>Test Name</th>
                <th>Status</th>
                <th>Consistency Score</th>
                <th>Issues Found</th>
            </tr>
            ${this.analytics.behaviorMetrics.crossDomainTests
							.map(
								(test) => `
                <tr>
                    <td>${test.domains.join(', ')}</td>
                    <td>${test.testName}</td>
                    <td><span class="status-badge status-${test.status}">${test.status}</span></td>
                    <td>${test.dataConsistencyScore}/100</td>
                    <td>${test.validationResults.issues.length}</td>
                </tr>
            `
							)
							.join('')}
        </table>
    </div>

    <div class="metric-card">
        <h2>⚡ Performance Metrics</h2>
        <table>
            <tr>
                <th>Operation</th>
                <th>Average Duration</th>
                <th>Threshold</th>
                <th>Within Threshold</th>
                <th>Samples</th>
            </tr>
            ${this.analytics.behaviorMetrics.performanceMetrics
							.map(
								(metric) => `
                <tr>
                    <td>${metric.operation}</td>
                    <td>${metric.avgDuration.toFixed(0)}ms</td>
                    <td>${metric.threshold}ms</td>
                    <td><span class="status-badge ${metric.withinThreshold ? 'status-passed' : 'status-failed'}">
                        ${metric.withinThreshold ? 'Yes' : 'No'}
                    </span></td>
                    <td>${metric.samples}</td>
                </tr>
            `
							)
							.join('')}
        </table>
    </div>

    <div class="metric-card">
        <h2>📈 Failure Pattern Analysis</h2>
        <table>
            <tr>
                <th>Pattern</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Affected Tests</th>
            </tr>
            ${this.analytics.trends.commonFailures
							.map(
								(pattern) => `
                <tr>
                    <td>${pattern.pattern}</td>
                    <td>${pattern.category}</td>
                    <td>${pattern.frequency}</td>
                    <td>${pattern.tests.length}</td>
                </tr>
            `
							)
							.join('')}
        </table>
    </div>

    <script>
        // Add any interactive charts or additional JavaScript here
        console.log('E2E Test Analytics Report Loaded');
    </script>
</body>
</html>`;
	}

	private generateMetricsCSV(): void {
		const csvData = [
			'Test,Type,Status,Duration,BehaviorScore,StepsCompleted,TotalSteps,Issues',
			...this.analytics.behaviorMetrics.userJourneyTests.map(
				(test) =>
					`"${test.testName}","${test.journeyType}","${test.status}",${test.duration},${test.behaviorScore},${test.stepsCompleted},${test.totalSteps},"${test.issues.join('; ')}"`
			)
		].join('\n');

		const csvPath = join(this.outputDir, 'test-metrics.csv');
		writeFileSync(csvPath, csvData);
	}
}

// Export for Playwright configuration
export default TestAnalyticsReporter;
