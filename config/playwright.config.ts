import { defineConfig, devices } from '@playwright/test';
import TestAnalyticsReporter from './tests/e2e/reports/test-analytics-reporter';

/**
 * Playwright Configuration for Degentalk E2E Testing
 * Enhanced configuration for behavioral flow verification and cross-domain testing
 */
export default defineConfig({
	testDir: './tests',

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI
	workers: process.env.CI ? 1 : undefined,

	// Enhanced reporter configuration for analytics
	reporter: [
		['html', { outputFolder: 'test-results/html-report' }],
		['json', { outputFile: 'test-results/results.json' }],
		['junit', { outputFile: 'test-results/junit.xml' }],
		// Custom analytics reporter temporarily disabled for initial testing
		// [TestAnalyticsReporter, { outputDir: 'test-results/analytics' }],
		// Console reporter for development
		process.env.CI ? ['github'] : ['list']
	],

	// Shared settings for all the projects
	use: {
		// Base URL for tests
		baseURL: 'http://localhost:5173',

		// Collect trace when retrying the failed test
		trace: 'on-first-retry',

		// Record video on failure
		video: 'retain-on-failure',

		// Take screenshot on failure
		screenshot: 'only-on-failure',

		// Global test timeout
		actionTimeout: 30000,
		navigationTimeout: 30000,

		// Ignore HTTPS errors for development
		ignoreHTTPSErrors: true,

		// Extra HTTP headers
		extraHTTPHeaders: {
			'Accept-Language': 'en-US,en;q=0.9'
		}
	},

	// Configure projects for major browsers
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},

		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		},

		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		},

		// Mobile testing
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] }
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] }
		},

		// Behavioral testing specific project
		{
			name: 'behavioral-flows',
			testDir: './tests/e2e/behavioral-flows',
			use: {
				...devices['Desktop Chrome'],
				// Extended timeout for complex behavioral tests
				actionTimeout: 60000,
				navigationTimeout: 60000
			},
			// Run behavioral tests with more retries due to complexity
			retries: process.env.CI ? 3 : 1
		},

		// Cross-domain testing project
		{
			name: 'cross-domain',
			testDir: './tests/e2e/cross-domain',
			use: {
				...devices['Desktop Chrome'],
				// Cross-domain tests may need more time
				actionTimeout: 45000
			}
		},

		// Performance testing project
		{
			name: 'performance',
			testDir: './tests/e2e/performance',
			use: {
				...devices['Desktop Chrome'],
				// Performance tests should run with reduced timeout for more accurate measurements
				actionTimeout: 15000,
				navigationTimeout: 15000
			},
			// Performance tests should not retry as it affects measurements
			retries: 0
		}
	],

	// Global setup and teardown
	// globalSetup: './tests/e2e/global-setup.ts',
	// globalTeardown: './tests/e2e/global-teardown.ts',

	// Run your local dev server before starting the tests
	webServer: {
		command: 'npm run dev:quick',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000, // 2 minutes for server startup
		env: {
			NODE_ENV: 'test',
			// Ensure test database is used
			DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
			// Force real authentication in tests
			DEV_FORCE_AUTH: 'true',
			DEV_BYPASS_PASSWORD: 'false',
			VITE_FORCE_AUTH: 'true',
			// Test-specific API URL
			VITE_API_URL: 'http://localhost:5001'
		}
	},

	// Test output directory
	outputDir: 'test-results/artifacts',

	// Expect configuration
	expect: {
		// Custom expect timeout
		timeout: 10000,

		// Custom matchers for behavioral testing
		toMatchSeededPattern: async function (received: any, expected: any) {
			// Custom matcher implementation for seeded data pattern matching
			const pass = this.utils.isDeepStrictEqual(received, expected);

			if (pass) {
				return {
					message: () =>
						`Expected ${this.utils.printReceived(received)} not to match seeded pattern`,
					pass: true
				};
			} else {
				return {
					message: () =>
						`Expected ${this.utils.printReceived(received)} to match seeded pattern ${this.utils.printExpected(expected)}`,
					pass: false
				};
			}
		}
	},

	// Test metadata for analytics
	metadata: {
		testEnvironment: 'development',
		version: '1.0.0',
		capabilities: [
			'behavioral-flow-verification',
			'cross-domain-consistency',
			'seeded-data-validation',
			'performance-monitoring'
		]
	}
});
