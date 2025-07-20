// ForumMap Configuration - Single Source of Truth
// This file defines the canonical forum structure, themes, and rules for Degentalk
// --- Type Definitions ---
export const ZONE_TYPES = ['primary', 'general'];
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
};
// --- Default Rules ---
export const DEFAULT_FORUM_RULES = {
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
const PRIMARY_ZONES = [
    {
        slug: 'the-pit',
        name: 'The Pit',
        description: 'The daily war-zone for raw market chatter, meme combat, instant wins & public rekt logs.',
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
                    xpMultiplier: 0.5,
                    tippingEnabled: true,
                    allowAttachments: true
                }
            },
            {
                slug: 'the-salt-mines',
                name: 'The Salt Mines',
                description: 'Post your losses, complain about the market, rage.',
                position: 3,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    xpMultiplier: 0.25,
                    tippingEnabled: false
                }
            }
        ]
    },
    {
        slug: 'mission-control',
        name: 'Mission Control',
        description: 'Central hub for project updates, announcements, and governance.',
        type: 'primary',
        position: 2,
        theme: THEME_PRESETS.mission,
        forums: [
            {
                slug: 'announcements',
                name: 'Announcements',
                description: 'Official announcements and project updates.',
                position: 1,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false // Read-only
                }
            },
            {
                slug: 'governance',
                name: 'Governance',
                description: 'Proposals, voting, and discussions about the future of Degentalk.',
                position: 2,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    accessLevel: 'level_10+',
                    allowPolls: true
                }
            },
            {
                slug: 'feedback',
                name: 'Feedback & Suggestions',
                description: 'Provide feedback and suggest new features.',
                position: 3,
                rules: {
                    ...DEFAULT_FORUM_RULES
                }
            }
        ]
    },
    {
        slug: 'casino-floor',
        name: 'Casino Floor',
        description: 'High-stakes discussion on market structure, macro trends, and deep alpha.',
        type: 'primary',
        position: 3,
        theme: THEME_PRESETS.casino,
        defaultRules: {
            tippingEnabled: true,
            accessLevel: 'vip'
        },
        forums: [
            {
                slug: 'macro-view',
                name: 'The Macro View',
                description: 'Long-term trends, economic analysis, and market cycles.',
                position: 1,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    accessLevel: 'vip'
                }
            },
            {
                slug: 'alpha-lounge',
                name: 'Alpha Lounge',
                description: 'High-signal, low-noise discussion on actionable alpha.',
                position: 2,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    accessLevel: 'vip'
                }
            }
        ]
    }
];
const GENERAL_ZONES = [
    {
        slug: 'briefing-room',
        name: 'The Briefing Room',
        description: 'Knowledge base, tutorials, and educational content for traders of all skill levels.',
        type: 'general',
        position: 4,
        theme: THEME_PRESETS.briefing,
        forums: [
            {
                slug: 'getting-started',
                name: 'Getting Started',
                description: 'New to Degentalk? Start here.',
                position: 1,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    xpEnabled: false
                }
            },
            {
                slug: 'faq',
                name: 'Frequently Asked Questions',
                description: 'Answers to common questions about the platform and trading.',
                position: 2,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false,
                    xpEnabled: false
                }
            },
            {
                slug: 'tutorials',
                name: 'Tutorials',
                description: 'Learn about trading concepts, strategies, and tools.',
                position: 3,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false,
                    xpEnabled: false
                }
            }
        ]
    },
    {
        slug: 'the-archive',
        name: 'The Archive',
        description: 'Archived forums and historical content.',
        type: 'general',
        position: 5,
        theme: THEME_PRESETS.archive,
        defaultRules: {
            allowPosting: false,
            xpEnabled: false
        },
        forums: [
            {
                slug: 'hall-of-fame',
                name: 'Hall of Fame',
                description: 'Legendary calls and epic moments.',
                position: 1,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false
                }
            },
            {
                slug: 'hall-of-shame',
                name: 'Hall of Shame',
                description: 'The most spectacular airdrops to zero.',
                position: 2,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false
                }
            }
        ]
    },
    {
        slug: 'the-shop',
        name: 'The DegenShop',
        description: 'Spend your hard-earned DGT on cosmetics, power-ups, and real-world items.',
        type: 'general',
        position: 6,
        theme: THEME_PRESETS.shop,
        forums: [
            {
                slug: 'cosmetics',
                name: 'Cosmetics',
                description: 'Customize your profile with unique badges, themes, and more.',
                position: 1,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false,
                    xpEnabled: false
                }
            },
            {
                slug: 'power-ups',
                name: 'Power-Ups',
                description: 'Boost your XP, tipping power, and other platform abilities.',
                position: 2,
                rules: {
                    ...DEFAULT_FORUM_RULES,
                    allowPosting: false,
                    xpEnabled: false
                }
            }
        ]
    }
];
// --- Final Export ---
export const forumMap = [...PRIMARY_ZONES, ...GENERAL_ZONES].sort((a, b) => (a.position || 99) - (b.position || 99));
// --- Validation Logic ---
// Ensure all forum slugs are unique across the entire map
function getSubforumSlugs(forums) {
    let slugs = [];
    for (const forum of forums) {
        slugs.push(forum.slug);
        if (forum.forums) {
            slugs = slugs.concat(getSubforumSlugs(forum.forums));
        }
    }
    return slugs;
}
function validateForumSlugs(forums, parentPath) {
    const slugs = new Set();
    for (const forum of forums) {
        const currentPath = `${parentPath} -> ${forum.name} (${forum.slug})`;
        if (slugs.has(forum.slug)) {
            throw new Error(`Duplicate forum slug found: "${forum.slug}" at ${currentPath}`);
        }
        slugs.add(forum.slug);
        if (forum.forums) {
            validateForumSlugs(forum.forums, currentPath);
        }
    }
}
function validateZoneSlugs(zones) {
    const slugs = new Set();
    for (const zone of zones) {
        const currentPath = `Zone: ${zone.name} (${zone.slug})`;
        if (slugs.has(zone.slug)) {
            throw new Error(`Duplicate zone slug found: "${zone.slug}"`);
        }
        slugs.add(zone.slug);
        validateForumSlugs(zone.forums, currentPath);
    }
}
// Run validation on build
try {
    validateZoneSlugs(forumMap);
}
catch (e) {
    console.error('ForumMap validation failed:', e);
}
// Function to get a forum by its slug from the map
export function getForumBySlug(slug, zones = forumMap) {
    for (const zone of zones) {
        for (const forum of zone.forums) {
            if (forum.slug === slug) {
                return forum;
            }
            if (forum.forums) {
                const subForum = getForumBySlug(slug, [{ ...zone, forums: forum.forums }]);
                if (subForum)
                    return subForum;
            }
        }
    }
    return undefined;
}
