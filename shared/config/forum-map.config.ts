// ForumMap Configuration - Single Source of Truth
// This file defines the canonical forum structure, themes, and rules for Degentalk

import { z } from 'zod';

// --- Type Definitions ---

export const FORUM_TYPES = ['featured', 'regular'] as const;
export type ForumType = (typeof FORUM_TYPES)[number];

// Zod Schemas for validation
const PrefixGrantRuleSchema = z.object({
	slug: z.string(),
	autoAssign: z.boolean(),
	condition: z.optional(
		z.object({
			minReplies: z.optional(z.number()),
			minLikes: z.optional(z.number()),
			minXp: z.optional(z.number()),
			role: z.optional(z.string())
		})
	)
});

const ForumRulesSchema = z.object({
	allowPosting: z.boolean(),
	xpEnabled: z.boolean(),
	tippingEnabled: z.boolean(),
	xpMultiplier: z.optional(z.number()),
	accessLevel: z.optional(
		z.enum(['public', 'registered', 'level_10+', 'vip', 'moderator', 'admin'])
	),
	minXpRequired: z.optional(z.number()),
	allowPolls: z.optional(z.boolean()),
	allowTags: z.optional(z.boolean()),
	allowAttachments: z.optional(z.boolean()),
	availablePrefixes: z.optional(z.array(z.string())),
	prefixGrantRules: z.optional(z.array(PrefixGrantRuleSchema)),
	requiredPrefix: z.optional(z.boolean()),
	customComponent: z.optional(z.string()),
	customRules: z.optional(z.record(z.unknown()))
});

const ForumThemeSchema = z.object({
	color: z.string(),
	icon: z.string(),
	colorTheme: z.string(),
	bannerImage: z.optional(z.string()),
	backgroundImage: z.optional(z.string()),
	landingComponent: z.optional(z.string()),
	customStyles: z.optional(z.record(z.string()))
});

// TypeScript types that need to be defined before Forum
export type ForumRules = z.infer<typeof ForumRulesSchema>;
export type ForumTheme = z.infer<typeof ForumThemeSchema>;

// Forum type definition
export type Forum = {
	slug: string;
	name: string;
	description?: string;
	rules: ForumRules;
	themeOverride?: Partial<ForumTheme>;
	position?: number;
	tags?: string[];
	forums?: Forum[];
};

// Forum schema with recursive subforums - using simpler approach
const ForumSchema: z.ZodType<Forum> = z.lazy(() => 
	z.object({
		slug: z.string(),
		name: z.string(),
		description: z.optional(z.string()),
		rules: ForumRulesSchema,
		themeOverride: z.optional(ForumThemeSchema.partial()),
		position: z.optional(z.number()),
		tags: z.optional(z.array(z.string())),
		forums: z.optional(z.array(ForumSchema))
	})
);

const RootForumSchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.string(),
	isFeatured: z.boolean(),
	position: z.optional(z.number()),
	theme: ForumThemeSchema,
	defaultRules: z.optional(ForumRulesSchema.partial()),
	forums: z.array(ForumSchema)
});

// Export the main schema
export const forumMapSchema = z.object({
	forums: z.array(RootForumSchema),
	version: z.string(),
	lastUpdated: z.string()
});

// TypeScript types derived from Zod schemas
export type PrefixGrantRule = z.infer<typeof PrefixGrantRuleSchema>;
// ForumRules, ForumTheme, and Forum are defined above
export type RootForum = z.infer<typeof RootForumSchema>;
export type ForumMap = z.infer<typeof forumMapSchema>;

// --- Theme Presets ---

const THEME_PRESETS = {
	pit: {
		color: '#FF4D00',
		icon: '🔥',
		colorTheme: 'theme-pit',
		bannerImage: '/assets/banners/the-pit.webp',
		landingComponent: 'PitLanding'
	},
	mission: {
		color: '#3B82F6',
		icon: '🎯',
		colorTheme: 'theme-mission',
		bannerImage: '/assets/banners/mission-control.webp',
		landingComponent: 'MissionLanding'
	},
	casino: {
		color: '#B950FF',
		icon: '🎲',
		colorTheme: 'theme-casino',
		bannerImage: '/assets/banners/casino-floor.webp',
		landingComponent: 'CasinoLanding'
	},
	briefing: {
		color: '#FFD700',
		icon: '📰',
		colorTheme: 'theme-briefing',
		bannerImage: '/assets/banners/briefing-room.webp',
		landingComponent: 'BriefingLanding'
	},
	archive: {
		color: '#6B7280',
		icon: '📁',
		colorTheme: 'theme-archive',
		bannerImage: '/assets/banners/the-archive.webp',
		landingComponent: 'ArchiveLanding'
	},
	shop: {
		color: 'holographic',
		icon: '💰',
		colorTheme: 'theme-shop',
		bannerImage: '/assets/banners/degenshop.webp',
		landingComponent: 'ShopCard'
	}
} as const;

// --- Default Rules ---

export const DEFAULT_FORUM_RULES: ForumRules = {
	allowPosting: true,
	xpEnabled: true,
	tippingEnabled: false,
	xpMultiplier: 1,
	accessLevel: 'registered',
	allowPolls: true,
	allowTags: true,
	allowAttachments: true,
	requiredPrefix: false
};

// --- Forum Configurations ---

const FEATURED_FORUMS: RootForum[] = [
	{
		slug: 'the-pit',
		name: 'The Pit',
		description:
			'The daily war-zone for raw market chatter, meme combat, instant wins & public rekt logs.',
		isFeatured: true,
		position: 1,
		theme: THEME_PRESETS.pit,
		defaultRules: {
			tippingEnabled: true,
			xpMultiplier: 1.5
		},
		forums: [
			{
				slug: 'live-trade-reacts',
				name: 'Live-Trade Reacts',
				description: 'Real-time trading reactions and market moves',
				position: 1,
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					xpMultiplier: 2,
					availablePrefixes: ['[LIVE]', '[TRADE]', '[🔺UP]', '[🧂SALT]', '[🪦REKT]'],
					customRules: {
						noStyleLocks: true,
						xpBoostOnRedMarket: true
					}
				}
			},
			{
				slug: 'shill-zone',
				name: 'Shill Zone',
				description: 'Pump your bags, shill your gems',
				position: 2,
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					xpMultiplier: 1.5,
					availablePrefixes: ['[SHILL]', '[GEM]', '[MOON]', '[PUMP]'],
					requiredPrefix: true
				}
			},
			{
				slug: 'rekt-histories',
				name: 'REKT Histories',
				description: 'Hall of shame for the biggest losses',
				position: 3,
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					availablePrefixes: ['[REKT]', '[GUH]', '[F]', '[LIQUIDATED]']
				}
			}
		]
	},
	{
		slug: 'mission-control',
		name: 'Mission Control',
		description:
			'Serious strategy hub: alpha drops, trade plans, research dumps, daily missions & leaderboards.',
		isFeatured: true,
		position: 2,
		theme: THEME_PRESETS.mission,
		defaultRules: {
			xpMultiplier: 2,
			accessLevel: 'registered'
		},
		forums: [
			{
				slug: 'alpha-channel',
				name: 'Alpha Channel',
				description: 'Premium alpha drops and insider intel',
				position: 1,
				rules: {
					...DEFAULT_FORUM_RULES,
					xpMultiplier: 3,
					tippingEnabled: true,
					accessLevel: 'level_10+',
					availablePrefixes: ['[ALPHA]', '[LEAK]', '[INSIDER]', '[CONFIRMED]'],
					customRules: {
						threadCreationLocked: ['moderator', 'admin']
					}
				}
			},
			{
				slug: 'trade-logs',
				name: 'Trade Logs',
				description: 'Detailed trade journaling and performance tracking',
				position: 2,
				rules: {
					...DEFAULT_FORUM_RULES,
					xpMultiplier: 2,
					availablePrefixes: ['[LOG]', '[ENTRY]', '[EXIT]', '[ANALYSIS]'],
					allowAttachments: true
				}
			},
			{
				slug: 'challenge-board',
				name: 'Challenge Board',
				description: 'Daily missions, flash challenges, and bounties',
				position: 3,
				rules: {
					...DEFAULT_FORUM_RULES,
					xpMultiplier: 2.5,
					tippingEnabled: true,
					availablePrefixes: ['[DAILY]', '[CHALLENGE]', '[BOUNTY]', '[MISSION]'],
					customComponent: 'DailyTaskWidget'
				}
			}
		]
	},
	{
		slug: 'casino-floor',
		name: 'Casino Floor',
		description: 'All gambling content: dice, limbo, degen scripts, RTP leaks.',
		isFeatured: true,
		position: 3,
		theme: THEME_PRESETS.casino,
		defaultRules: {
			tippingEnabled: true,
			xpMultiplier: 2
		},
		forums: [
			{
				slug: 'strategy-scripts',
				name: 'Strategy & Scripts',
				description: 'Betting strategies, auto-scripts, and systems',
				position: 1,
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					xpMultiplier: 2,
					availablePrefixes: ['[DICE]', '[LIMBO]', '[STRATEGY]', '[SCRIPT]'],
					customRules: {
						tagPrefixRequired: true
					}
				}
			},
			{
				slug: 'live-bets-results',
				name: 'Live Bets & Results',
				description: 'Real-time betting results and session logs',
				position: 2,
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					xpMultiplier: 2.5,
					availablePrefixes: ['[BET]', '[WIN]', '[LOSS]', '[SESSION]'],
					customRules: {
						streakXP: true
					}
				}
			},
			{
				slug: 'exploit-watch',
				name: 'Exploit Watch',
				description: 'RTP analysis, exploit reports, and rigged discussions',
				position: 3,
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					availablePrefixes: ['[EXPLOIT]', '[RTP]', '[RIGGED]', '[ANALYSIS]'],
					customComponent: 'IsItRiggedPoll'
				}
			}
		]
	},
	{
		slug: 'briefing-room',
		name: 'Briefing Room',
		description:
			'Official comms & community governance: announcements, patch notes, bug reports, suggestions.',
		isFeatured: true,
		position: 4,
		theme: THEME_PRESETS.briefing,
		defaultRules: {
			xpEnabled: true,
			tippingEnabled: false
		},
		forums: [
			{
				slug: 'announcements',
				name: 'Announcements',
				description: 'Official Degentalk platform updates',
				position: 1,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					accessLevel: 'admin',
					availablePrefixes: ['[ANNOUNCEMENT]', '[UPDATE]', '[CRITICAL]'],
					customRules: {
						upvoteOnly: true
					}
				}
			},
			{
				slug: 'patch-notes',
				name: 'Patch Notes',
				description: 'Platform updates and feature releases',
				position: 2,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					accessLevel: 'admin',
					availablePrefixes: ['[PATCH]', '[RELEASE]', '[HOTFIX]']
				}
			},
			{
				slug: 'suggestions',
				name: 'Suggestions',
				description: 'Community suggestions and feature requests',
				position: 3,
				rules: {
					...DEFAULT_FORUM_RULES,
					availablePrefixes: ['[SUGGESTION]', '[IDEA]', '[FEEDBACK]'],
					requiredPrefix: true,
					customRules: {
						upvoteOnly: true
					}
				}
			},
			{
				slug: 'bug-reports',
				name: 'Bug Reports',
				description: 'Report bugs and technical issues',
				position: 4,
				rules: {
					...DEFAULT_FORUM_RULES,
					availablePrefixes: ['[BUG]', '[ISSUE]', '[BROKEN]'],
					requiredPrefix: true,
					allowAttachments: true
				}
			}
		]
	},
	{
		slug: 'the-archive',
		name: 'The Archive',
		description: 'Read-only vault of legendary threads & historic market moments.',
		isFeatured: true,
		position: 5,
		theme: THEME_PRESETS.archive,
		defaultRules: {
			allowPosting: false,
			xpEnabled: false
		},
		forums: [
			{
				slug: 'legendary-threads',
				name: 'Legendary Threads',
				description: 'The most epic calls and threads in Degentalk history',
				position: 1,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					accessLevel: 'public',
					availablePrefixes: ['[LEGEND]', '[CLASSIC]', '[HISTORIC]'],
					customRules: {
						searchOnly: true,
						hallOfFameBadge: true
					}
				}
			},
			{
				slug: 'rugged-remembered',
				name: 'Rugged & Remembered',
				description: 'Never forget the biggest rugs and scams',
				position: 2,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					availablePrefixes: ['[RUGGED]', '[SCAM]', '[EXIT]'],
					customRules: {
						searchOnly: true
					}
				}
			},
			{
				slug: 'cringe-museum',
				name: 'Cringe Museum',
				description: 'The worst takes and predictions preserved forever',
				position: 3,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					availablePrefixes: ['[CRINGE]', '[AGED-POORLY]', '[WRONG]'],
					customRules: {
						searchOnly: true
					}
				}
			}
		]
	}
];

// Regular forums (not featured)
const REGULAR_FORUMS: RootForum[] = [
	{
		slug: 'defi-lab',
		name: 'DeFi Laboratory',
		description: 'DeFi protocols, yield farming, and strategies',
		isFeatured: false,
		position: 10,
		theme: {
			color: '#9CA3AF',
			icon: '🧪',
			colorTheme: 'theme-neutral'
		},
		forums: [
			{
				slug: 'yield-farming',
				name: 'Yield Farming',
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					availablePrefixes: ['[FARM]', '[APY]', '[YIELD]', '[RISK]']
				}
			},
			{
				slug: 'protocol-discussion',
				name: 'Protocol Discussion',
				rules: {
					...DEFAULT_FORUM_RULES,
					availablePrefixes: ['[PROTOCOL]', '[AUDIT]', '[SECURITY]']
				}
			}
		]
	},
	{
		slug: 'nft-district',
		name: 'NFT District',
		description: 'JPEGs, art, and digital collectibles',
		isFeatured: false,
		position: 11,
		theme: {
			color: '#9CA3AF',
			icon: '🎨',
			colorTheme: 'theme-neutral'
		},
		forums: [
			{
				slug: 'nft-calls',
				name: 'NFT Calls',
				rules: {
					...DEFAULT_FORUM_RULES,
					tippingEnabled: true,
					availablePrefixes: ['[MINT]', '[FLIP]', '[HODL]', '[BLUECHIP]']
				}
			},
			{
				slug: 'art-gallery',
				name: 'Art Gallery',
				rules: {
					...DEFAULT_FORUM_RULES,
					allowAttachments: true,
					availablePrefixes: ['[ART]', '[SHOWCASE]', '[COLLECTION]']
				}
			}
		]
	},
	{
		slug: 'market-analysis',
		name: 'Market Analysis',
		description: 'Technical analysis and market discussion',
		isFeatured: false,
		position: 12,
		theme: {
			color: '#9CA3AF',
			icon: '📈',
			colorTheme: 'theme-neutral'
		},
		forums: [
			{
				slug: 'btc-analysis',
				name: 'BTC Analysis',
				rules: {
					...DEFAULT_FORUM_RULES,
					availablePrefixes: ['[TA]', '[FA]', '[SIGNAL]', '[TARGET]']
				}
			},
			{
				slug: 'altcoin-analysis',
				name: 'Altcoin Analysis',
				description: 'Discussions about various altcoins.',
				rules: { ...DEFAULT_FORUM_RULES, availablePrefixes: ['[ALT]', '[GEM]', '[ANALYSIS]'] },
				forums: [
					{ slug: 'large-cap-alts', name: 'Large Cap Alts', rules: { ...DEFAULT_FORUM_RULES } },
					{
						slug: 'small-cap-gems',
						name: 'Small Cap Gems',
						rules: { ...DEFAULT_FORUM_RULES, xpMultiplier: 1.2 }
					}
				]
			}
		]
	}
];

// --- Export Configuration ---

export const forumMap: ForumMap = {
	forums: [...FEATURED_FORUMS, ...REGULAR_FORUMS],
	version: '2.0.0',
	lastUpdated: new Date().toISOString()
};

// Helper methods
export const getForumBySlug = (slug: string): { forum: Forum; parent: RootForum } | null => {
	for (const rootForum of forumMap.forums) {
		const forum = rootForum.forums.find((f) => f.slug === slug);
		if (forum) return { forum, parent: rootForum };
		
		// Search subforums one level deep
		for (const parentForum of rootForum.forums) {
			if (parentForum.forums) {
				const sub = parentForum.forums.find((sf) => sf.slug === slug);
				if (sub) return { forum: sub, parent: rootForum };
			}
		}
	}
	return null;
};

export const getFeaturedForums = () => forumMap.forums.filter((f) => f.isFeatured);
export const getRegularForums = () => forumMap.forums.filter((f) => !f.isFeatured);

// --- Validation ---

// Helper function for validation
function validateForumSlugs(forums: Forum[], parentPath: string, allSlugs: Set<string>) {
	forums.forEach((forum) => {
		const currentPath = `${parentPath} > ${forum.name} (${forum.slug})`;
		if (allSlugs.has(forum.slug)) {
			throw new Error(
				`Duplicate forum slug detected: '${forum.slug}' at path: ${currentPath}. Slugs must be globally unique.`
			);
		}
		allSlugs.add(forum.slug);

		if (forum.forums && forum.forums.length > 0) {
			validateForumSlugs(forum.forums, currentPath, allSlugs);
		}
	});
}

// Validate on module load
try {
	forumMapSchema.parse(forumMap);
	
	// Additional validation: ensure unique slugs
	const allSlugs = new Set<string>();

	forumMap.forums.forEach((rootForum) => {
		const rootPath = `Forum: ${rootForum.name} (${rootForum.slug})`;
		if (allSlugs.has(rootForum.slug)) {
			throw new Error(`Duplicate root forum slug: ${rootForum.slug}`);
		}
		allSlugs.add(rootForum.slug);

		if (rootForum.forums && rootForum.forums.length > 0) {
			validateForumSlugs(rootForum.forums, rootPath, allSlugs);
		}
	});
} catch (error) {
	console.error('ForumMap validation failed:', error);
	throw error;
}
