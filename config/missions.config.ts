/**
 * Mission System Configuration
 * 
 * Defines mission pools, rotation settings, and default missions
 * This config is the source of truth for mission behavior
 */

export const missionConfig = {
	// Daily mission settings
	daily: {
		poolSize: 5, // Number of missions offered daily
		randomSelection: true, // Randomly select from pool
		resetTime: '00:00', // UTC
		maxActive: 5 // Max concurrent daily missions
	},

	// Weekly mission settings
	weekly: {
		poolSize: 3,
		randomSelection: false, // All weekly missions available
		resetDay: 1, // Monday
		resetTime: '00:00',
		maxActive: 3
	},

	// Milestone missions (always active)
	milestone: {
		autoActivate: true,
		showProgress: true
	},

	// Event missions
	event: {
		maxConcurrent: 2,
		allowStacking: true
	},

	// Global settings
	global: {
		enableNotifications: true,
		showUpcomingMissions: true,
		allowMissionPreview: true
	}
};

// Default mission templates
export const defaultMissionTemplates = [
	// === DAILY MISSIONS ===
	{
		id: 'daily_posts',
		type: 'daily',
		title: 'Daily Contributor',
		description: 'Create 3 posts in any forum',
		action: 'post_created',
		target: 3,
		rewards: { xp: 50, dgt: 10 },
		icon: '✍️',
		minLevel: 1
	},
	{
		id: 'daily_engagement',
		type: 'daily',
		title: 'Engagement Boost',
		description: 'React to 10 posts today',
		action: 'reaction_given',
		target: 10,
		rewards: { xp: 30, dgt: 5 },
		icon: '👍',
		minLevel: 1
	},
	{
		id: 'daily_quality',
		type: 'daily',
		title: 'Quality Content',
		description: 'Write a post with at least 100 words',
		action: 'post_word_count',
		target: 100,
		rewards: { xp: 75, dgt: 15 },
		icon: '📝',
		minLevel: 5,
		conditions: {
			minWordCount: 100
		}
	},
	{
		id: 'daily_tips',
		type: 'daily',
		title: 'Generous Tipper',
		description: 'Tip 25 DGT to quality content',
		action: 'tip_amount',
		target: 25,
		rewards: { xp: 100, dgt: 10 },
		icon: '💰',
		minLevel: 10
	},
	{
		id: 'daily_helper',
		type: 'daily',
		title: 'Problem Solver',
		description: 'Have your post marked as solution',
		action: 'solution_accepted',
		target: 1,
		rewards: { xp: 150, dgt: 25 },
		icon: '✅',
		minLevel: 5
	},

	// === WEEKLY MISSIONS ===
	{
		id: 'weekly_threads',
		type: 'weekly',
		title: 'Thread Master',
		description: 'Start 5 new discussions this week',
		action: 'thread_created',
		target: 5,
		rewards: { xp: 300, dgt: 50 },
		icon: '🧵',
		minLevel: 3
	},
	{
		id: 'weekly_reputation',
		type: 'weekly',
		title: 'Reputation Builder',
		description: 'Receive 50 reactions on your content',
		action: 'reaction_received',
		target: 50,
		rewards: { xp: 400, dgt: 75, badge: 'weekly_star' },
		icon: '⭐',
		minLevel: 5
	},
	{
		id: 'weekly_forums',
		type: 'weekly',
		title: 'Forum Explorer',
		description: 'Post in 5 different forums',
		action: 'unique_forums_posted',
		target: 5,
		rewards: { xp: 250, dgt: 40 },
		icon: '🗺️',
		minLevel: 1
	},

	// === MILESTONE MISSIONS ===
	{
		id: 'first_post',
		type: 'milestone',
		title: 'First Steps',
		description: 'Create your first post',
		action: 'post_created',
		target: 1,
		rewards: { xp: 100, dgt: 25, badge: 'first_post' },
		icon: '🎯',
		minLevel: 1
	},
	{
		id: 'level_10',
		type: 'milestone',
		title: 'Double Digits',
		description: 'Reach Level 10',
		action: 'level_reached',
		target: 10,
		rewards: { xp: 500, dgt: 100, badge: 'level_10' },
		icon: '🏆',
		minLevel: 1
	},
	{
		id: 'tip_whale',
		type: 'milestone',
		title: 'DGT Whale',
		description: 'Tip a total of 1000 DGT',
		action: 'lifetime_tips',
		target: 1000,
		rewards: { xp: 1000, dgt: 200, badge: 'whale_tipper' },
		icon: '🐋',
		minLevel: 5
	},

	// === STACKING MISSIONS ===
	{
		id: 'post_streak',
		type: 'stacking',
		title: 'Posting Streak',
		description: 'Build your posting momentum',
		action: 'consecutive_days_posted',
		stages: [
			{ count: 3, reward: { xp: 100, dgt: 20 } },
			{ count: 7, reward: { xp: 300, dgt: 50 } },
			{ count: 14, reward: { xp: 700, dgt: 100, badge: 'streak_master' } },
			{ count: 30, reward: { xp: 1500, dgt: 250, badge: 'dedication' } }
		],
		icon: '🔥',
		minLevel: 1
	},
	{
		id: 'community_builder',
		type: 'stacking',
		title: 'Community Builder',
		description: 'Help others and build connections',
		action: 'helpful_posts',
		stages: [
			{ count: 10, reward: { xp: 150 } },
			{ count: 50, reward: { xp: 500, dgt: 50 } },
			{ count: 100, reward: { xp: 1000, dgt: 150, badge: 'helper' } },
			{ count: 250, reward: { xp: 2500, dgt: 500, badge: 'mentor' } }
		],
		icon: '🤝',
		minLevel: 3
	}
];

// Mission action definitions
export const missionActions = {
	// Content creation
	'post_created': { category: 'content', trackable: true },
	'thread_created': { category: 'content', trackable: true },
	'post_word_count': { category: 'content', trackable: true, metadata: ['wordCount'] },
	
	// Engagement
	'reaction_given': { category: 'engagement', trackable: true },
	'reaction_received': { category: 'engagement', trackable: true },
	'tip_amount': { category: 'engagement', trackable: true, metadata: ['amount'] },
	'solution_accepted': { category: 'engagement', trackable: true },
	
	// Progression
	'level_reached': { category: 'progression', trackable: false }, // Checked on level up
	'lifetime_tips': { category: 'progression', trackable: false }, // Aggregated
	'consecutive_days_posted': { category: 'progression', trackable: false }, // Computed
	'unique_forums_posted': { category: 'progression', trackable: true, metadata: ['forumId'] },
	'helpful_posts': { category: 'progression', trackable: true } // Posts with solutions
};

// Reward multipliers for special events
export const rewardMultipliers = {
	doubleXpWeekend: {
		xp: 2,
		dgt: 1,
		active: false
	},
	newUserBonus: {
		xp: 1.5,
		dgt: 1.5,
		durationDays: 7
	},
	vipBonus: {
		xp: 1.2,
		dgt: 1.2,
		requiresRole: 'vip'
	}
};