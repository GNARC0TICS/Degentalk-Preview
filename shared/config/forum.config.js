"use strict";
// ForumMap Configuration - Single Source of Truth
// This file defines the canonical forum structure, themes, and rules for Degentalk
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forumMap = exports.DEFAULT_FORUM_RULES = exports.ZONE_TYPES = void 0;
exports.getForumBySlug = getForumBySlug;
// --- Type Definitions ---
exports.ZONE_TYPES = ['primary', 'general'];
// --- Theme Presets ---
var THEME_PRESETS = {
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
exports.DEFAULT_FORUM_RULES = {
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
var PRIMARY_ZONES = [
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
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { tippingEnabled: true, xpMultiplier: 2, availablePrefixes: ['[LIVE]', '[TRADE]', '[🔺UP]', '[🧂SALT]', '[🪦REKT]'], customRules: {
                        noStyleLocks: true,
                        xpBoostOnRedMarket: true
                    } })
            },
            {
                slug: 'shill-zone',
                name: 'Shill Zone',
                description: 'Pump your bags, shill your gems',
                position: 2,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { xpMultiplier: 0.5, tippingEnabled: true, allowAttachments: true })
            },
            {
                slug: 'the-salt-mines',
                name: 'The Salt Mines',
                description: 'Post your losses, complain about the market, rage.',
                position: 3,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { xpMultiplier: 0.25, tippingEnabled: false })
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
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false // Read-only
                 })
            },
            {
                slug: 'governance',
                name: 'Governance',
                description: 'Proposals, voting, and discussions about the future of Degentalk.',
                position: 2,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { accessLevel: 'level_10+', allowPolls: true })
            },
            {
                slug: 'feedback',
                name: 'Feedback & Suggestions',
                description: 'Provide feedback and suggest new features.',
                position: 3,
                rules: __assign({}, exports.DEFAULT_FORUM_RULES)
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
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { accessLevel: 'vip' })
            },
            {
                slug: 'alpha-lounge',
                name: 'Alpha Lounge',
                description: 'High-signal, low-noise discussion on actionable alpha.',
                position: 2,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { accessLevel: 'vip' })
            }
        ]
    }
];
var GENERAL_ZONES = [
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
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { xpEnabled: false })
            },
            {
                slug: 'faq',
                name: 'Frequently Asked Questions',
                description: 'Answers to common questions about the platform and trading.',
                position: 2,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false, xpEnabled: false })
            },
            {
                slug: 'tutorials',
                name: 'Tutorials',
                description: 'Learn about trading concepts, strategies, and tools.',
                position: 3,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false, xpEnabled: false })
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
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false })
            },
            {
                slug: 'hall-of-shame',
                name: 'Hall of Shame',
                description: 'The most spectacular airdrops to zero.',
                position: 2,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false })
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
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false, xpEnabled: false })
            },
            {
                slug: 'power-ups',
                name: 'Power-Ups',
                description: 'Boost your XP, tipping power, and other platform abilities.',
                position: 2,
                rules: __assign(__assign({}, exports.DEFAULT_FORUM_RULES), { allowPosting: false, xpEnabled: false })
            }
        ]
    }
];
// --- Final Export ---
exports.forumMap = __spreadArray(__spreadArray([], PRIMARY_ZONES, true), GENERAL_ZONES, true).sort(function (a, b) { return (a.position || 99) - (b.position || 99); });
// --- Validation Logic ---
// Ensure all forum slugs are unique across the entire map
function getSubforumSlugs(forums) {
    var slugs = [];
    for (var _i = 0, forums_1 = forums; _i < forums_1.length; _i++) {
        var forum = forums_1[_i];
        slugs.push(forum.slug);
        if (forum.forums) {
            slugs = slugs.concat(getSubforumSlugs(forum.forums));
        }
    }
    return slugs;
}
function validateForumSlugs(forums, parentPath) {
    var slugs = new Set();
    for (var _i = 0, forums_2 = forums; _i < forums_2.length; _i++) {
        var forum = forums_2[_i];
        var currentPath = "".concat(parentPath, " -> ").concat(forum.name, " (").concat(forum.slug, ")");
        if (slugs.has(forum.slug)) {
            throw new Error("Duplicate forum slug found: \"".concat(forum.slug, "\" at ").concat(currentPath));
        }
        slugs.add(forum.slug);
        if (forum.forums) {
            validateForumSlugs(forum.forums, currentPath);
        }
    }
}
function validateZoneSlugs(zones) {
    var slugs = new Set();
    for (var _i = 0, zones_1 = zones; _i < zones_1.length; _i++) {
        var zone = zones_1[_i];
        var currentPath = "Zone: ".concat(zone.name, " (").concat(zone.slug, ")");
        if (slugs.has(zone.slug)) {
            throw new Error("Duplicate zone slug found: \"".concat(zone.slug, "\""));
        }
        slugs.add(zone.slug);
        validateForumSlugs(zone.forums, currentPath);
    }
}
// Run validation on build
try {
    validateZoneSlugs(exports.forumMap);
}
catch (e) {
    console.error('ForumMap validation failed:', e);
}
// Function to get a forum by its slug from the map
function getForumBySlug(slug, zones) {
    if (zones === void 0) { zones = exports.forumMap; }
    for (var _i = 0, zones_2 = zones; _i < zones_2.length; _i++) {
        var zone = zones_2[_i];
        for (var _a = 0, _b = zone.forums; _a < _b.length; _a++) {
            var forum = _b[_a];
            if (forum.slug === slug) {
                return forum;
            }
            if (forum.forums) {
                var subForum = getForumBySlug(slug, [__assign(__assign({}, zone), { forums: forum.forums })]);
                if (subForum)
                    return subForum;
            }
        }
    }
    return undefined;
}
