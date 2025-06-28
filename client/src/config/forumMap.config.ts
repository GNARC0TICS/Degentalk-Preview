// ForumMap Configuration - Single Source of Truth
// This file defines the canonical forum structure, themes, and rules for Degentalk

// --- Type Definitions ---

export const ZONE_TYPES = ['primary', 'general'] as const;
export type ZoneType = (typeof ZONE_TYPES)[number];

export interface PrefixGrantRule {
	slug: string;
	autoAssign: boolean;
	condition?: {
		minReplies?: number;
		minLikes?: number;
		minXp?: number;
		role?: string;
	};
}

export interface ForumRules {
	// Core permissions
	allowPosting: boolean;
	xpEnabled: boolean;
	tippingEnabled: boolean;

	// XP configuration
	xpMultiplier?: number;

	// Access control
	accessLevel?: 'public' | 'registered' | 'level_10+' | 'vip' | 'mod' | 'admin';
	minXpRequired?: number;

	// Content features
	allowPolls?: boolean;
	allowTags?: boolean;
	allowAttachments?: boolean;

	// Prefix system
	availablePrefixes?: string[];
	prefixGrantRules?: PrefixGrantRule[];
	requiredPrefix?: boolean;

	// Custom behaviors
	customComponent?: string;
	customRules?: Record<string, unknown>;
}

export interface ForumTheme {
	// Visual identity
	color: string;
	icon: string;
	colorTheme: string; // CSS theme class

	// Assets
	bannerImage?: string;
	backgroundImage?: string;

	// Components
	landingComponent?: string;
	customStyles?: Record<string, string>;
}

export interface Forum {
	// Identity
	slug: string;
	name: string;
	description?: string;

	// Configuration
	rules: ForumRules;
	themeOverride?: Partial<ForumTheme>;

	// Metadata
	position?: number;
	tags?: string[];

	// ADDED: Represents child forums (subforums)
	// Only one level of subforum nesting is supported. No sub-sub-forums.
	forums?: Forum[];
}

export interface Zone {
	// Identity
	slug: string;
	name: string;
	description: string;

	// Type & hierarchy
	type: ZoneType;
	position?: number;

	// Configuration
	theme: ForumTheme;
	defaultRules?: Partial<ForumRules>; // Default rules for child forums

	// Child forums
	forums: Forum[];
}

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
	// Added export
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

// --- Zone Configurations ---

const PRIMARY_ZONES: Zone[] = [
	{
		slug: 'the-pit',
		name: 'The Pit',
		description:
			'The daily war-zone for raw market chatter, meme combat, instant wins & public rekt logs.',
		type: 'primary',
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
		type: 'primary',
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
						threadCreationLocked: ['mod', 'admin']
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
		type: 'primary',
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
		type: 'primary',
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
					allowPosting: false, // Staff only
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
		type: 'primary',
		position: 5,
		theme: THEME_PRESETS.archive,
		defaultRules: {
			allowPosting: false, // All threads auto-locked
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
	},
	{
		slug: 'degenshop',
		name: 'DegenShop™',
		description:
			'Cosmetic & utility marketplace: avatar frames, username glows, XP boosts, prefix unlocks.',
		type: 'general',
		position: 13,
		theme: THEME_PRESETS.shop,
		defaultRules: {
			allowPosting: false,
			xpEnabled: false,
			tippingEnabled: false
		},
		forums: [
			{
				slug: 'hot-items',
				name: 'Hot Items',
				description: 'Featured and trending shop items',
				position: 1,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					customComponent: 'HotItemsSlider',
					customRules: {
						purchaseEndpoint: '/api/shop/purchase',
						itemType: 'shop'
					}
				}
			},
			{
				slug: 'cosmetics-grid',
				name: 'Cosmetics Grid',
				description: 'All available cosmetic items and upgrades',
				position: 2,
				rules: {
					allowPosting: false,
					xpEnabled: false,
					tippingEnabled: false,
					customComponent: 'CosmeticsGrid',
					customRules: {
						categories: ['frames', 'glows', 'badges', 'titles'],
						doubleXPWeekends: true
					}
				}
			},
			{
				slug: 'wishlist-queue',
				name: 'Wishlist Queue',
				description: 'Community requested items and upcoming releases',
				position: 3,
				rules: {
					...DEFAULT_FORUM_RULES,
					xpEnabled: true,
					availablePrefixes: ['[REQUEST]', '[WISHLIST]', '[COMING-SOON]'],
					customRules: {
						voteForItems: true
					}
				}
			}
		]
	}
];

// ---------------------------------------------------------------------------
//  NEW: General Zone Wrapper (holds all standalone forums – does NOT render a
//       /zones/general page; it merely satisfies the Zone[] structure)
// ---------------------------------------------------------------------------

const GENERAL_ZONE_WRAPPER: Zone = {
	slug: 'general',
	name: 'General Forums',
	description: 'Default container for non-themed forums',
	type: 'general',
	position: 99,
	theme: {
		color: '#9CA3AF',
		icon: '🧱',
		colorTheme: 'theme-neutral'
	},
	forums: [
		// DeFi Laboratory (formerly a zone)
		{
			slug: 'defi-lab',
			name: 'DeFi Laboratory',
			description: 'DeFi protocols, yield farming, and strategies',
			rules: { ...DEFAULT_FORUM_RULES },
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
		// NFT District (formerly a zone)
		{
			slug: 'nft-district',
			name: 'NFT District',
			description: 'JPEGs, art, and digital collectibles',
			rules: { ...DEFAULT_FORUM_RULES },
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
		// Market Analysis (formerly a zone)
		{
			slug: 'market-analysis',
			name: 'Market Analysis',
			description: 'Technical analysis and market discussion',
			rules: { ...DEFAULT_FORUM_RULES },
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
	]
};

// --- Export Configuration ---

export const forumMap = {
	zones: [...PRIMARY_ZONES, GENERAL_ZONE_WRAPPER],

	// Helper methods
	getZoneBySlug: (slug: string) => forumMap.zones.find((z) => z.slug === slug),

	getForumBySlug: (slug: string) => {
		for (const zone of forumMap.zones) {
			const forum = zone.forums.find((f) => f.slug === slug);
			if (forum) return { forum, zone };
			// Search subforums one level deep
			for (const parentForum of zone.forums) {
				if (parentForum.forums) {
					const sub = parentForum.forums.find((sf) => sf.slug === slug);
					if (sub) return { forum: sub, zone };
				}
			}
		}
		return null;
	},

	getPrimaryZones: () => forumMap.zones.filter((z) => z.type === 'primary'),

	getGeneralZones: () => [GENERAL_ZONE_WRAPPER],

	// Config metadata
	version: '1.0.0',
	lastUpdated: new Date().toISOString()
};

// --- Validation ---

// Ensure unique slugs
const allSlugs = new Set<string>();

function validateForumSlugs(forums: Forum[], parentPath: string) {
	forums.forEach((forum) => {
		const currentPath = `${parentPath} > ${forum.name} (${forum.slug})`;
		if (allSlugs.has(forum.slug)) {
			throw new Error(
				`Duplicate forum slug detected: '${forum.slug}' at path: ${currentPath}. Slugs must be globally unique.`
			);
		}
		allSlugs.add(forum.slug);

		// Recursively validate subforums if they exist
		if (forum.forums && forum.forums.length > 0) {
			validateForumSlugs(forum.forums, currentPath);
		}
	});
}

forumMap.zones.forEach((zone) => {
	const zonePath = `Zone: ${zone.name} (${zone.slug})`;
	if (allSlugs.has(zone.slug)) {
		throw new Error(`Duplicate zone slug: ${zone.slug}`);
	}
	allSlugs.add(zone.slug);

	if (zone.forums && zone.forums.length > 0) {
		validateForumSlugs(zone.forums, zonePath);
	}
});
