/**
 * Test Helper Utilities
 * Convenience functions for testing with realistic Degentalk fixtures
 */

import { Factory } from '../core/factory';
import { scenarioGenerator, AvailableScenario } from './scenario-generator';
import type { AdminId } from '@shared/types/ids';
import { logger } from "../../../server/src/core/logger";
import { ThreadId } from "@shared/types/ids";

// Setup helpers for test environments
export class TestDataManager {
	private static instance: TestDataManager;
	private cleanupTasks: Array<() => Promise<void>> = [];

	static getInstance(): TestDataManager {
		if (!TestDataManager.instance) {
			TestDataManager.instance = new TestDataManager();
		}
		return TestDataManager.instance;
	}

	// Quick setup methods for common test patterns
	async setupBasicForum(): Promise<{
		users: any[];
		forum: any;
		threads: any[];
		posts: any[];
	}> {
		const users = Factory.createMany('user', 5);
		const forum = Factory.create('forum');
		const threads = Factory.createMany('thread', 3, {
			overrides: { forumId: forum.id }
		});

		const posts = [];
		for (const thread of threads) {
			const threadPosts = Factory.createMany('post', 5, {
				overrides: { threadId: thread.id }
			});
			posts.push(...threadPosts);
		}

		return { users, forum, threads, posts };
	}

	async setupAdminScenario(): Promise<{
		admin: any;
		moderators: any[];
		users: any[];
		adminActions: any[];
	}> {
		const admin = Factory.create('admin');
		const moderators = Factory.createMany('user', 2, {
			overrides: { role: 'moderator' }
		});
		const users = Factory.createMany('user', 10);

		const adminActions = this.generateAdminActions(admin.id, users);

		return { admin, moderators, users, adminActions };
	}

	async setupEconomyScenario(): Promise<{
		users: any[];
		transactions: any[];
		tips: any[];
		whales: any[];
	}> {
		const users = Factory.createMany('user', 15);
		const whales = Factory.createMany('whale', 3);

		const transactions = this.generateTransactions([...users, ...whales]);
		const tips = this.generateTips([...users, ...whales]);

		return { users, transactions, tips, whales };
	}

	// Scenario-based setup
	async setupScenario(scenarioName: AvailableScenario): Promise<any> {
		const result = await scenarioGenerator.generateScenario(scenarioName);

		// Register cleanup for any database operations
		this.registerCleanup(async () => {
			// Cleanup logic would go here
			logger.info(`Cleaning up scenario: ${scenarioName}`);
		});

		return result.generatedData;
	}

	// User journey helpers
	createUserJourney(journeyType: 'newbie' | 'trader' | 'whale' | 'admin'): any {
		const journeys = {
			newbie: this.createNewbieJourney(),
			trader: this.createTraderJourney(),
			whale: this.createWhaleJourney(),
			admin: this.createAdminJourney()
		};

		return journeys[journeyType];
	}

	private createNewbieJourney(): any {
		const user = Factory.create('user', {
			overrides: {
				xp: 0,
				level: 1,
				dgtWalletBalance: BigInt(1000),
				totalPosts: 0,
				isEmailVerified: false
			}
		});

		const firstThread = Factory.create('thread', {
			overrides: {
				userId: user.id,
				title: 'New to crypto - need help!',
				viewCount: 50
			}
		});

		const firstPost = Factory.create('post', {
			overrides: {
				userId: user.id,
				threadId: firstThread.id,
				isFirstPost: true,
				content: 'Hi everyone! Complete crypto newbie here. Where do I start?'
			}
		});

		return {
			user,
			progression: [
				{ step: 'registration', completed: true },
				{ step: 'first_post', completed: true },
				{ step: 'email_verification', completed: false },
				{ step: 'first_like', completed: false }
			],
			initialContent: { thread: firstThread, post: firstPost }
		};
	}

	private createTraderJourney(): any {
		const user = Factory.create('user', {
			overrides: {
				xp: 5000,
				level: 15,
				dgtWalletBalance: BigInt(50000),
				reputation: 800,
				bio: 'Active crypto trader. TA enthusiast. DYOR always!'
			}
		});

		const tradeThreads = Factory.createMany('thread', 3, {
			overrides: { userId: user.id }
		}).map((thread, i) => ({
			...thread,
			title: [
				'BTC Technical Analysis - Bullish Triangle',
				'My ETH swing trade setup',
				'Altcoin gems for the next bull run'
			][i]
		}));

		const transactions = Array.from({ length: 20 }, (_, i) => ({
			id: Date.now() + i,
			userId: user.id,
			type: ['TRADE', 'DEPOSIT', 'WITHDRAWAL'][Math.floor(Math.random() * 3)],
			amount: Math.floor(Math.random() * 10000) + 1000,
			createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
		}));

		return {
			user,
			tradingActivity: {
				threads: tradeThreads,
				transactions,
				winRate: 0.65,
				avgReturn: 0.12
			}
		};
	}

	private createWhaleJourney(): any {
		const whale = Factory.create('whale', {
			overrides: {
				username: 'cryptowhale_og',
				dgtWalletBalance: BigInt(10000000),
				reputation: 9500,
				bio: 'Bitcoin since 2011. DeFi pioneer. Building the future.'
			}
		});

		const whaleTransactions = Array.from({ length: 50 }, (_, i) => ({
			id: Date.now() + i,
			userId: whale.id,
			type: ['DEPOSIT', 'TIP', 'RAIN', 'PURCHASE'][Math.floor(Math.random() * 4)],
			amount: Math.floor(Math.random() * 500000) + 50000,
			createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
		}));

		const whaleTips = Array.from({ length: 25 }, (_, i) => ({
			id: Date.now() + i,
			fromUserId: whale.id,
			amount: Math.floor(Math.random() * 10000) + 1000,
			message: 'Keep building! 🚀',
			createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
		}));

		return {
			user: whale,
			wealthActivity: {
				largeTransactions: whaleTransactions,
				communityTips: whaleTips,
				marketInfluence: 'high',
				followers: 1500
			}
		};
	}

	private createAdminJourney(): any {
		const admin = Factory.create('admin', {
			overrides: {
				username: 'admin_alpha',
				reputation: 10000,
				bio: 'Degentalk admin. Building the future of crypto communities.'
			}
		});

		const moderationActions = Array.from({ length: 15 }, (_, i) => ({
			id: Date.now() + i,
			adminId: admin.id,
			action: ['warn', 'timeout', 'ban', 'delete_post'][Math.floor(Math.random() * 4)],
			reason: 'Community guidelines violation',
			timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
		}));

		const systemChanges = Array.from({ length: 8 }, (_, i) => ({
			id: Date.now() + i,
			adminId: admin.id,
			setting: ['max_daily_tips', 'min_post_length', 'rain_cooldown'][
				Math.floor(Math.random() * 3)
			],
			oldValue: '100',
			newValue: '150',
			timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
		}));

		return {
			user: admin,
			adminActivity: {
				moderationActions,
				systemChanges,
				dailyTasks: ['user_management', 'content_moderation', 'system_monitoring']
			}
		};
	}

	// Test data generation helpers
	generateRealisticPosts(threadId: ThreadId, userIds: number[], count: number = 10): any[] {
		const cryptoPostTemplates = [
			'Just bought the dip! Who else is accumulating?',
			'This pump is insane! Target: {target}',
			'TA update: {coin} looking bullish on the 4H chart',
			'GM crypto family! What are we buying today?',
			'That was a fake breakout. Classic bull trap.',
			'DCA is the way. Been stacking {coin} for months.',
			'Anyone else see this whale transaction? 👀',
			'Bear market is for building. Keep your head up!',
			'This {news} is huge for adoption. Bullish!',
			'REKT: My leveraged trade just got liquidated 😅'
		];

		return Array.from({ length: count }, (_, i) => {
			const template = cryptoPostTemplates[Math.floor(Math.random() * cryptoPostTemplates.length)];
			const content = template
				.replace('{target}', `$${Math.floor(Math.random() * 100)}k`)
				.replace('{coin}', ['BTC', 'ETH', 'SOL', 'LINK'][Math.floor(Math.random() * 4)])
				.replace('{news}', ['partnership', 'upgrade', 'adoption'][Math.floor(Math.random() * 3)]);

			return Factory.create('post', {
				overrides: {
					threadId,
					userId: userIds[Math.floor(Math.random() * userIds.length)],
					content,
					likeCount: Math.floor(Math.random() * 20)
				}
			});
		});
	}

	generateTransactions(users: any[]): any[] {
		const transactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TIP', 'RAIN', 'PURCHASE', 'TRADE'];

		return Array.from({ length: 100 }, (_, i) => ({
			id: Date.now() + i,
			userId: users[Math.floor(Math.random() * users.length)].id,
			type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
			amount: Math.floor(Math.random() * 50000) + 100,
			status: Math.random() > 0.1 ? 'completed' : 'pending',
			createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
		}));
	}

	generateTips(users: any[]): any[] {
		return Array.from({ length: 30 }, (_, i) => ({
			id: Date.now() + i,
			fromUserId: users[Math.floor(Math.random() * users.length)].id,
			toUserId: users[Math.floor(Math.random() * users.length)].id,
			amount: Math.floor(Math.random() * 5000) + 100,
			message: ['Great post!', 'Thanks for sharing!', 'Keep it up!'][Math.floor(Math.random() * 3)],
			createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
		}));
	}

	private generateAdminActions(adminId: AdminId, users: any[]): any[] {
		const actions = ['user_warning', 'post_deletion', 'thread_lock', 'user_timeout', 'ban_user'];

		return Array.from({ length: 10 }, (_, i) => ({
			id: Date.now() + i,
			adminId,
			targetUserId: users[Math.floor(Math.random() * users.length)].id,
			action: actions[Math.floor(Math.random() * actions.length)],
			reason: 'Community guidelines violation',
			timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
		}));
	}

	// Cleanup management
	registerCleanup(task: () => Promise<void>): void {
		this.cleanupTasks.push(task);
	}

	async cleanup(): Promise<void> {
		for (const task of this.cleanupTasks) {
			try {
				await task();
			} catch (error) {
				console.error('Cleanup task failed:', error);
			}
		}
		this.cleanupTasks = [];
	}

	// Performance testing helpers
	generateLargeDataset(config: {
		users?: number;
		threads?: number;
		posts?: number;
		transactions?: number;
	}): any {
		const { users = 1000, threads = 500, posts = 5000, transactions = 10000 } = config;

		logger.info(`Generating large dataset: ${users} users, ${threads} threads, ${posts} posts, ${transactions} transactions`);

		const userData = Factory.createMany('user', users);
		const threadData = Factory.createMany('thread', threads);
		const postData = Factory.createMany('post', posts);
		const transactionData = this.generateTransactions(userData);

		return {
			users: userData,
			threads: threadData,
			posts: postData,
			transactions: transactionData.slice(0, transactions),
			summary: {
				totalEntities: users + threads + posts + transactions,
				estimatedMemoryUsage: `${Math.round((users + threads + posts + transactions) * 0.5)}KB`
			}
		};
	}
}

// Export singleton instance
export const testDataManager = TestDataManager.getInstance();

// Convenience functions for quick testing
export const createTestUser = (overrides = {}) => Factory.create('user', { overrides });
export const createTestAdmin = (overrides = {}) => Factory.create('admin', { overrides });
export const createTestWhale = (overrides = {}) => Factory.create('whale', { overrides });
export const createTestThread = (overrides = {}) => Factory.create('thread', { overrides });
export const createTestPost = (overrides = {}) => Factory.create('post', { overrides });

// Quick scenario setup for tests
export const setupQuickScenario = async (type: 'basic' | 'admin' | 'economy' | 'large') => {
	switch (type) {
		case 'basic':
			return testDataManager.setupBasicForum();
		case 'admin':
			return testDataManager.setupAdminScenario();
		case 'economy':
			return testDataManager.setupEconomyScenario();
		case 'large':
			return testDataManager.generateLargeDataset({});
		default:
			throw new Error(`Unknown scenario type: ${type}`);
	}
};

// Matchers for testing
export const expectValidUser = (user: any) => {
	expect(user).toHaveProperty('id');
	expect(user).toHaveProperty('username');
	expect(user).toHaveProperty('email');
	expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
	expect(['admin', 'moderator', 'user']).toContain(user.role || 'user');
};

export const expectValidThread = (thread: any) => {
	expect(thread).toHaveProperty('id');
	expect(thread).toHaveProperty('title');
	expect(thread).toHaveProperty('slug');
	expect(thread).toHaveProperty('forumId');
	expect(thread).toHaveProperty('userId');
	expect(typeof thread.viewCount).toBe('number');
	expect(typeof thread.postCount).toBe('number');
};

export const expectValidPost = (post: any) => {
	expect(post).toHaveProperty('id');
	expect(post).toHaveProperty('threadId');
	expect(post).toHaveProperty('userId');
	expect(post).toHaveProperty('content');
	expect(typeof post.content).toBe('string');
	expect(post.content.length).toBeGreaterThan(0);
	expect(typeof post.isFirstPost).toBe('boolean');
};
