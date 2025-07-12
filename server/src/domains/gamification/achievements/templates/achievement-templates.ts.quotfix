/**
 * Achievement Templates
 *
 * Pre-built achievement configurations for common degen culture achievements.
 * Templates can be imported into the admin panel for quick setup.
 */

import type { InsertAchievement } from '@schema/gamification/achievements';

export interface AchievementTemplate
	extends Omit<InsertAchievement, 'id' | 'createdAt' | 'updatedAt'> {
	templateId: string;
	templateName: string;
	templateDescription: string;
	tags: string[];
}

export const CORE_ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
	// === PARTICIPATION BADGES ===
	{
		templateId: 'first_post',
		templateName: 'First Post',
		templateDescription: 'Basic participation - user makes their first post',
		tags: ['core', 'participation', 'onboarding'],

		key: 'first_post',
		name: 'Welcome to Degentalk',
		description: 'Posted your first message to the community',
		category: 'participation',
		tier: 'common',
		iconEmoji: '👋',

		triggerType: 'count',
		triggerConfig: {
			action: 'posts_created',
			target: 1
		},

		rewardXp: 50,
		rewardDgt: 10,
		unlockMessage: "Welcome to the degen family! You've made your first post!",
		isRetroactive: true
	},

	{
		templateId: 'thread_starter',
		templateName: 'Thread Starter',
		templateDescription: 'Creates their first thread',
		tags: ['participation', 'content'],

		key: 'thread_starter',
		name: 'Thread Starter',
		description: 'Started your first discussion thread',
		category: 'participation',
		tier: 'common',
		iconEmoji: '🧵',

		triggerType: 'count',
		triggerConfig: {
			action: 'threads_created',
			target: 1
		},

		rewardXp: 100,
		rewardDgt: 25,
		unlockMessage: 'You started the conversation! Thread creation unlocked!',
		isRetroactive: true
	},

	{
		templateId: 'regular_contributor',
		templateName: 'Regular Contributor',
		templateDescription: 'Makes 50 posts',
		tags: ['participation', 'progression'],

		key: 'regular_contributor',
		name: 'Regular Contributor',
		description: 'Made 50 quality posts to the community',
		category: 'participation',
		tier: 'rare',
		iconEmoji: '📝',

		triggerType: 'count',
		triggerConfig: {
			action: 'posts_created',
			target: 50
		},

		rewardXp: 500,
		rewardDgt: 100,
		rewardClout: 25,
		unlockMessage: "You're becoming a regular! Keep the quality content coming!"
	},

	{
		templateId: 'shoutbox_warrior',
		templateName: 'Shoutbox Warrior',
		templateDescription: 'Active in shoutbox chat',
		tags: ['social', 'chat'],

		key: 'shoutbox_warrior',
		name: 'Shoutbox Warrior',
		description: 'Sent 100 messages in the shoutbox',
		category: 'social',
		tier: 'rare',
		iconEmoji: '💬',

		triggerType: 'count',
		triggerConfig: {
			action: 'shoutbox_messages',
			target: 100
		},

		rewardXp: 200,
		rewardDgt: 50,
		unlockMessage: 'The shoutbox knows your name! Chat master achieved!'
	},

	// === XP & PROGRESSION ===
	{
		templateId: 'level_up_5',
		templateName: 'Level 5 Achievement',
		templateDescription: 'Reaches level 5',
		tags: ['progression', 'xp'],

		key: 'level_up_5',
		name: 'Rising Star',
		description: 'Reached level 5 in the community',
		category: 'progression',
		tier: 'common',
		iconEmoji: '⭐',

		triggerType: 'threshold',
		triggerConfig: {
			metric: 'user_level',
			target: 5
		},

		rewardXp: 250,
		rewardDgt: 50,
		unlockMessage: "Level 5 unlocked! You're gaining momentum!"
	},

	{
		templateId: 'xp_milestone_1000',
		templateName: '1K XP Milestone',
		templateDescription: 'Earns 1000 total XP',
		tags: ['progression', 'xp'],

		key: 'xp_milestone_1000',
		name: 'XP Collector',
		description: 'Earned your first 1,000 experience points',
		category: 'progression',
		tier: 'rare',
		iconEmoji: '🎯',

		triggerType: 'threshold',
		triggerConfig: {
			metric: 'total_xp',
			target: 1000
		},

		rewardXp: 100,
		rewardDgt: 100,
		rewardClout: 10,
		unlockMessage: '1K XP milestone reached! Experience is everything!'
	},

	// === CLOUT & REPUTATION ===
	{
		templateId: 'first_tip',
		templateName: 'First Tip',
		templateDescription: 'Receives first tip',
		tags: ['social', 'economy'],

		key: 'first_tip',
		name: 'Tipped!',
		description: 'Received your first tip from another user',
		category: 'social',
		tier: 'common',
		iconEmoji: '💰',

		triggerType: 'count',
		triggerConfig: {
			action: 'tips_received',
			target: 1
		},

		rewardXp: 100,
		rewardDgt: 25,
		unlockMessage: 'Someone appreciated your content! First tip received!'
	},

	{
		templateId: 'generous_tipper',
		templateName: 'Generous Tipper',
		templateDescription: 'Sends 10 tips to others',
		tags: ['social', 'economy', 'generosity'],

		key: 'generous_tipper',
		name: 'Generous Heart',
		description: 'Sent 10 tips to appreciate other users',
		category: 'social',
		tier: 'rare',
		iconEmoji: '🤲',

		triggerType: 'count',
		triggerConfig: {
			action: 'tips_sent',
			target: 10
		},

		rewardXp: 200,
		rewardDgt: 100,
		rewardClout: 50,
		unlockMessage: 'Your generosity shines! Spreading the wealth!'
	},

	// === DEGEN CULTURE BADGES ===
	{
		templateId: 'bag_holder',
		templateName: 'Bag Holder',
		templateDescription: 'Experiences significant portfolio loss',
		tags: ['degen', 'culture', 'loss'],

		key: 'bag_holder',
		name: 'Certified Bag Holder',
		description: 'Lost over $1000 in a single day. F in the chat.',
		category: 'cultural',
		tier: 'epic',
		iconEmoji: '👜',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_wallet_loss',
			config: {
				minimumLoss: 1000,
				timeframe: 24
			}
		},

		rewardXp: 500,
		rewardDgt: 250,
		rewardClout: 100,
		unlockMessage: 'Welcome to the bag holders club! Diamond hands formation training begins now.',
		isSecret: false
	},

	{
		templateId: 'diamond_hands',
		templateName: 'Diamond Hands',
		templateDescription: 'Holds through major drawdowns',
		tags: ['degen', 'culture', 'hodl'],

		key: 'diamond_hands',
		name: '💎🙌 Diamond Hands',
		description: 'Held through 50%+ drawdown for 30+ days',
		category: 'cultural',
		tier: 'legendary',
		iconEmoji: '💎',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_diamond_hands',
			config: {
				minimumHoldDays: 30,
				minimumDrawdown: 50
			}
		},

		rewardXp: 1000,
		rewardDgt: 500,
		rewardClout: 200,
		unlockMessage: 'DIAMOND HANDS CONFIRMED! 💎🙌 You are the legend!'
	},

	{
		templateId: 'paper_hands',
		templateName: 'Paper Hands',
		templateDescription: 'Panic sells multiple times',
		tags: ['degen', 'culture', 'panic'],

		key: 'paper_hands',
		name: '📄🙌 Paper Hands',
		description: 'Panic sold 3 times in one week',
		category: 'cultural',
		tier: 'rare',
		iconEmoji: '📄',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_paper_hands',
			config: {
				requiredPanicSells: 3,
				timeframe: 168 // 1 week
			}
		},

		rewardXp: 200,
		rewardDgt: 50,
		unlockMessage: 'Paper hands detected! 📄🙌 Practice makes perfect... maybe.',
		isSecret: false
	},

	{
		templateId: 'thread_necromancer',
		templateName: 'Thread Necromancer',
		templateDescription: 'Revives old dead threads',
		tags: ['culture', 'forum'],

		key: 'thread_necromancer',
		name: 'Thread Necromancer',
		description: 'Revived 3 threads that were dead for 90+ days',
		category: 'cultural',
		tier: 'epic',
		iconEmoji: '🧙‍♂️',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_thread_necromancy',
			config: {
				requiredNecromancies: 3,
				minimumThreadAge: 90
			}
		},

		rewardXp: 300,
		rewardDgt: 150,
		rewardClout: 75,
		unlockMessage: 'Thread necromancy mastered! Bringing the dead back to life!'
	},

	{
		templateId: 'crash_prophet',
		templateName: 'Crash Prophet',
		templateDescription: 'Posts doom sentiment during crashes',
		tags: ['culture', 'sentiment'],

		key: 'crash_prophet',
		name: 'Crash Prophet',
		description: 'Posted bearish sentiment during 5 market crashes',
		category: 'cultural',
		tier: 'rare',
		iconEmoji: '🔮',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_crash_sentiment',
			config: {
				requiredPosts: 5,
				sentimentThreshold: 0.7
			}
		},

		rewardXp: 400,
		rewardDgt: 200,
		rewardClout: 100,
		unlockMessage: 'Your doom posting skills are legendary! Crash prophet confirmed!'
	},

	// === SECRET ACHIEVEMENTS ===
	{
		templateId: 'night_owl_secret',
		templateName: 'Night Owl (Secret)',
		templateDescription: 'Posts frequently during night hours',
		tags: ['secret', 'behavior'],

		key: 'night_owl_secret',
		name: '🦉 Night Owl',
		description: 'Made 50 posts between 10 PM and 6 AM',
		category: 'secret',
		tier: 'epic',
		iconEmoji: '🦉',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_night_owl',
			config: {
				nightPostsRequired: 50,
				startHour: 22,
				endHour: 6
			}
		},

		rewardXp: 300,
		rewardDgt: 200,
		rewardClout: 50,
		unlockMessage: 'The night belongs to you! 🦉 Secret achievement unlocked!',
		isSecret: true
	},

	{
		templateId: 'weekend_warrior_secret',
		templateName: 'Weekend Warrior (Secret)',
		templateDescription: 'Very active on weekends',
		tags: ['secret', 'behavior'],

		key: 'weekend_warrior_secret',
		name: '⚔️ Weekend Warrior',
		description: 'Made 20 posts on weekends',
		category: 'secret',
		tier: 'rare',
		iconEmoji: '⚔️',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_weekend_warrior',
			config: {
				weekendPostsRequired: 20
			}
		},

		rewardXp: 250,
		rewardDgt: 150,
		unlockMessage: 'Weekend grindset activated! ⚔️ Secret achievement unlocked!',
		isSecret: true
	},

	{
		templateId: 'meme_lord_secret',
		templateName: 'Meme Lord (Secret)',
		templateDescription: 'Posts many meme-related content',
		tags: ['secret', 'culture', 'memes'],

		key: 'meme_lord_secret',
		name: '🐸 Meme Lord',
		description: 'Posted 100 meme-worthy messages',
		category: 'secret',
		tier: 'legendary',
		iconEmoji: '🐸',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_meme_lord',
			config: {
				memePostsRequired: 100
			}
		},

		rewardXp: 500,
		rewardDgt: 300,
		rewardClout: 150,
		unlockMessage: 'Meme mastery achieved! 🐸 You are the meme lord now!',
		isSecret: true
	},

	// === ECONOMY ACHIEVEMENTS ===
	{
		templateId: 'whale_tip',
		templateName: 'Whale Tip',
		templateDescription: 'Sends a massive tip',
		tags: ['economy', 'whale'],

		key: 'whale_tip',
		name: '🐋 Whale Tipper',
		description: 'Sent a single tip worth 10,000+ DGT',
		category: 'economy',
		tier: 'legendary',
		iconEmoji: '🐋',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_tip_whale',
			config: {
				minimumTipAmount: 10000,
				timeframe: 24
			}
		},

		rewardXp: 1000,
		rewardDgt: 500,
		rewardClout: 500,
		unlockMessage: 'WHALE DETECTED! 🐋 Your generosity is legendary!'
	},

	{
		templateId: 'market_prophet',
		templateName: 'Market Prophet',
		templateDescription: 'Makes accurate market predictions',
		tags: ['economy', 'prediction'],

		key: 'market_prophet',
		name: '🔮 Market Prophet',
		description: 'Made 10 market predictions with 80%+ accuracy',
		category: 'economy',
		tier: 'mythic',
		iconEmoji: '🔮',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_market_prophet',
			config: {
				minimumAccuracy: 0.8,
				minimumPredictions: 10
			}
		},

		rewardXp: 2000,
		rewardDgt: 1000,
		rewardClout: 1000,
		unlockMessage: 'PROPHET STATUS CONFIRMED! 🔮 Your market insights are legendary!'
	}
];

export const CULTURAL_ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
	{
		templateId: 'fomo_master',
		templateName: 'FOMO Master',
		templateDescription: 'Shows classic FOMO behavior',
		tags: ['culture', 'fomo'],

		key: 'fomo_master',
		name: '🚀 FOMO Master',
		description: 'Exhibited peak FOMO behavior 10 times',
		category: 'cultural',
		tier: 'epic',
		iconEmoji: '🚀',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_fomo_master',
			config: {
				requiredFomoActions: 10,
				timeframe: 168
			}
		},

		rewardXp: 300,
		rewardDgt: 200,
		unlockMessage: 'FOMO level: MAXIMUM! 🚀 To the moon!'
	},

	{
		templateId: 'contrarian_genius',
		templateName: 'Contrarian Genius',
		templateDescription: 'Goes against popular sentiment',
		tags: ['culture', 'contrarian'],

		key: 'contrarian_genius',
		name: '🎭 Contrarian Genius',
		description: 'Posted contrarian takes 25 times',
		category: 'cultural',
		tier: 'legendary',
		iconEmoji: '🎭',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_contrarian',
			config: {
				contrarianPostsRequired: 25
			}
		},

		rewardXp: 750,
		rewardDgt: 400,
		rewardClout: 200,
		unlockMessage: "Contrarian genius confirmed! 🎭 You see what others don't!"
	},

	{
		templateId: 'comeback_king',
		templateName: 'Comeback King',
		templateDescription: 'Recovers from major losses',
		tags: ['culture', 'recovery'],

		key: 'comeback_king',
		name: '👑 Comeback King',
		description: 'Recovered from a 5000+ DGT loss with diamond hands',
		category: 'cultural',
		tier: 'mythic',
		iconEmoji: '👑',

		triggerType: 'custom',
		triggerConfig: {
			evaluator: 'check_loss_recovery',
			config: {
				minimumLoss: 5000,
				recoveryMultiplier: 1.5
			}
		},

		rewardXp: 1500,
		rewardDgt: 750,
		rewardClout: 500,
		unlockMessage: 'COMEBACK KING CROWNED! 👑 From rekt to riches!'
	}
];

/**
 * Get all achievement templates organized by category
 */
export function getAllAchievementTemplates(): Record<string, AchievementTemplate[]> {
	return {
		core: CORE_ACHIEVEMENT_TEMPLATES,
		cultural: CULTURAL_ACHIEVEMENT_TEMPLATES,
		all: [...CORE_ACHIEVEMENT_TEMPLATES, ...CULTURAL_ACHIEVEMENT_TEMPLATES]
	};
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string): AchievementTemplate | null {
	const allTemplates = [...CORE_ACHIEVEMENT_TEMPLATES, ...CULTURAL_ACHIEVEMENT_TEMPLATES];
	return allTemplates.find((template) => template.templateId === templateId) || null;
}

/**
 * Get templates by tags
 */
export function getTemplatesByTags(tags: string[]): AchievementTemplate[] {
	const allTemplates = [...CORE_ACHIEVEMENT_TEMPLATES, ...CULTURAL_ACHIEVEMENT_TEMPLATES];
	return allTemplates.filter((template) => tags.some((tag) => template.tags.includes(tag)));
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): AchievementTemplate[] {
	const allTemplates = [...CORE_ACHIEVEMENT_TEMPLATES, ...CULTURAL_ACHIEVEMENT_TEMPLATES];
	return allTemplates.filter((template) => template.category === category);
}
