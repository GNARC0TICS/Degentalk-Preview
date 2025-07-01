/**
 * Scenario Generator Utilities
 * Generates complex, realistic test scenarios for the Degentalk platform
 */

import { Factory } from '../core/factory';
import { UserFactory, AdminUserFactory, CryptoWhaleFactory } from '../factories/user.factory';
import { ThreadFactory, PostFactory, ForumCategoryFactory } from '../factories/forum.factory';
import type { AdminId, WhaleId } from '@/db/types';

// Register all factories
Factory.register('user', new UserFactory());
Factory.register('admin', new AdminUserFactory());
Factory.register('whale', new CryptoWhaleFactory());
Factory.register('thread', new ThreadFactory());
Factory.register('post', new PostFactory());
Factory.register('forum', new ForumCategoryFactory());

export interface ScenarioConfig {
	name: string;
	description: string;
	complexity: 'simple' | 'medium' | 'complex';
	estimatedDuration: string;
}

export interface ScenarioResult {
	config: ScenarioConfig;
	generatedData: Record<string, any[]>;
	relationships: Record<string, string[]>;
	statistics: {
		totalEntities: number;
		entitiesByType: Record<string, number>;
		generationTime: number;
	};
}

export class ScenarioGenerator {
	private startTime: number = 0;

	async generateScenario(scenarioName: string): Promise<ScenarioResult> {
		this.startTime = Date.now();

		const scenario = this.getScenarioDefinition(scenarioName);
		if (!scenario) {
			throw new Error(`Unknown scenario: ${scenarioName}`);
		}

		const generatedData: Record<string, any[]> = {};
		const relationships: Record<string, string[]> = {};

		switch (scenarioName) {
			case 'forum-discussion':
				return this.generateForumDiscussion();
			case 'whale-activity':
				return this.generateWhaleActivity();
			case 'new-user-onboarding':
				return this.generateNewUserOnboarding();
			case 'admin-moderation':
				return this.generateAdminModeration();
			case 'crypto-market-event':
				return this.generateCryptoMarketEvent();
			case 'community-growth':
				return this.generateCommunityGrowth();
			default:
				throw new Error(`Scenario '${scenarioName}' not implemented`);
		}
	}

	private getScenarioDefinition(name: string): ScenarioConfig | null {
		const scenarios: Record<string, ScenarioConfig> = {
			'forum-discussion': {
				name: 'Forum Discussion',
				description: 'Active forum discussion with users, threads, and engagement',
				complexity: 'medium',
				estimatedDuration: '2-3 minutes'
			},
			'whale-activity': {
				name: 'Crypto Whale Activity',
				description: 'High-value user with large transactions and community impact',
				complexity: 'simple',
				estimatedDuration: '1 minute'
			},
			'new-user-onboarding': {
				name: 'New User Onboarding',
				description: 'Fresh user journey from registration to first engagement',
				complexity: 'simple',
				estimatedDuration: '1 minute'
			},
			'admin-moderation': {
				name: 'Admin Moderation',
				description: 'Admin activities including user management and content moderation',
				complexity: 'complex',
				estimatedDuration: '3-5 minutes'
			},
			'crypto-market-event': {
				name: 'Crypto Market Event',
				description: 'Community reaction to major market movements',
				complexity: 'complex',
				estimatedDuration: '3-5 minutes'
			},
			'community-growth': {
				name: 'Community Growth',
				description: 'Large-scale community with diverse user types and content',
				complexity: 'complex',
				estimatedDuration: '5-10 minutes'
			}
		};

		return scenarios[name] || null;
	}

	private async generateForumDiscussion(): Promise<ScenarioResult> {
		// Create 10 users with mixed personas
		const users = [
			...Factory.createMany('user', 7, { overrides: { role: 'user' } }),
			...Factory.createMany('admin', 2),
			...Factory.createMany('whale', 1)
		];

		// Create a hot forum category
		const forum = Factory.create('forum', {
			overrides: {
				name: 'Bull Market Discussion',
				description: 'Discuss the latest bull run and market trends'
			}
		});

		// Create 3 hot threads
		const threads = Factory.createMany('thread', 3, {
			overrides: {
				forumId: forum.id,
				userId: users[Math.floor(Math.random() * users.length)].id
			}
		}).map((thread, index) => ({
			...thread,
			title: [
				'BTC just broke $50k resistance! 🚀',
				'Altseason is here - which coins are you buying?',
				'Market analysis: Why this bull run is different'
			][index]
		}));

		// Generate posts for each thread
		const posts = [];
		for (const thread of threads) {
			// First post (thread starter)
			const firstPost = Factory.create('post', {
				overrides: {
					threadId: thread.id,
					userId: thread.userId,
					isFirstPost: true,
					content: this.generateThreadStarterContent(thread.title)
				}
			});
			posts.push(firstPost);

			// Reply posts
			const replyCount = Math.floor(Math.random() * 15) + 5; // 5-20 replies
			const replies = Factory.createMany('post', replyCount, {
				overrides: {
					threadId: thread.id,
					userId: users[Math.floor(Math.random() * users.length)].id,
					isFirstPost: false
				}
			});
			posts.push(...replies);
		}

		// Generate engagement data
		const engagementData = this.generateEngagementData(users, posts);

		return this.buildScenarioResult(
			'forum-discussion',
			{
				users,
				forums: [forum],
				threads,
				posts,
				engagement: engagementData
			},
			{
				threads: [`${threads.length} threads in forum ${forum.id}`],
				posts: [`${posts.length} posts across ${threads.length} threads`],
				engagement: [`Likes, tips, and replies for ${users.length} users`]
			}
		);
	}

	private async generateWhaleActivity(): Promise<ScenarioResult> {
		// Create whale user
		const whale = Factory.create('whale', {
			overrides: {
				username: 'cryptowhale_2024',
				dgtWalletBalance: BigInt(5000000), // 5M DGT
				reputation: 8500,
				bio: 'Crypto whale 🐋 Early Bitcoin adopter. Building the future of DeFi.'
			}
		});

		// Create some regular users for interaction
		const regularUsers = Factory.createMany('user', 5);

		// Generate whale transactions
		const transactions = this.generateWhaleTransactions(whale.id);

		// Generate whale posts and tips
		const whalePosts = Factory.createMany('post', 8, {
			overrides: {
				userId: whale.id,
				likeCount: Math.floor(Math.random() * 100) + 50 // High engagement
			}
		});

		// Generate tips from whale to community
		const tips = this.generateWhaleTips(
			whale.id,
			regularUsers.map((u) => u.id)
		);

		return this.buildScenarioResult(
			'whale-activity',
			{
				users: [whale, ...regularUsers],
				transactions,
				posts: whalePosts,
				tips
			},
			{
				whale: [`High-value user ${whale.username} with 5M DGT`],
				transactions: [`${transactions.length} high-value transactions`],
				community_impact: [`Tips and engagement with ${regularUsers.length} users`]
			}
		);
	}

	private async generateNewUserOnboarding(): Promise<ScenarioResult> {
		// Create brand new user
		const newUser = Factory.create('user', {
			overrides: {
				xp: 0,
				level: 1,
				dgtWalletBalance: BigInt(1000), // Starting balance
				reputation: 0,
				totalPosts: 0,
				totalThreads: 0,
				isEmailVerified: false,
				createdAt: new Date(),
				bio: ''
			}
		});

		// Create helpful community members
		const helpfulUsers = Factory.createMany('user', 3, {
			overrides: {
				role: 'user',
				reputation: Math.floor(Math.random() * 1000) + 500
			}
		});

		// Create beginner-friendly forum
		const beginnerForum = Factory.create('forum', {
			overrides: {
				name: 'Beginner Questions',
				description: 'New to crypto? Ask your questions here!'
			}
		});

		// Create first thread by new user
		const firstThread = Factory.create('thread', {
			overrides: {
				title: 'New to crypto - where do I start?',
				forumId: beginnerForum.id,
				userId: newUser.id,
				viewCount: 0,
				postCount: 1
			}
		});

		// Create first post
		const firstPost = Factory.create('post', {
			overrides: {
				threadId: firstThread.id,
				userId: newUser.id,
				isFirstPost: true,
				content: `Hi everyone! I'm completely new to cryptocurrency and this community. I've been reading about Bitcoin and Ethereum but feeling overwhelmed. 

Where should I start? What are the basics I need to understand? Any recommended resources for beginners?

Thanks in advance for any help! 🙏`,
				likeCount: 0
			}
		});

		// Generate helpful replies
		const helpfulReplies = Factory.createMany('post', 3, {
			overrides: {
				threadId: firstThread.id,
				isFirstPost: false
			}
		}).map((post, index) => ({
			...post,
			userId: helpfulUsers[index].id,
			content: [
				'Welcome to the community! 👋 Start with understanding Bitcoin whitepaper and basic blockchain concepts. DM me if you have specific questions!',
				'Great question! I recommend starting with small amounts, learning about wallets, and understanding the difference between centralized and decentralized exchanges.',
				'Welcome! Check out our pinned beginner guides. Most important: never invest more than you can afford to lose, and always DYOR (Do Your Own Research)!'
			][index]
		}));

		// Generate onboarding progression
		const progressionData = this.generateOnboardingProgression(newUser.id);

		return this.buildScenarioResult(
			'new-user-onboarding',
			{
				users: [newUser, ...helpfulUsers],
				forums: [beginnerForum],
				threads: [firstThread],
				posts: [firstPost, ...helpfulReplies],
				progression: progressionData
			},
			{
				new_user: [`Fresh user ${newUser.username} starting their journey`],
				community_support: [`${helpfulUsers.length} helpful community members`],
				learning_path: ['First thread, helpful replies, progression tracking']
			}
		);
	}

	private async generateAdminModeration(): Promise<ScenarioResult> {
		// Create admin users
		const admins = Factory.createMany('admin', 2);
		const moderators = Factory.createMany('user', 2, {
			overrides: { role: 'moderator' }
		});

		// Create problematic users
		const problematicUsers = Factory.createMany('user', 3, {
			overrides: {
				totalPosts: Math.floor(Math.random() * 20) + 5
			}
		});

		// Create regular users
		const regularUsers = Factory.createMany('user', 10);

		// Generate moderation actions
		const moderationActions = this.generateModerationActions(
			[...admins, ...moderators],
			problematicUsers
		);

		// Generate audit logs
		const auditLogs = this.generateAuditLogs(admins, moderationActions);

		// Generate system settings changes
		const settingsChanges = this.generateSettingsChanges(admins[0].id);

		return this.buildScenarioResult(
			'admin-moderation',
			{
				users: [...admins, ...moderators, ...problematicUsers, ...regularUsers],
				moderation_actions: moderationActions,
				audit_logs: auditLogs,
				settings_changes: settingsChanges
			},
			{
				admin_team: [`${admins.length} admins, ${moderators.length} moderators`],
				moderation: [`${moderationActions.length} moderation actions taken`],
				audit_trail: [`${auditLogs.length} audit log entries`]
			}
		);
	}

	private async generateCryptoMarketEvent(): Promise<ScenarioResult> {
		// Simulate a major market event (e.g., Bitcoin hitting new ATH)
		const eventTitle = 'Bitcoin Hits New All-Time High!';

		// Create diverse user reactions
		const users = [
			...Factory.createMany('user', 15), // Regular users
			...Factory.createMany('whale', 3), // Whales
			...Factory.createMany('admin', 1) // Admin
		];

		// Create market discussion forum
		const marketForum = Factory.create('forum', {
			overrides: {
				name: 'Market Events',
				description: 'Real-time market discussion and analysis'
			}
		});

		// Create event thread
		const eventThread = Factory.create('thread', {
			overrides: {
				title: eventTitle,
				forumId: marketForum.id,
				userId: users[0].id,
				viewCount: Math.floor(Math.random() * 5000) + 10000, // High views
				isPinned: true
			}
		});

		// Generate excited community posts
		const posts = Factory.createMany('post', 25, {
			overrides: {
				threadId: eventThread.id,
				likeCount: Math.floor(Math.random() * 50) + 10 // High engagement
			}
		}).map((post, index) => ({
			...post,
			userId: users[index % users.length].id,
			content: this.generateMarketEventContent(index)
		}));

		// Generate market reaction data
		const marketData = this.generateMarketReactionData(users, eventThread.id);

		return this.buildScenarioResult(
			'crypto-market-event',
			{
				users,
				forums: [marketForum],
				threads: [eventThread],
				posts,
				market_data: marketData
			},
			{
				market_event: [eventTitle],
				community_reaction: [`${posts.length} posts from ${users.length} users`],
				engagement: ['High views, likes, and rapid posting activity']
			}
		);
	}

	private async generateCommunityGrowth(): Promise<ScenarioResult> {
		// Large-scale community simulation
		const users = [
			...Factory.createMany('admin', 3),
			...Factory.createMany('user', 45, { overrides: { role: 'moderator' } }),
			...Factory.createMany('whale', 5),
			...Factory.createMany('user', 147) // Regular users
		];

		// Create diverse forums
		const forums = [
			'General Trading',
			'DeFi Discussion',
			'NFT Marketplace',
			'Technical Analysis',
			'Beginner Questions',
			'Market News'
		].map((name) =>
			Factory.create('forum', {
				overrides: { name, description: `Community discussion about ${name.toLowerCase()}` }
			})
		);

		// Generate threads across all forums
		const threads = [];
		for (const forum of forums) {
			const forumThreads = Factory.createMany(
				'thread',
				Math.floor(Math.random() * 10) + 5, // 5-15 threads per forum
				{ overrides: { forumId: forum.id } }
			);
			threads.push(...forumThreads);
		}

		// Generate posts for threads
		const posts = [];
		for (const thread of threads) {
			const postCount = Math.floor(Math.random() * 20) + 3; // 3-23 posts per thread
			const threadPosts = Factory.createMany('post', postCount, {
				overrides: { threadId: thread.id }
			});
			posts.push(...threadPosts);
		}

		// Generate community statistics
		const stats = this.generateCommunityStats(users, forums, threads, posts);

		return this.buildScenarioResult(
			'community-growth',
			{
				users,
				forums,
				threads,
				posts,
				statistics: stats
			},
			{
				scale: [`${users.length} users, ${forums.length} forums, ${threads.length} threads`],
				content: [`${posts.length} total posts generated`],
				diversity: ['Multiple user types, varied content, realistic engagement']
			}
		);
	}

	// Helper methods for content generation
	private generateThreadStarterContent(title: string): string {
		const templates = [
			`${title}\n\nWhat do you all think about this? I've been watching the charts and the momentum is incredible. Volume is picking up and we're seeing some serious institutional interest.\n\nMy target is set at $75k by end of year. Diamond hands! 💎🙌`,
			`${title}\n\nJust saw this breakout happen live! The technical analysis was spot on - that ascending triangle pattern played out perfectly.\n\nAnyone else catch this move? What's your next target?`,
			`${title}\n\nThis could be the start of something big. Market sentiment is shifting and retail is starting to FOMO in.\n\nBuckle up degens, we're going to the moon! 🚀`
		];

		return templates[Math.floor(Math.random() * templates.length)];
	}

	private generateWhaleTransactions(whaleId: WhaleId): any[] {
		return Array.from({ length: 12 }, (_, i) => ({
			id: Date.now() + i,
			userId: whaleId,
			type: ['DEPOSIT', 'TIP', 'RAIN', 'PURCHASE'][Math.floor(Math.random() * 4)],
			amount: Math.floor(Math.random() * 100000) + 10000, // Large amounts
			createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
			status: 'completed'
		}));
	}

	private generateWhaleTips(whaleId: WhaleId, userIds: number[]): any[] {
		return Array.from({ length: 8 }, (_, i) => ({
			id: Date.now() + i,
			fromUserId: whaleId,
			toUserId: userIds[Math.floor(Math.random() * userIds.length)],
			amount: Math.floor(Math.random() * 5000) + 1000, // 1k-6k DGT tips
			message: 'Great post! Keep up the good work 🙌',
			createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
		}));
	}

	private generateEngagementData(users: any[], posts: any[]): any[] {
		const engagements = [];

		// Generate likes
		for (const post of posts) {
			const likeCount = Math.floor(Math.random() * 20);
			for (let i = 0; i < likeCount; i++) {
				engagements.push({
					type: 'like',
					userId: users[Math.floor(Math.random() * users.length)].id,
					postId: post.id,
					createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
				});
			}
		}

		return engagements;
	}

	private generateOnboardingProgression(userId: number): any[] {
		return [
			{ step: 'registration', completed: true, timestamp: new Date() },
			{ step: 'email_verification', completed: false, timestamp: null },
			{ step: 'first_post', completed: true, timestamp: new Date() },
			{ step: 'profile_setup', completed: false, timestamp: null },
			{ step: 'first_like_received', completed: false, timestamp: null }
		];
	}

	private generateModerationActions(moderators: any[], users: any[]): any[] {
		const actions = ['warn', 'timeout', 'ban', 'delete_post', 'lock_thread'];

		return Array.from({ length: 8 }, (_, i) => ({
			id: Date.now() + i,
			moderatorId: moderators[Math.floor(Math.random() * moderators.length)].id,
			targetUserId: users[Math.floor(Math.random() * users.length)].id,
			action: actions[Math.floor(Math.random() * actions.length)],
			reason: 'Violation of community guidelines',
			createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
		}));
	}

	private generateAuditLogs(admins: any[], actions: any[]): any[] {
		return actions.map((action, i) => ({
			id: Date.now() + i,
			adminId: admins[Math.floor(Math.random() * admins.length)].id,
			action: `moderation.${action.action}`,
			entityType: 'user',
			entityId: action.targetUserId,
			details: { reason: action.reason, moderator: action.moderatorId },
			timestamp: action.createdAt
		}));
	}

	private generateSettingsChanges(adminId: AdminId): any[] {
		return [
			{
				setting: 'max_daily_tips',
				oldValue: '100',
				newValue: '150',
				changedBy: adminId,
				timestamp: new Date()
			},
			{
				setting: 'minimum_post_length',
				oldValue: '10',
				newValue: '20',
				changedBy: adminId,
				timestamp: new Date(Date.now() - 60 * 60 * 1000)
			}
		];
	}

	private generateMarketEventContent(index: number): string {
		const reactions = [
			'HOLY SHIT! We actually did it! Bitcoin new ATH! 🚀🚀🚀',
			"Told you all to buy the dip! Who's laughing now? 😂",
			'This is just the beginning. Next stop: $100k! 💎🙌',
			'Taking some profits here. Smart money knows when to scale out.',
			'My grandmother just asked me about Bitcoin. Top signal? 📈',
			"HODL gang where you at? We've been waiting for this moment!",
			'Technical analysis called this perfectly. That breakout was textbook.',
			'Altseason incoming! Time to rotate into some quality alts.',
			'Remember when everyone said Bitcoin was dead at $15k? 🤡',
			'This is why we DCA. Patience pays off in crypto.'
		];

		return reactions[index % reactions.length];
	}

	private generateMarketReactionData(users: any[], threadId: number): any {
		return {
			threadActivity: {
				threadId,
				postsPerHour: Math.floor(Math.random() * 20) + 30, // High activity
				uniqueUsers: Math.floor(users.length * 0.7), // 70% participation
				avgSentiment: 0.8 // Bullish sentiment
			},
			userBehavior: {
				newRegistrations: Math.floor(Math.random() * 50) + 20,
				dailyActiveUsers: Math.floor(users.length * 0.9),
				tipVolume: Math.floor(Math.random() * 100000) + 50000
			}
		};
	}

	private generateCommunityStats(users: any[], forums: any[], threads: any[], posts: any[]): any {
		return {
			userDistribution: {
				total: users.length,
				admins: users.filter((u) => u.role === 'admin').length,
				moderators: users.filter((u) => u.role === 'moderator').length,
				regular: users.filter((u) => u.role === 'user' || !u.role).length,
				whales: users.filter((u) => u.dgtWalletBalance > 1000000).length
			},
			contentStats: {
				totalThreads: threads.length,
				totalPosts: posts.length,
				avgPostsPerThread: Math.round(posts.length / threads.length),
				avgThreadsPerForum: Math.round(threads.length / forums.length)
			},
			engagementMetrics: {
				avgPostsPerUser: Math.round(posts.length / users.length),
				activeForums: forums.length,
				dailyActiveThreads: Math.floor(threads.length * 0.3)
			}
		};
	}

	private buildScenarioResult(
		scenarioName: string,
		generatedData: Record<string, any[]>,
		relationships: Record<string, string[]>
	): ScenarioResult {
		const config = this.getScenarioDefinition(scenarioName)!;
		const entitiesByType: Record<string, number> = {};
		let totalEntities = 0;

		for (const [type, data] of Object.entries(generatedData)) {
			const count = Array.isArray(data) ? data.length : 1;
			entitiesByType[type] = count;
			totalEntities += count;
		}

		return {
			config,
			generatedData,
			relationships,
			statistics: {
				totalEntities,
				entitiesByType,
				generationTime: Date.now() - this.startTime
			}
		};
	}
}

// Export pre-configured scenario instances
export const scenarioGenerator = new ScenarioGenerator();

// Export available scenarios list
export const availableScenarios = [
	'forum-discussion',
	'whale-activity',
	'new-user-onboarding',
	'admin-moderation',
	'crypto-market-event',
	'community-growth'
] as const;

export type AvailableScenario = (typeof availableScenarios)[number];
