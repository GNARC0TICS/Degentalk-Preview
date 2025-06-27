/**
 * Test Environment Setup for E2E Testing
 * Manages test database state, user authentication, and seeded data alignment
 */

import { Page } from '@playwright/test';
import { scenarioGenerator } from '../../../shared/fixtures/utilities/scenario-generator';
import { testDataManager } from '../../../shared/fixtures/utilities/test-helpers';

export interface TestEnvironment {
	id: string;
	scenario: string;
	users: any[];
	forums: any[];
	threads: any[];
	posts: any[];
	transactions: any[];
	cleanup: () => Promise<void>;
}

export interface TestSetupOptions {
	scenario: 'basic' | 'community-growth' | 'whale-activity' | 'admin-moderation' | string;
	includeAnalytics?: boolean;
	customUsers?: any[];
	resetDatabase?: boolean;
	seedRealtime?: boolean;
}

class TestEnvironmentManager {
	private environments: Map<string, TestEnvironment> = new Map();
	private apiUrl: string;

	constructor() {
		this.apiUrl = process.env.VITE_API_URL || 'http://localhost:5001';
	}

	async setupTestEnvironment(options: TestSetupOptions): Promise<TestEnvironment> {
		const envId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Reset database if requested
		if (options.resetDatabase) {
			await this.resetTestDatabase();
		}

		// Generate scenario data
		let scenarioData;
		if (options.scenario === 'basic') {
			scenarioData = await testDataManager.setupBasicForum();
		} else if (
			['community-growth', 'whale-activity', 'admin-moderation'].includes(options.scenario)
		) {
			const result = await scenarioGenerator.generateScenario(options.scenario);
			scenarioData = result.generatedData;
		} else {
			throw new Error(`Unknown scenario: ${options.scenario}`);
		}

		// Seed the test database
		await this.seedTestDatabase(scenarioData);

		// Create test environment
		const environment: TestEnvironment = {
			id: envId,
			scenario: options.scenario,
			users: scenarioData.users || [],
			forums: scenarioData.forums || [],
			threads: scenarioData.threads || [],
			posts: scenarioData.posts || [],
			transactions: scenarioData.transactions || [],
			cleanup: () => this.cleanupTestEnvironment(envId)
		};

		this.environments.set(envId, environment);
		return environment;
	}

	async cleanupTestEnvironment(environmentId: string | TestEnvironment): Promise<void> {
		const envId = typeof environmentId === 'string' ? environmentId : environmentId.id;
		const environment = this.environments.get(envId);

		if (environment) {
			await this.cleanupTestData(environment);
			this.environments.delete(envId);
		}
	}

	private async resetTestDatabase(): Promise<void> {
		try {
			// Call API endpoint to reset test database
			const response = await fetch(`${this.apiUrl}/api/test/reset-database`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer test-token' // Test-only auth
				}
			});

			if (!response.ok) {
				console.warn('Database reset failed, proceeding with existing data');
			}
		} catch (error) {
			console.warn('Could not reset database:', error);
		}
	}

	private async seedTestDatabase(data: any): Promise<void> {
		try {
			// Seed users first
			if (data.users?.length > 0) {
				await this.seedUsers(data.users);
			}

			// Seed forums and structure
			if (data.forums?.length > 0) {
				await this.seedForums(data.forums);
			}

			// Seed threads
			if (data.threads?.length > 0) {
				await this.seedThreads(data.threads);
			}

			// Seed posts
			if (data.posts?.length > 0) {
				await this.seedPosts(data.posts);
			}

			// Seed transactions
			if (data.transactions?.length > 0) {
				await this.seedTransactions(data.transactions);
			}

			// Wait for data propagation
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (error) {
			console.error('Failed to seed test database:', error);
			throw error;
		}
	}

	private async seedUsers(users: any[]): Promise<void> {
		for (const user of users) {
			// Convert BigInt values to strings for JSON serialization
			const serializedUser = this.serializeForJSON({
				...user,
				password: 'TestPassword123!', // Standard test password
				isTestUser: true
			});

			await fetch(`${this.apiUrl}/api/test/users`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(serializedUser)
			});
		}
	}

	private serializeForJSON(obj: any): any {
		return JSON.parse(
			JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
		);
	}

	private async seedForums(forums: any[]): Promise<void> {
		for (const forum of forums) {
			await fetch(`${this.apiUrl}/api/test/forums`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(forum)
			});
		}
	}

	private async seedThreads(threads: any[]): Promise<void> {
		for (const thread of threads) {
			await fetch(`${this.apiUrl}/api/test/threads`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(thread)
			});
		}
	}

	private async seedPosts(posts: any[]): Promise<void> {
		for (const post of posts) {
			await fetch(`${this.apiUrl}/api/test/posts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(post)
			});
		}
	}

	private async seedTransactions(transactions: any[]): Promise<void> {
		for (const transaction of transactions) {
			await fetch(`${this.apiUrl}/api/test/transactions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(transaction)
			});
		}
	}

	private async cleanupTestData(environment: TestEnvironment): Promise<void> {
		try {
			// Clean up in reverse order of creation
			const cleanup = [
				{ type: 'transactions', ids: environment.transactions?.map((t) => t.id) },
				{ type: 'posts', ids: environment.posts?.map((p) => p.id) },
				{ type: 'threads', ids: environment.threads?.map((t) => t.id) },
				{ type: 'forums', ids: environment.forums?.map((f) => f.id) },
				{ type: 'users', ids: environment.users?.map((u) => u.id) }
			];

			for (const item of cleanup) {
				if (item.ids?.length > 0) {
					await fetch(`${this.apiUrl}/api/test/${item.type}/cleanup`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ids: item.ids })
					});
				}
			}
		} catch (error) {
			console.warn('Test cleanup failed:', error);
		}
	}
}

// Authentication helpers
class AuthenticationHelper {
	private page: Page;
	private apiUrl: string;

	constructor(page: Page) {
		this.page = page;
		this.apiUrl = process.env.VITE_API_URL || 'http://localhost:5001';
	}

	async loginAs(user: any): Promise<void> {
		await this.page.goto('/login');

		await this.page.fill('[data-testid="username"]', user.username);
		await this.page.fill('[data-testid="password"]', 'TestPassword123!');
		await this.page.click('[data-testid="login-button"]');

		// Wait for login completion
		await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
	}

	async loginAsAdmin(): Promise<void> {
		await this.page.goto('/login');

		await this.page.fill('[data-testid="username"]', 'cryptoadmin');
		await this.page.fill('[data-testid="password"]', 'TestPassword123!');
		await this.page.click('[data-testid="login-button"]');

		await this.page.waitForSelector('[data-testid="admin-panel"]', { timeout: 10000 });
	}

	async loginAsModerator(): Promise<void> {
		await this.page.goto('/login');

		await this.page.fill('[data-testid="username"]', 'test_moderator');
		await this.page.fill('[data-testid="password"]', 'TestPassword123!');
		await this.page.click('[data-testid="login-button"]');

		await this.page.waitForSelector('[data-testid="mod-tools"]', { timeout: 10000 });
	}

	async logout(): Promise<void> {
		await this.page.click('[data-testid="user-menu"]');
		await this.page.click('[data-testid="logout-button"]');
		await this.page.waitForURL('/login');
	}

	async getCurrentUser(): Promise<any> {
		try {
			const response = await this.page.request.get(`${this.apiUrl}/api/auth/user`);
			if (response.ok()) {
				return await response.json();
			}
		} catch (error) {
			console.warn('Could not get current user:', error);
		}
		return null;
	}
}

// Data validation helpers
class DataValidationHelper {
	private page: Page;
	private apiUrl: string;

	constructor(page: Page) {
		this.page = page;
		this.apiUrl = process.env.VITE_API_URL || 'http://localhost:5001';
	}

	async validateSeededDataIntegrity(environment: TestEnvironment): Promise<{
		valid: boolean;
		issues: string[];
	}> {
		const issues: string[] = [];

		// Validate user data integrity
		if (environment.users?.length > 0) {
			const userIssues = await this.validateUsers(environment.users);
			issues.push(...userIssues);
		}

		// Validate forum structure
		if (environment.forums?.length > 0) {
			const forumIssues = await this.validateForums(environment.forums);
			issues.push(...forumIssues);
		}

		// Validate thread-post relationships
		if (environment.threads?.length > 0 && environment.posts?.length > 0) {
			const relationshipIssues = await this.validateThreadPostRelationships(
				environment.threads,
				environment.posts
			);
			issues.push(...relationshipIssues);
		}

		// Validate economic data consistency
		if (environment.transactions?.length > 0) {
			const economicIssues = await this.validateEconomicConsistency(
				environment.users,
				environment.transactions
			);
			issues.push(...economicIssues);
		}

		return {
			valid: issues.length === 0,
			issues
		};
	}

	private async validateUsers(users: any[]): Promise<string[]> {
		const issues: string[] = [];

		for (const user of users) {
			// Check user data completeness
			if (!user.username || !user.email || !user.role) {
				issues.push(`User ${user.id} missing required fields`);
			}

			// Validate email format
			if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
				issues.push(`User ${user.username} has invalid email format`);
			}

			// Validate XP/level consistency
			if (user.xp !== undefined && user.level !== undefined) {
				const expectedLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
				if (Math.abs(user.level - expectedLevel) > 2) {
					issues.push(`User ${user.username} has inconsistent XP/level relationship`);
				}
			}

			// Validate DGT balance
			if (user.dgtBalance !== undefined && user.dgtBalance < 0) {
				issues.push(`User ${user.username} has negative DGT balance`);
			}
		}

		return issues;
	}

	private async validateForums(forums: any[]): Promise<string[]> {
		const issues: string[] = [];

		for (const forum of forums) {
			if (!forum.name || !forum.slug) {
				issues.push(`Forum ${forum.id} missing required fields`);
			}

			// Validate slug format
			if (forum.slug && !/^[a-z0-9-]+$/.test(forum.slug)) {
				issues.push(`Forum ${forum.name} has invalid slug format`);
			}
		}

		return issues;
	}

	private async validateThreadPostRelationships(threads: any[], posts: any[]): Promise<string[]> {
		const issues: string[] = [];
		const threadIds = new Set(threads.map((t) => t.id));

		// Check all posts belong to existing threads
		for (const post of posts) {
			if (!threadIds.has(post.threadId)) {
				issues.push(`Post ${post.id} references non-existent thread ${post.threadId}`);
			}
		}

		// Check each thread has at least one post
		for (const thread of threads) {
			const threadPosts = posts.filter((p) => p.threadId === thread.id);
			if (threadPosts.length === 0) {
				issues.push(`Thread ${thread.id} has no posts`);
			}

			// Check first post exists and is marked correctly
			const firstPost = threadPosts.find((p) => p.isFirstPost);
			if (!firstPost) {
				issues.push(`Thread ${thread.id} has no first post`);
			}
		}

		return issues;
	}

	private async validateEconomicConsistency(users: any[], transactions: any[]): Promise<string[]> {
		const issues: string[] = [];
		const userBalances: Record<string, number> = {};

		// Initialize user balances
		for (const user of users) {
			userBalances[user.id] = user.dgtBalance || 0;
		}

		// Process transactions chronologically
		const sortedTransactions = [...transactions].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);

		for (const tx of sortedTransactions) {
			const userId = tx.userId || tx.user_id;
			if (!userBalances.hasOwnProperty(userId)) {
				issues.push(`Transaction ${tx.id} references non-existent user ${userId}`);
				continue;
			}

			// Validate transaction would not create negative balance
			const newBalance = userBalances[userId] + (tx.amount || 0);
			if (newBalance < 0 && tx.type !== 'ADMIN_ADJUSTMENT') {
				issues.push(`Transaction ${tx.id} would create negative balance for user ${userId}`);
			}

			userBalances[userId] = newBalance;
		}

		return issues;
	}

	async validateUIDataConsistency(): Promise<{
		valid: boolean;
		mismatches: string[];
	}> {
		const mismatches: string[] = [];

		try {
			// Check user profile data matches backend
			const currentUser = await this.getCurrentUserFromUI();
			if (currentUser) {
				const backendUser = await this.getCurrentUserFromAPI();
				if (backendUser) {
					if (currentUser.username !== backendUser.username) {
						mismatches.push('Username mismatch between UI and backend');
					}
					if (Math.abs(currentUser.dgtBalance - backendUser.dgtBalance) > 0.01) {
						mismatches.push('DGT balance mismatch between UI and backend');
					}
				}
			}

			// Check forum thread counts
			const uiThreadCounts = await this.getThreadCountsFromUI();
			const backendThreadCounts = await this.getThreadCountsFromAPI();

			for (const [forumId, uiCount] of Object.entries(uiThreadCounts)) {
				const backendCount = backendThreadCounts[forumId] || 0;
				if (Math.abs(uiCount - backendCount) > 1) {
					// Allow for timing differences
					mismatches.push(
						`Thread count mismatch for forum ${forumId}: UI=${uiCount}, Backend=${backendCount}`
					);
				}
			}
		} catch (error) {
			mismatches.push(`Error validating UI consistency: ${error}`);
		}

		return {
			valid: mismatches.length === 0,
			mismatches
		};
	}

	private async getCurrentUserFromUI(): Promise<any> {
		try {
			const username = await this.page.locator('[data-testid="username-display"]').textContent();
			const balanceText = await this.page.locator('[data-testid="dgt-balance"]').textContent();
			const balance = parseFloat(balanceText?.replace(/[^\d.]/g, '') || '0');

			return { username, dgtBalance: balance };
		} catch {
			return null;
		}
	}

	private async getCurrentUserFromAPI(): Promise<any> {
		try {
			const response = await this.page.request.get(`${this.apiUrl}/api/auth/user`);
			if (response.ok()) {
				return await response.json();
			}
		} catch {
			return null;
		}
	}

	private async getThreadCountsFromUI(): Promise<Record<string, number>> {
		const counts: Record<string, number> = {};

		try {
			const forumCards = await this.page.locator('[data-testid="forum-card"]').all();

			for (const card of forumCards) {
				const forumId = await card.getAttribute('data-forum-id');
				const countText = await card.locator('[data-testid="thread-count"]').textContent();
				const count = parseInt(countText?.replace(/[^\d]/g, '') || '0');

				if (forumId) {
					counts[forumId] = count;
				}
			}
		} catch (error) {
			console.warn('Could not get thread counts from UI:', error);
		}

		return counts;
	}

	private async getThreadCountsFromAPI(): Promise<Record<string, number>> {
		try {
			const response = await this.page.request.get(`${this.apiUrl}/api/forum/stats`);
			if (response.ok()) {
				const stats = await response.json();
				return stats.threadCounts || {};
			}
		} catch {
			// Ignore API errors
		}
		return {};
	}
}

// Global test environment manager instance
const testEnvironmentManager = new TestEnvironmentManager();

// Export main functions
export async function setupTestEnvironment(options: TestSetupOptions): Promise<TestEnvironment> {
	return testEnvironmentManager.setupTestEnvironment(options);
}

export async function cleanupTestEnvironment(environment: TestEnvironment | string): Promise<void> {
	return testEnvironmentManager.cleanupTestEnvironment(environment);
}

// Export helper classes
export { AuthenticationHelper, DataValidationHelper };
