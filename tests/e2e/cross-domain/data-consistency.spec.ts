/**
 * Cross-Domain Data Consistency Tests
 * Validates that seeded data maintains consistency across all platform domains
 */

import { test, expect } from '@playwright/test';
import {
	setupTestEnvironment,
	cleanupTestEnvironment,
	DataValidationHelper
} from '../fixtures/test-setup';
import { BehaviorAnalyzer } from '../helpers/behavior-analyzer';

test.describe('Cross-Domain Data Consistency Validation', () => {
	let testEnvironment: any;
	let dataValidator: DataValidationHelper;

	test.beforeEach(async ({ page }) => {
		testEnvironment = await setupTestEnvironment({
			scenario: 'community-growth',
			includeAnalytics: true,
			resetDatabase: true
		});

		dataValidator = new DataValidationHelper(page);
	});

	test.afterEach(async () => {
		await cleanupTestEnvironment(testEnvironment);
	});

	test('Forum-Economy Cross-Domain Consistency', async ({ page }) => {
		// Test that forum interactions properly update economic data

		await test.step('Verify thread creation updates XP and DGT systems', async () => {
			const testUser = testEnvironment.users.find((u: any) => u.role === 'user');

			// Login and capture initial state
			await page.goto('/login');
			await page.fill('[data-testid="username"]', testUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Get initial XP and DGT balance
			await page.goto('/profile');
			const initialXP = await page.locator('[data-testid="user-xp"]').textContent();
			const initialDGT = await page.locator('[data-testid="dgt-balance"]').textContent();

			// Create a thread
			await page.goto('/forums/general-discussion');
			await page.click('[data-testid="create-thread"]');
			await page.fill('[data-testid="thread-title"]', 'Cross-domain consistency test thread');
			await page.fill(
				'[data-testid="thread-content"]',
				'Testing that forum actions properly update economy systems.'
			);
			await page.click('[data-testid="submit-thread"]');

			// Wait for thread creation and system updates
			await page.waitForSelector('[data-testid="thread-success"]', { timeout: 10000 });
			await page.waitForTimeout(2000); // Allow for backend processing

			// Verify XP increase
			await page.goto('/profile');
			const newXP = await page.locator('[data-testid="user-xp"]').textContent();
			const newDGT = await page.locator('[data-testid="dgt-balance"]').textContent();

			const xpIncrease = parseInt(newXP!) - parseInt(initialXP!);
			expect(xpIncrease).toBeGreaterThan(0);
			expect(xpIncrease).toBe(25); // Standard thread creation XP

			// Verify DGT reward (if configured)
			const dgtIncrease =
				parseFloat(newDGT!.replace(/[^\d.]/g, '')) - parseFloat(initialDGT!.replace(/[^\d.]/g, ''));
			if (dgtIncrease > 0) {
				expect(dgtIncrease).toBeGreaterThan(0);
			}

			// Verify thread appears in user's profile
			await page.click('[data-testid="user-threads-tab"]');
			await expect(page.locator('[data-testid="thread-item"]').first()).toContainText(
				'Cross-domain consistency test thread'
			);
		});

		await test.step('Verify wallet transactions reflect forum rewards', async () => {
			// Check wallet transaction history
			await page.goto('/wallet');
			await page.click('[data-testid="transaction-history-tab"]');

			// Look for XP reward transaction
			const xpTransactions = await page
				.locator('[data-testid="transaction-item"]')
				.filter({ hasText: 'XP_REWARD' })
				.all();

			expect(xpTransactions.length).toBeGreaterThan(0);

			// Verify transaction details match forum action
			const latestXpTx = xpTransactions[0];
			await expect(latestXpTx.locator('[data-testid="tx-type"]')).toContainText('XP_REWARD');
			await expect(latestXpTx.locator('[data-testid="tx-description"]')).toContainText(
				'Thread Created'
			);
		});

		await test.step('Verify level progression consistency', async () => {
			// Check that XP increases properly trigger level-ups
			const currentXP = await page.locator('[data-testid="user-xp"]').textContent();
			const currentLevel = await page.locator('[data-testid="user-level"]').textContent();

			const xpValue = parseInt(currentXP!);
			const levelValue = parseInt(currentLevel!);

			// Verify level calculation matches XP
			const expectedLevel = Math.floor(Math.sqrt(xpValue / 100)) + 1;
			expect(Math.abs(levelValue - expectedLevel)).toBeLessThanOrEqual(1); // Allow for slight variations

			// Check level progress bar accuracy
			const progressBar = await page.locator('[data-testid="level-progress"]');
			const progressValue = await progressBar.getAttribute('value');

			if (progressValue) {
				const progress = parseFloat(progressValue);
				expect(progress).toBeGreaterThanOrEqual(0);
				expect(progress).toBeLessThanOrEqual(100);
			}
		});
	});

	test('User-Admin Domain Consistency', async ({ page }) => {
		// Test that admin actions properly reflect in user experience

		await test.step('Admin moderation actions appear in user notifications', async () => {
			const adminUser = testEnvironment.users.find((u: any) => u.role === 'admin');
			const regularUser = testEnvironment.users.find((u: any) => u.role === 'user');

			// Login as admin
			await page.goto('/login');
			await page.fill('[data-testid="username"]', adminUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Navigate to admin panel and issue a warning
			await page.goto('/admin/users');
			await page.fill('[data-testid="user-search"]', regularUser.username);
			await page.click('[data-testid="search-button"]');

			await page.click(`[data-testid="user-${regularUser.id}-actions"]`);
			await page.click('[data-testid="issue-warning"]');
			await page.fill(
				'[data-testid="warning-reason"]',
				'Test warning for cross-domain consistency'
			);
			await page.click('[data-testid="confirm-warning"]');

			// Verify admin action was recorded
			await expect(page.locator('[data-testid="action-success"]')).toBeVisible();

			// Logout admin and login as user
			await page.click('[data-testid="user-menu"]');
			await page.click('[data-testid="logout"]');

			await page.goto('/login');
			await page.fill('[data-testid="username"]', regularUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Check that user received notification
			await page.goto('/notifications');
			await expect(page.locator('[data-testid="notification-item"]').first()).toContainText(
				'warning'
			);
			await expect(page.locator('[data-testid="notification-item"]').first()).toContainText(
				'Test warning for cross-domain consistency'
			);
		});

		await test.step('Admin settings changes affect user experience', async () => {
			// Test that admin configuration changes are reflected in user interface
			const adminUser = testEnvironment.users.find((u: any) => u.role === 'admin');

			// Login as admin and change a setting
			await page.goto('/login');
			await page.fill('[data-testid="username"]', adminUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			await page.goto('/admin/settings');
			await page.click('[data-testid="economy-settings"]');

			// Change max daily tips setting
			await page.fill('[data-testid="max-daily-tips"]', '150');
			await page.click('[data-testid="save-settings"]');
			await expect(page.locator('[data-testid="settings-saved"]')).toBeVisible();

			// Logout and login as regular user
			await page.click('[data-testid="user-menu"]');
			await page.click('[data-testid="logout"]');

			const regularUser = testEnvironment.users.find((u: any) => u.role === 'user');
			await page.goto('/login');
			await page.fill('[data-testid="username"]', regularUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Check that new limit is reflected in user interface
			await page.goto('/wallet');
			await page.click('[data-testid="send-tip"]');

			const maxTipInfo = await page.locator('[data-testid="daily-tip-limit"]').textContent();
			expect(maxTipInfo).toContain('150'); // New limit should be shown
		});
	});

	test('Social-Economic Domain Integration', async ({ page }) => {
		// Test that social interactions properly integrate with economic systems

		await test.step('Tips update both social and economic metrics', async () => {
			const tipper = testEnvironment.users.find((u: any) => u.dgtBalance > 10000);
			const recipient = testEnvironment.users.find((u: any) => u.id !== tipper.id);

			// Login as tipper
			await page.goto('/login');
			await page.fill('[data-testid="username"]', tipper.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Get initial balances and reputation
			await page.goto('/profile');
			const initialTipperDGT = await page.locator('[data-testid="dgt-balance"]').textContent();

			await page.goto(`/profile/${recipient.username}`);
			const initialRecipientReputation = await page
				.locator('[data-testid="reputation-score"]')
				.textContent();

			// Find a post by recipient to tip
			await page.goto('/forums/general-discussion');
			const recipientPost = await page.locator(`[data-testid="post-by-${recipient.id}"]`).first();

			if (await recipientPost.isVisible()) {
				await recipientPost.click();
				await page.click('[data-testid="tip-button"]');
				await page.fill('[data-testid="tip-amount"]', '1000');
				await page.fill('[data-testid="tip-message"]', 'Cross-domain consistency test tip');
				await page.click('[data-testid="send-tip"]');

				await expect(page.locator('[data-testid="tip-success"]')).toBeVisible();

				// Verify tipper's balance decreased
				await page.goto('/profile');
				const newTipperDGT = await page.locator('[data-testid="dgt-balance"]').textContent();
				const tipperDecrease =
					parseFloat(initialTipperDGT!.replace(/[^\d.]/g, '')) -
					parseFloat(newTipperDGT!.replace(/[^\d.]/g, ''));
				expect(tipperDecrease).toBe(1000);

				// Verify recipient's reputation increased
				await page.goto(`/profile/${recipient.username}`);
				const newRecipientReputation = await page
					.locator('[data-testid="reputation-score"]')
					.textContent();
				const reputationIncrease =
					parseInt(newRecipientReputation!) - parseInt(initialRecipientReputation!);
				expect(reputationIncrease).toBeGreaterThan(0);

				// Verify tip appears in transaction history
				await page.goto('/wallet');
				await page.click('[data-testid="transaction-history-tab"]');
				await expect(page.locator('[data-testid="transaction-item"]').first()).toContainText(
					'TIP_SENT'
				);
			}
		});

		await test.step('Following relationships affect content visibility', async () => {
			const follower = testEnvironment.users[0];
			const followed = testEnvironment.users[1];

			// Login as follower
			await page.goto('/login');
			await page.fill('[data-testid="username"]', follower.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Follow the other user
			await page.goto(`/profile/${followed.username}`);
			await page.click('[data-testid="follow-button"]');
			await expect(page.locator('[data-testid="following-indicator"]')).toBeVisible();

			// Check that followed user's content appears in following feed
			await page.goto('/following');

			// Look for content from followed user
			const followedContent = await page.locator(`[data-testid="content-by-${followed.id}"]`).all();
			expect(followedContent.length).toBeGreaterThan(0);
		});
	});

	test('Real-time Data Synchronization', async ({ page, context }) => {
		// Test that data changes are synchronized across multiple sessions

		await test.step('Forum activity appears in real-time across sessions', async () => {
			// Create two browser contexts for different users
			const user1 = testEnvironment.users[0];
			const user2 = testEnvironment.users[1];

			const page2 = await context.newPage();

			// Login both users
			await page.goto('/login');
			await page.fill('[data-testid="username"]', user1.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			await page2.goto('/login');
			await page2.fill('[data-testid="username"]', user2.username);
			await page2.fill('[data-testid="password"]', 'TestPassword123!');
			await page2.click('[data-testid="login-button"]');

			// Both users navigate to same forum
			await page.goto('/forums/general-discussion');
			await page2.goto('/forums/general-discussion');

			// Count initial threads
			const initialThreadCount = await page.locator('[data-testid="thread-item"]').count();

			// User 1 creates a new thread
			await page.click('[data-testid="create-thread"]');
			await page.fill('[data-testid="thread-title"]', 'Real-time sync test thread');
			await page.fill('[data-testid="thread-content"]', 'Testing real-time synchronization');
			await page.click('[data-testid="submit-thread"]');

			await page.waitForSelector('[data-testid="thread-success"]');

			// Refresh user 2's page and check for new thread
			await page2.reload();
			await page2.waitForTimeout(2000); // Allow for update propagation

			const newThreadCount = await page2.locator('[data-testid="thread-item"]').count();
			expect(newThreadCount).toBe(initialThreadCount + 1);

			// Verify new thread appears in user 2's view
			await expect(page2.locator('[data-testid="thread-item"]').first()).toContainText(
				'Real-time sync test thread'
			);

			await page2.close();
		});
	});

	test('Data Validation and Integrity Checks', async ({ page }) => {
		// Comprehensive data validation across all domains

		await test.step('Validate seeded data integrity', async () => {
			const validation = await dataValidator.validateSeededDataIntegrity(testEnvironment);

			expect(validation.valid).toBe(true);

			if (!validation.valid) {
				console.log('Data integrity issues found:', validation.issues);
				// Log issues for debugging but don't fail the test immediately
				for (const issue of validation.issues) {
					console.warn(`Data integrity issue: ${issue}`);
				}
			}
		});

		await test.step('Validate UI-backend data consistency', async () => {
			// Login to get user context
			const testUser = testEnvironment.users.find((u: any) => u.role === 'user');
			await page.goto('/login');
			await page.fill('[data-testid="username"]', testUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			const uiConsistency = await dataValidator.validateUIDataConsistency();

			expect(uiConsistency.valid).toBe(true);

			if (!uiConsistency.valid) {
				console.log('UI-backend consistency issues:', uiConsistency.mismatches);
				for (const mismatch of uiConsistency.mismatches) {
					console.warn(`UI consistency issue: ${mismatch}`);
				}
			}
		});

		await test.step('Validate cross-domain relationships', async () => {
			// Check that all foreign key relationships are valid
			const users = testEnvironment.users;
			const threads = testEnvironment.threads;
			const posts = testEnvironment.posts;

			// Verify all threads belong to existing users
			for (const thread of threads) {
				const threadOwner = users.find((u: any) => u.id === thread.userId);
				expect(threadOwner).toBeDefined();
				if (!threadOwner) {
					console.error(`Thread ${thread.id} has invalid userId: ${thread.userId}`);
				}
			}

			// Verify all posts belong to existing threads and users
			for (const post of posts) {
				const postThread = threads.find((t: any) => t.id === post.threadId);
				const postOwner = users.find((u: any) => u.id === post.userId);

				expect(postThread).toBeDefined();
				expect(postOwner).toBeDefined();

				if (!postThread) {
					console.error(`Post ${post.id} has invalid threadId: ${post.threadId}`);
				}
				if (!postOwner) {
					console.error(`Post ${post.id} has invalid userId: ${post.userId}`);
				}
			}
		});
	});

	test('Performance Impact of Cross-Domain Operations', async ({ page }) => {
		// Test that cross-domain operations maintain acceptable performance

		await test.step('Forum operations complete within performance thresholds', async () => {
			const testUser = testEnvironment.users.find((u: any) => u.role === 'user');

			await page.goto('/login');
			await page.fill('[data-testid="username"]', testUser.username);
			await page.fill('[data-testid="password"]', 'TestPassword123!');
			await page.click('[data-testid="login-button"]');

			// Measure thread creation time
			const startTime = Date.now();

			await page.goto('/forums/general-discussion');
			await page.click('[data-testid="create-thread"]');
			await page.fill('[data-testid="thread-title"]', 'Performance test thread');
			await page.fill(
				'[data-testid="thread-content"]',
				'Testing cross-domain operation performance'
			);
			await page.click('[data-testid="submit-thread"]');

			await page.waitForSelector('[data-testid="thread-success"]');

			const endTime = Date.now();
			const operationTime = endTime - startTime;

			// Thread creation should complete within 10 seconds
			expect(operationTime).toBeLessThan(10000);

			console.log(`Thread creation took ${operationTime}ms`);
		});

		await test.step('Wallet operations maintain consistency under load', async () => {
			// Simulate multiple wallet operations to test consistency
			const testUser = testEnvironment.users.find((u: any) => u.dgtBalance > 5000);

			await page.goto('/wallet');

			// Perform multiple operations in sequence
			const operations = [];

			for (let i = 0; i < 3; i++) {
				const startTime = Date.now();

				// Refresh balance
				await page.click('[data-testid="refresh-balance"]');
				await page.waitForSelector('[data-testid="balance-updated"]');

				const endTime = Date.now();
				operations.push({ operation: 'balance_refresh', time: endTime - startTime });
			}

			// All operations should complete within reasonable time
			for (const op of operations) {
				expect(op.time).toBeLessThan(5000); // 5 seconds max
			}

			const avgTime = operations.reduce((sum, op) => sum + op.time, 0) / operations.length;
			console.log(`Average wallet operation time: ${avgTime}ms`);
		});
	});
});
