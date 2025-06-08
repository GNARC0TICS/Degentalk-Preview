import { z } from 'zod';

/**
 * Forum rules configuration for per-forum rules, access control, thread/poll/posting rules, and category/zone registry.
 */

// -------------------- Thread Rules Section --------------------
/**
 * Thread creation and posting rules for a forum.
 */
export const ThreadRulesSchema = z.object({
    /** Allow users to post threads */
    allowUserPosts: z.boolean(),
    /** Require DGT to post */
    requireDGT: z.boolean().optional(),
    /** Allow polls in threads */
    allowPolls: z.boolean(),
    /** Allow unlocked styling in posts */
    unlockedStyling: z.boolean().optional(),
    /** Forum is read-only */
    readOnly: z.boolean().optional(),
});

export type ThreadRules = z.infer<typeof ThreadRulesSchema>;

// -------------------- Access Control Section --------------------
/**
 * Role-based access control for a forum.
 */
export const AccessControlSchema = z.object({
    /** Roles that can post */
    canPost: z.array(z.string()),
    /** Roles that can reply */
    canReply: z.array(z.string()),
    /** Roles that can view */
    canView: z.array(z.string()),
});

export type AccessControl = z.infer<typeof AccessControlSchema>;

// -------------------- SEO Section --------------------
/**
 * SEO configuration for a forum or zone.
 */
export const SEOConfigSchema = z.object({
    /** SEO title */
    title: z.string(),
    /** SEO description */
    description: z.string(),
    /** SEO category (optional) */
    category: z.string().optional(),
});

export type SEOConfig = z.infer<typeof SEOConfigSchema>;

// -------------------- Forum/Zone Config Section --------------------
/**
 * Forum or zone configuration object.
 */
export const ForumConfigSchema = z.object({
    /** Forum/zone ID */
    id: z.string(),
    /** Slug for URL */
    slug: z.string(),
    /** Forum type (primary/general/etc.) */
    forumType: z.string(),
    /** Display name */
    name: z.string(),
    /** Description */
    description: z.string().optional(),
    /** Thread rules */
    threadRules: ThreadRulesSchema,
    /** Access control */
    accessControl: AccessControlSchema,
    /** SEO config */
    seo: SEOConfigSchema,
    /** Display priority/order */
    displayPriority: z.number(),
    /** Theme (optional) */
    theme: z.string().optional(),
    /** Parent ID (optional) */
    parentId: z.string().optional(),
    /** Unrestricted thread per month (optional) */
    unrestrictedThreadPerMonth: z.boolean().optional(),
    /** Posting limits (optional) */
    postingLimits: z.any().optional(),
});

export type ForumConfig = z.infer<typeof ForumConfigSchema>;

// -------------------- Main Forum Rules Config --------------------
export const ForumRulesConfigSchema = z.object({
    forums: z.record(z.string(), ForumConfigSchema),
});

/**
 * Default forum rules config reflecting current hardcoded values (see zoneRegistry.ts, primaryZones.tsx, etc.).
 * Only a subset is shown here for brevity; expand as needed.
 */
export const forumRulesConfig = {
    forums: {
        'the-pit': {
            id: 'pz-001',
            slug: 'the-pit',
            forumType: 'primary',
            name: 'The Pit',
            description: 'Raw, unfiltered, and often unhinged. The proving ground for every user, no matter how wrecked.',
            threadRules: {
                allowUserPosts: true,
                allowPolls: true,
                unlockedStyling: true,
            },
            accessControl: {
                canPost: ['all'],
                canReply: ['all'],
                canView: ['all'],
            },
            seo: {
                title: 'The Pit - Degentalk',
                description: 'Raw, unfiltered, and often unhinged.',
            },
            displayPriority: 1,
            theme: 'pit-theme',
            unrestrictedThreadPerMonth: true,
        },
        'mission-control': {
            id: 'pz-002',
            slug: 'mission-control',
            forumType: 'primary',
            name: 'Mission Control',
            description: 'Official dispatches, challenge ops, and leaderboard briefings. Controlled by Admins & Mods.',
            threadRules: {
                allowUserPosts: false,
                allowPolls: true,
            },
            accessControl: {
                canPost: ['admin', 'mod'],
                canReply: ['all'],
                canView: ['all'],
            },
            seo: {
                title: 'Mission Control - Degentalk',
                description: 'Official dispatches, challenge ops, and leaderboard briefings.',
            },
            displayPriority: 2,
            theme: 'mission-theme',
        },
        // TODO: Add all other forums/zones from zoneRegistry.ts and primaryZones.tsx
    },
} as const; 