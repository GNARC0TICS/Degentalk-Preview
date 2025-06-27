/**
 * User Journey Fixtures for E2E Testing
 * Generates realistic user journey data that aligns with seeded content patterns
 */

import { faker } from '@faker-js/faker';

export interface UserJourney {
	user: {
		id: string;
		username: string;
		email: string;
		role: string;
		xp: number;
		level: number;
		dgtBalance: number;
		reputation: number;
		bio: string;
	};
	expectedBehavior: {
		sessionDuration: number;
		pagesPerSession: number;
		actionsPerMinute: number;
		engagementScore: number;
	};
	timeline: JourneyStep[];
}

export interface JourneyStep {
	step: string;
	estimatedDuration: number;
	requiredActions: string[];
	expectedOutcomes: Record<string, any>;
	validationCriteria: string[];
}

export interface NewbieJourney extends UserJourney {
	emailVerificationDelay: number;
	verificationToken: string;
	firstThread: {
		id: string;
		title: string;
		content: string;
		forumId: string;
	};
	expectedXP: {
		firstPost: number;
		emailVerification: number;
		total: number;
	};
	recommendedNextActions: string[];
	helpfulUsers: any[];
}

export interface WhaleJourney extends UserJourney {
	walletMetrics: {
		dailyVolume: number;
		avgTransactionSize: number;
		tippingFrequency: number;
	};
	marketInsight: {
		title: string;
		content: string;
		expectedEngagement: {
			viewsPerMinute: number;
			responses: number;
			likes: number;
		};
	};
	tipAmounts: number[];
	expectedLargeTxCount: number;
	expectedDailyTipping: number;
	expectedEngagement: {
		viewsPerMinute: number;
		responses: number;
	};
}

export interface ForumEngagementJourney extends UserJourney {
	preferredForums: string[];
	expectedMinPosts: number;
	expectedAverageLikes: number;
	expectedPostingFrequency: number;
	minimumEngagementRatio: number;
}

export interface EconomicParticipationJourney extends UserJourney {
	minimumStartingBalance: number;
	expectedTransactionTypes: string[];
	economicBehavior: {
		spendingRatio: number;
		savingsRatio: number;
		tippingRatio: number;
	};
}

// Journey generation functions
export async function generateUserJourney(journeyType: string): Promise<any> {
	faker.seed(Date.now()); // Ensure randomness

	switch (journeyType) {
		case 'newbie-onboarding':
			return generateNewbieOnboardingJourney();
		case 'crypto-whale':
			return generateCryptoWhaleJourney();
		case 'forum-engagement':
			return generateForumEngagementJourney();
		case 'economic-participation':
			return generateEconomicParticipationJourney();
		default:
			throw new Error(`Unknown journey type: ${journeyType}`);
	}
}

function generateNewbieOnboardingJourney(): NewbieJourney {
	const username = `newbie_${faker.string.alphanumeric(8)}`;

	return {
		user: {
			id: faker.string.uuid(),
			username,
			email: `${username}@${faker.helpers.arrayElement(['gmail.com', 'outlook.com', 'yahoo.com'])}`,
			role: 'user',
			xp: 0,
			level: 1,
			dgtBalance: 1000, // Starting balance
			reputation: 0,
			bio: ''
		},
		expectedBehavior: {
			sessionDuration: faker.number.int({ min: 300000, max: 1800000 }), // 5-30 minutes
			pagesPerSession: faker.number.int({ min: 8, max: 15 }),
			actionsPerMinute: faker.number.int({ min: 3, max: 8 }),
			engagementScore: faker.number.int({ min: 30, max: 60 })
		},
		timeline: [
			{
				step: 'registration',
				estimatedDuration: 120000, // 2 minutes
				requiredActions: ['fill_username', 'fill_email', 'fill_password', 'submit_form'],
				expectedOutcomes: { accountCreated: true, emailSent: true },
				validationCriteria: ['welcome_message_shown', 'verification_email_prompt']
			},
			{
				step: 'email_verification',
				estimatedDuration: 300000, // 5 minutes
				requiredActions: ['click_email_link', 'confirm_verification'],
				expectedOutcomes: { emailVerified: true, xpAwarded: 10 },
				validationCriteria: ['verification_success_message', 'xp_notification']
			},
			{
				step: 'first_forum_visit',
				estimatedDuration: 600000, // 10 minutes
				requiredActions: ['browse_forums', 'read_beginner_guide', 'view_example_threads'],
				expectedOutcomes: { forumsExplored: 3, guidesRead: 1 },
				validationCriteria: ['beginner_resources_accessed', 'forum_navigation_completed']
			},
			{
				step: 'first_post_creation',
				estimatedDuration: 900000, // 15 minutes
				requiredActions: [
					'navigate_to_beginner_forum',
					'create_thread',
					'write_first_post',
					'submit_post'
				],
				expectedOutcomes: { threadCreated: true, xpAwarded: 25, reputationAwarded: 1 },
				validationCriteria: ['thread_published', 'xp_increase_shown', 'reputation_updated']
			},
			{
				step: 'community_engagement',
				estimatedDuration: 1200000, // 20 minutes
				requiredActions: [
					'receive_helpful_responses',
					'like_helpful_posts',
					'follow_helpful_users'
				],
				expectedOutcomes: { responsesReceived: 3, connectionsGained: 2 },
				validationCriteria: ['helpful_responses_visible', 'community_welcome_complete']
			}
		],
		emailVerificationDelay: faker.number.int({ min: 30000, max: 600000 }), // 30 seconds to 10 minutes
		verificationToken: faker.string.alphanumeric(32),
		firstThread: {
			id: faker.string.uuid(),
			title: faker.helpers.arrayElement([
				'New to crypto - where do I start?',
				'Complete beginner here - need guidance!',
				'How do I get started with cryptocurrency?',
				'What should I know before investing?',
				'Help! Feeling overwhelmed by all the crypto terms'
			]),
			content: `Hi everyone! I'm completely new to cryptocurrency and this community. I've been hearing a lot about Bitcoin and other cryptocurrencies but feeling pretty overwhelmed by all the information out there.

Where should I start? What are the absolute basics I need to understand before diving in? I don't want to make any costly mistakes!

Any recommended resources for complete beginners would be amazing. Thanks in advance for any help! 🙏`,
			forumId: 'beginner-questions'
		},
		expectedXP: {
			firstPost: 25,
			emailVerification: 10,
			total: 35
		},
		recommendedNextActions: [
			'Complete profile setup',
			'Read community guidelines',
			'Join beginner-friendly discussions',
			'Follow experienced community members'
		],
		helpfulUsers: [
			{
				id: faker.string.uuid(),
				username: 'helpful_veteran',
				expertise: 'general',
				responseStyle: 'encouraging'
			},
			{
				id: faker.string.uuid(),
				username: 'crypto_teacher',
				expertise: 'education',
				responseStyle: 'detailed'
			},
			{
				id: faker.string.uuid(),
				username: 'friendly_mod',
				expertise: 'community',
				responseStyle: 'welcoming'
			}
		]
	};
}

function generateCryptoWhaleJourney(): WhaleJourney {
	const username = `whale_${faker.string.alphanumeric(8)}`;

	return {
		user: {
			id: faker.string.uuid(),
			username,
			email: `${username}@${faker.helpers.arrayElement(['protonmail.com', 'tutanota.com'])}`,
			role: 'user',
			xp: faker.number.int({ min: 50000, max: 100000 }),
			level: faker.number.int({ min: 50, max: 99 }),
			dgtBalance: 5000000, // 5M DGT
			reputation: faker.number.int({ min: 8000, max: 9999 }),
			bio: 'Crypto whale 🐋 Early Bitcoin adopter since 2011. Building the future of DeFi. Diamond hands always. 💎🙌'
		},
		expectedBehavior: {
			sessionDuration: faker.number.int({ min: 1800000, max: 3600000 }), // 30-60 minutes
			pagesPerSession: faker.number.int({ min: 15, max: 30 }),
			actionsPerMinute: faker.number.int({ min: 5, max: 12 }),
			engagementScore: faker.number.int({ min: 80, max: 100 })
		},
		timeline: [
			{
				step: 'market_analysis_review',
				estimatedDuration: 600000, // 10 minutes
				requiredActions: ['check_portfolio', 'review_market_trends', 'read_analysis_posts'],
				expectedOutcomes: { marketsAnalyzed: 5, positionsReviewed: true },
				validationCriteria: ['market_data_accessed', 'portfolio_updated']
			},
			{
				step: 'high_value_transaction',
				estimatedDuration: 300000, // 5 minutes
				requiredActions: ['initiate_large_transfer', 'confirm_transaction', 'update_portfolio'],
				expectedOutcomes: { transactionCompleted: true, balanceUpdated: true },
				validationCriteria: ['transaction_success', 'balance_reflected']
			},
			{
				step: 'community_leadership',
				estimatedDuration: 1200000, // 20 minutes
				requiredActions: ['create_analysis_post', 'share_market_insights', 'respond_to_questions'],
				expectedOutcomes: { postsCreated: 2, responsesGiven: 5 },
				validationCriteria: ['quality_content_published', 'community_engagement_high']
			},
			{
				step: 'generous_tipping',
				estimatedDuration: 900000, // 15 minutes
				requiredActions: ['identify_quality_posts', 'send_generous_tips', 'encourage_creators'],
				expectedOutcomes: { tipsGiven: 8, dgtDistributed: 50000 },
				validationCriteria: ['tips_sent_successfully', 'community_appreciation']
			}
		],
		walletMetrics: {
			dailyVolume: faker.number.int({ min: 500000, max: 2000000 }),
			avgTransactionSize: faker.number.int({ min: 50000, max: 200000 }),
			tippingFrequency: faker.number.int({ min: 10, max: 30 }) // tips per day
		},
		marketInsight: {
			title: faker.helpers.arrayElement([
				'Bitcoin Macro Analysis: Why $100k is Conservative',
				'DeFi Summer 2.0: Hidden Gems in the Ecosystem',
				'Market Cycle Analysis: Where We Stand in 2024',
				'Why This Dip is Actually Bullish (Whale Perspective)',
				'On-Chain Analysis: Smart Money is Accumulating'
			]),
			content: `After 13 years in this space, I've seen multiple cycles and learned to read the macro trends. Here's my analysis:

**Technical Analysis:**
- Weekly RSI showing oversold conditions
- Support holding at critical Fibonacci level
- Volume patterns suggesting smart money accumulation

**Fundamental Factors:**
- Institutional adoption accelerating
- Regulatory clarity improving globally
- Network fundamentals stronger than ever

**My Position:**
I'm continuing to accumulate at these levels. The risk/reward is heavily skewed to the upside for patient investors.

Remember: Time in the market > timing the market. This is not financial advice, but I'm putting my money where my mouth is.

What are your thoughts? 💎🙌`,
			expectedEngagement: {
				viewsPerMinute: faker.number.int({ min: 50, max: 150 }),
				responses: faker.number.int({ min: 20, max: 50 }),
				likes: faker.number.int({ min: 100, max: 300 })
			}
		},
		tipAmounts: [
			faker.number.int({ min: 5000, max: 15000 }),
			faker.number.int({ min: 3000, max: 8000 }),
			faker.number.int({ min: 10000, max: 25000 })
		],
		expectedLargeTxCount: faker.number.int({ min: 8, max: 15 }),
		expectedDailyTipping: faker.number.int({ min: 30000, max: 100000 }),
		expectedEngagement: {
			viewsPerMinute: faker.number.int({ min: 30, max: 80 }),
			responses: faker.number.int({ min: 15, max: 40 })
		}
	};
}

function generateForumEngagementJourney(): ForumEngagementJourney {
	const username = `active_${faker.string.alphanumeric(8)}`;

	return {
		user: {
			id: faker.string.uuid(),
			username,
			email: `${username}@${faker.helpers.arrayElement(['gmail.com', 'outlook.com'])}`,
			role: 'user',
			xp: faker.number.int({ min: 5000, max: 25000 }),
			level: faker.number.int({ min: 10, max: 40 }),
			dgtBalance: faker.number.int({ min: 10000, max: 100000 }),
			reputation: faker.number.int({ min: 500, max: 3000 }),
			bio: faker.helpers.arrayElement([
				'Active trader and TA enthusiast. Love sharing knowledge! 📈',
				'DeFi maximalist. Building the future one transaction at a time.',
				'Crypto since 2017. Survived multiple bear markets. Still here! 💪',
				'Community first! Always happy to help newcomers learn crypto.'
			])
		},
		expectedBehavior: {
			sessionDuration: faker.number.int({ min: 900000, max: 2700000 }), // 15-45 minutes
			pagesPerSession: faker.number.int({ min: 10, max: 25 }),
			actionsPerMinute: faker.number.int({ min: 4, max: 10 }),
			engagementScore: faker.number.int({ min: 60, max: 85 })
		},
		timeline: [
			{
				step: 'forum_browsing',
				estimatedDuration: 600000, // 10 minutes
				requiredActions: ['check_hot_threads', 'browse_favorite_forums', 'scan_recent_posts'],
				expectedOutcomes: { threadsViewed: 15, forumsVisited: 5 },
				validationCriteria: ['hot_content_accessed', 'forum_navigation_completed']
			},
			{
				step: 'active_participation',
				estimatedDuration: 1200000, // 20 minutes
				requiredActions: ['reply_to_threads', 'like_quality_posts', 'share_insights'],
				expectedOutcomes: { repliesPosted: 8, likesGiven: 15 },
				validationCriteria: ['quality_responses_posted', 'engagement_distributed']
			},
			{
				step: 'content_creation',
				estimatedDuration: 900000, // 15 minutes
				requiredActions: ['create_discussion_thread', 'share_analysis', 'engage_with_responses'],
				expectedOutcomes: { threadsCreated: 2, followUpResponses: 5 },
				validationCriteria: ['original_content_published', 'discussion_facilitated']
			}
		],
		preferredForums: faker.helpers.arrayElements(
			[
				'general-trading',
				'technical-analysis',
				'market-news',
				'defi-discussion',
				'altcoin-discussion'
			],
			faker.number.int({ min: 2, max: 4 })
		),
		expectedMinPosts: faker.number.int({ min: 8, max: 20 }),
		expectedAverageLikes: faker.number.float({ min: 2.5, max: 8.0 }),
		expectedPostingFrequency: faker.number.float({ min: 0.3, max: 1.2 }), // posts per minute
		minimumEngagementRatio: faker.number.float({ min: 0.6, max: 0.9 })
	};
}

function generateEconomicParticipationJourney(): EconomicParticipationJourney {
	const username = `trader_${faker.string.alphanumeric(8)}`;

	return {
		user: {
			id: faker.string.uuid(),
			username,
			email: `${username}@${faker.helpers.arrayElement(['gmail.com', 'outlook.com'])}`,
			role: 'user',
			xp: faker.number.int({ min: 2000, max: 15000 }),
			level: faker.number.int({ min: 5, max: 30 }),
			dgtBalance: faker.number.int({ min: 5000, max: 75000 }),
			reputation: faker.number.int({ min: 200, max: 2000 }),
			bio: 'Active in the crypto economy. DGT holder and community supporter! 💰'
		},
		expectedBehavior: {
			sessionDuration: faker.number.int({ min: 600000, max: 1800000 }), // 10-30 minutes
			pagesPerSession: faker.number.int({ min: 8, max: 20 }),
			actionsPerMinute: faker.number.int({ min: 3, max: 8 }),
			engagementScore: faker.number.int({ min: 50, max: 80 })
		},
		timeline: [
			{
				step: 'wallet_management',
				estimatedDuration: 300000, // 5 minutes
				requiredActions: ['check_balances', 'review_transactions', 'plan_activities'],
				expectedOutcomes: { balanceConfirmed: true, transactionsReviewed: true },
				validationCriteria: ['wallet_accessed', 'transaction_history_reviewed']
			},
			{
				step: 'economic_activities',
				estimatedDuration: 900000, // 15 minutes
				requiredActions: ['make_purchases', 'send_tips', 'participate_in_economy'],
				expectedOutcomes: { purchasesMade: 2, tipsGiven: 5, economicActivity: true },
				validationCriteria: ['transactions_completed', 'economic_engagement_shown']
			},
			{
				step: 'value_creation',
				estimatedDuration: 600000, // 10 minutes
				requiredActions: ['contribute_content', 'help_community', 'earn_rewards'],
				expectedOutcomes: { contentContributed: true, rewardsEarned: true },
				validationCriteria: ['value_added_to_community', 'rewards_received']
			}
		],
		minimumStartingBalance: faker.number.int({ min: 1000, max: 5000 }),
		expectedTransactionTypes: ['DEPOSIT', 'TIP', 'PURCHASE', 'RAIN_PARTICIPATION'],
		economicBehavior: {
			spendingRatio: faker.number.float({ min: 0.1, max: 0.4 }), // 10-40% of balance
			savingsRatio: faker.number.float({ min: 0.4, max: 0.7 }), // 40-70% saved
			tippingRatio: faker.number.float({ min: 0.05, max: 0.2 }) // 5-20% for tipping
		}
	};
}

// Helper functions for test validation
export function validateJourneyProgression(
	actualMetrics: any,
	expectedJourney: UserJourney,
	stepName: string
): boolean {
	const step = expectedJourney.timeline.find((s) => s.step === stepName);
	if (!step) return false;

	// Validate each outcome
	for (const [outcome, expectedValue] of Object.entries(step.expectedOutcomes)) {
		const actualValue = actualMetrics[outcome];

		if (typeof expectedValue === 'boolean') {
			if (actualValue !== expectedValue) return false;
		} else if (typeof expectedValue === 'number') {
			if (Math.abs(actualValue - expectedValue) > expectedValue * 0.2) return false; // 20% tolerance
		}
	}

	return true;
}

export function generateTestScenarioData(scenarioType: string) {
	switch (scenarioType) {
		case 'multi-user-interaction':
			return {
				users: [
					generateUserJourney('newbie-onboarding'),
					generateUserJourney('crypto-whale'),
					generateUserJourney('forum-engagement')
				],
				expectedInteractions: [
					{ type: 'whale_tips_newbie', probability: 0.8 },
					{ type: 'veteran_helps_newbie', probability: 0.9 },
					{ type: 'community_welcomes_newbie', probability: 0.95 }
				]
			};

		case 'economic_ecosystem':
			return {
				economicFlow: {
					totalDGTInCirculation: 10000000,
					dailyTransactionVolume: 500000,
					averageUserBalance: 25000,
					tippingVolume: 50000
				},
				participants: Array.from({ length: 10 }, () =>
					generateUserJourney('economic-participation')
				)
			};

		default:
			throw new Error(`Unknown scenario type: ${scenarioType}`);
	}
}
